const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../models/announcementModel");

const {
  getWorkingEmployeesByRole,
} = require("../models/employeeRecipientModel");

const {
  sendAnnouncementMail,
} = require("../services/notificationMailService");


const { getAllRoles } = require("../models/roleModel");

const ALLOWED_TYPES = ["message", "alert"];

// Validate Role IDs From Roles Table
const validateRoles = async (role) => {
  if (!role) {
    return null;
  }

  let roles;

  if (Array.isArray(role)) {
    roles = role;
  } else {
    roles = String(role)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  roles = roles
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item));

  if (roles.length === 0) {
    return null;
  }

  const allowedRoles = await getAllRoles();

  const allowedRoleIds = allowedRoles.map((item) => Number(item.id));

  const invalidRoles = roles.filter(
    (item) => !allowedRoleIds.includes(item)
  );

  if (invalidRoles.length > 0) {
    return null;
  }

  return roles;
};

// Add Announcement
const addAnnouncement = async (req, res) => {
  try {
    const {
      announce,
      role,
      type,
      expiry_date,
      expiry_time,
      status,
    } = req.body;

    if (!announce || !String(announce).trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement is required",
      });
    }

    const roles = await validateRoles(role);

    if (!roles || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid role is required",
      });
    }

    const announcementType = String(type || "message").toLowerCase();

    if (!ALLOWED_TYPES.includes(announcementType)) {
      return res.status(400).json({
        success: false,
        message: "Type must be Message or Alert",
      });
    }
 
const result = await createAnnouncement(
  String(announce).trim(),
  roles.join(","),
  announcementType,
  expiry_date || null,
  expiry_time || null,
  status ?? 1
);

// Send announcement email to working employees
try {
  const employeesMap = new Map();

  for (const roleId of roles) {
    const employees = await getWorkingEmployeesByRole(roleId);

    for (const employee of employees) {
      if (
        employee.email &&
        !employeesMap.has(employee.email.toLowerCase())
      ) {
        employeesMap.set(
          employee.email.toLowerCase(),
          employee
        );
      }
    }
  }

  const employees = Array.from(employeesMap.values());

  await Promise.all(
    employees.map((employee) =>
      sendAnnouncementMail({
        employeeName: employee.ename,
        employeeEmail: employee.email,
        message: announce,
        type: announcementType,
      })
    )
  );

  console.log(
    `Announcement emails processed for ${employees.length} employee(s)`
  );
} catch (mailError) {
  console.error(
    "Announcement Email Error:",
    mailError.message
  );
}

res.status(201).json({
  success: true,
  message: "Announcement created successfully",
  data: {
    id: result.insertId,
  },
});


  } catch (error) {
    console.error("Add Announcement Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
};

 
// Get All Announcements
const getAnnouncements = async (req, res) => {
  try {
    const { role } = req.query;

    const announcements = await getAllAnnouncements();

    // Only active announcements
    let filteredAnnouncements = announcements.filter(
      (announcement) => Number(announcement.status) === 1
    );

    // Filter by role
    if (role) {
      if (!Number.isInteger(Number(role))) {
        return res.status(400).json({
          success: false,
          message: "Valid role ID is required",
        });
      }

      filteredAnnouncements = filteredAnnouncements.filter((announcement) => {
        if (!announcement.role) return false;

        const roles = String(announcement.role)
          .split(",")
          .map((item) => item.trim());

        return (
          roles.includes(String(role)) ||
          String(announcement.role).toLowerCase() === "all"
        );
      });
    }

    // Remove expired announcements
    const now = new Date();

    filteredAnnouncements = filteredAnnouncements.filter((announcement) => {
      // No expiry date means announcement does not expire
      if (!announcement.expiry_date) {
        return true;
      }

      let expiryDate;

      // MySQL DATE may come as a JavaScript Date object
      if (announcement.expiry_date instanceof Date) {
        expiryDate = announcement.expiry_date
          .toISOString()
          .split("T")[0];
      } else {
        expiryDate = String(announcement.expiry_date)
          .split("T")[0];
      }

      const expiryTime = announcement.expiry_time || "23:59:59";

      const expiryDateTime = new Date(
        `${expiryDate}T${expiryTime}`
      );

      return expiryDateTime >= now;
    });

    res.status(200).json({
      success: true,
      data: filteredAnnouncements,
    });
  } catch (error) {
    console.error("Get Announcements Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};
 
// Get Announcement By ID
const getAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await getAnnouncementById(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Get Announcement Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch announcement",
    });
  }
};

// Edit Announcement
const editAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      announce,
      role,
      type,
      expiry_date,
      expiry_time,
      status,
    } = req.body;

    if (!announce || !String(announce).trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement is required",
      });
    }

    const roles = await validateRoles(role);

    if (!roles || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid role is required",
      });
    }

    const announcementType = String(type || "message").toLowerCase();

    if (!ALLOWED_TYPES.includes(announcementType)) {
      return res.status(400).json({
        success: false,
        message: "Type must be Message or Alert",
      });
    }

    const existingAnnouncement = await getAnnouncementById(id);

    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    const result = await updateAnnouncement(
      id,
      String(announce).trim(),
      roles.join(","),
      announcementType,
      expiry_date || null,
      expiry_time || null,
      status ?? existingAnnouncement.status
    );

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Edit Announcement Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update announcement",
    });
  }
};

// Delete Announcement
const removeAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAnnouncement = await getAnnouncementById(id);

    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await deleteAnnouncement(id);

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete Announcement Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
};

module.exports = {
  addAnnouncement,
  getAnnouncements,
  getAnnouncement,
  editAnnouncement,
  removeAnnouncement,
};