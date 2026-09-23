const {
  createJoiningCandidate,
  getAllJoiningCandidates,
  getJoiningCandidateById,
  updateJoiningCandidate,
  deleteJoiningCandidate,
  saveCandidateAsEmployee,
} = require("../models/joiningCandidateModel");

const cloudinary = require("../config/cloudinary");

const DOCUMENT_FIELDS = [
  "photo",
  "resume",
  "degree",
  "aadharc",
  "sslip",
  "passbook",
];

// Upload file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `deem/joining/${folder}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    stream.end(fileBuffer);
  });
};

// Upload all joining candidate documents
const uploadJoiningDocuments = async (files) => {
  const uploadedDocuments = {
    photo: "",
    resume: "",
    degree: "",
    aadharc: "",
    sslip: "",
    passbook: "",
  };

  if (!files) {
    return uploadedDocuments;
  }

  for (const field of DOCUMENT_FIELDS) {
    if (files[field] && files[field][0]) {
      const result = await uploadToCloudinary(
        files[field][0].buffer,
        field,
      );

      uploadedDocuments[field] = result.secure_url;
    }
  }

  return uploadedDocuments;
};

// Validate Joining Candidate
const validateJoiningCandidatePayload = (payload) => {
  const {
    ename,
    fname,
    mobile,
    email,
    aadhar,
    gender,
    mstatus,
    status,
  } = payload;

  if (!ename || !fname || !mobile || !email || !gender || !mstatus) {
    return "Employee name, father name, mobile, email, gender and marital status are required";
  }

  const mobileValue = String(mobile).trim();

  if (!/^[+\d][\d\s-]{7,14}$/.test(mobileValue)) {
    return "Mobile must be a valid phone number";
  }

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
  ) {
    return "Email must be a valid email address";
  }

  if (aadhar && !/^\d{12}$/.test(String(aadhar).trim())) {
    return "Aadhar must be exactly 12 digits";
  }

  if (
    status !== undefined &&
    status !== null &&
    status !== "" &&
    ![0, 1, "0", "1"].includes(status)
  ) {
    return "Status must be 0 or 1";
  }

  return null;
};
 
// POST - Create Joining Candidate
const addJoiningCandidate = async (req, res) => {
  try {
    const {
      ename,
      fname,
      dob,
      gender,
      address,
      mobile,
      email,
      aadhar,
      mstatus,
      qual,
      hstudy,
      linkedin,
      pexp,
    } = req.body;

    // Same validation as Divya's POST
    if (!ename || !mobile || !email) {
      return res.status(400).json({
        success: false,
        message: "ename, mobile, email required",
      });
    }

    // Upload files to Cloudinary
    const uploadedDocuments = await uploadJoiningDocuments(req.files);
 
    const last_update = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Save data into OUR MySQL database
    const candidateId = await createJoiningCandidate({
      ename,
      fname,
      dob,
      gender,
      address,
      mobile,
      email,
      aadhar,
      mstatus,
      qual,
      hstudy,
      linkedin,
      pexp,

      // Cloudinary URLs
      ...uploadedDocuments,

      status: 0,

      // Save current timestamp
      last_update,
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted",
      id: candidateId,
    });
  } catch (error) {
    console.error("Create Joining Candidate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET - All Joining Candidates
const getJoiningCandidates = async (req, res) => {
  try {
    const candidates = await getAllJoiningCandidates();

    return res.status(200).json({
      success: true,
      message: "Joining candidates fetched successfully",
      data: candidates,
    });
  } catch (error) {
    console.error("Get Joining Candidates Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch joining candidates",
      error: error.message,
    });
  }
};

// GET - Joining Candidate By ID
const getJoiningCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Joining candidate ID is required",
      });
    }

    const candidate = await getJoiningCandidateById(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Joining candidate not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Joining candidate fetched successfully",
      data: candidate,
    });
  } catch (error) {
    console.error("Get Joining Candidate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch joining candidate",
      error: error.message,
    });
  }
};

// PUT - Update Joining Candidate
const editJoiningCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Joining candidate ID is required",
      });
    }

    const existing = await getJoiningCandidateById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Joining candidate not found",
      });
    }

    const validationError = validateJoiningCandidatePayload(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const uploadedDocuments = await uploadJoiningDocuments(req.files);

    const updatedData = {
      ...req.body,

      photo: uploadedDocuments.photo || existing.photo,
      resume: uploadedDocuments.resume || existing.resume,
      degree: uploadedDocuments.degree || existing.degree,
      aadharc: uploadedDocuments.aadharc || existing.aadharc,
      sslip: uploadedDocuments.sslip || existing.sslip,
      passbook: uploadedDocuments.passbook || existing.passbook,

      pexp: req.body.pexp || existing.pexp,
    };

    const result = await updateJoiningCandidate(id, updatedData);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Joining candidate not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Joining candidate updated successfully",
    });
  } catch (error) {
    console.error("Update Joining Candidate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update joining candidate",
      error: error.message,
    });
  }
};

// DELETE - Joining Candidate
const removeJoiningCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Joining candidate ID is required",
      });
    }

    const result = await deleteJoiningCandidate(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Joining candidate not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Joining candidate deleted successfully",
    });
  } catch (error) {
    console.error("Delete Joining Candidate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete joining candidate",
      error: error.message,
    });
  }
};

// POST - Save Joining Candidate as Employee
const convertCandidateToEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { designationId } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Joining candidate ID is required",
      });
    }

    if (!designationId) {
      return res.status(400).json({
        success: false,
        message: "Designation is required",
      });
    }

    const employeeId = await saveCandidateAsEmployee(
      id,
      designationId
    );

    return res.status(201).json({
      success: true,
      message: "Candidate saved as employee successfully",
      employeeId,
    });

  } catch (error) {
    console.error("Save Candidate As Employee Error:", error);

    if (error.message === "Joining candidate not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Designation not found" ||
      error.message === "Candidate is already an employee"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to save candidate as employee",
      error: error.message,
    });
  }
};

module.exports = {
  addJoiningCandidate,
  getJoiningCandidates,
  getJoiningCandidate,
  editJoiningCandidate,
  removeJoiningCandidate,
 convertCandidateToEmployee,
};