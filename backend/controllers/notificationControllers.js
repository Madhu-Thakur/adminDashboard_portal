const {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} = require("../models/notificationModel");

const { getAllRoles } = require("../models/roleModel");
 
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

// Add Notification
const addNotification = async (req, res) => {
  try {
    const {
      title,
      notify,
      role,
      status,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (String(title).trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Title must not exceed 100 characters",
      });
    }

    if (!notify || !String(notify).trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification is required",
      });
    }

    const roles = await validateRoles(role);

    if (!roles || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid role is required",
      });
    }

    const result = await createNotification(
      String(title).trim(),
      notify,
      roles.join(","),
      status ?? 1
    );

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: {
        id: result.insertId,
      },
    });
  } catch (error) {
    console.error("Add Notification Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
};

// Get All Notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await getAllNotifications();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// Get Notification By ID
const getNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await getNotificationById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Get Notification Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
    });
  }
};

// Edit Notification
const editNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      notify,
      role,
      status,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (String(title).trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Title must not exceed 100 characters",
      });
    }

    if (!notify || !String(notify).trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification is required",
      });
    }

    const roles = await validateRoles(role);

    if (!roles || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid role is required",
      });
    }

    const existingNotification =
      await getNotificationById(id);

    if (!existingNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const result = await updateNotification(
      id,
      String(title).trim(),
      notify,
      roles.join(","),
      status ?? existingNotification.status
    );

    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Edit Notification Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

// Delete Notification
const removeNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const existingNotification =
      await getNotificationById(id);

    if (!existingNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await deleteNotification(id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

module.exports = {
  addNotification,
  getNotifications,
  getNotification,
  editNotification,
  removeNotification,
};