const {
  createDesignation,
  getAllDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
} = require("../models/designationModel");

const addDesignation = async (req, res) => {
  try {
    const { des } = req.body;

    if (!des || !String(des).trim()) {
      return res.status(400).json({
        success: false,
        message: "Designation is required",
      });
    }

    const designationId = await createDesignation({
      des: String(des).trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Designation created successfully",
      data: {
        id: designationId,
      },
    });
  } catch (error) {
    console.error("Create Designation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create designation",
      error: error.message,
    });
  }
};

const getDesignations = async (req, res) => {
  try {
    const designations = await getAllDesignations();

    return res.status(200).json({
      success: true,
      message: "Designations fetched successfully",
      data: designations,
    });
  } catch (error) {
    console.error("Get Designations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch designations",
      error: error.message,
    });
  }
};

// Get Designation By ID
const getDesignation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Designation ID is required",
      });
    }

    const designation = await getDesignationById(id);

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Designation fetched successfully",
      data: designation,
    });
  } catch (error) {
    console.error("Get Designation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch designation",
      error: error.message,
    });
  }
};

// Update Designation
const editDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { des } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Designation ID is required",
      });
    }

    if (!des || !String(des).trim()) {
      return res.status(400).json({
        success: false,
        message: "Designation is required",
      });
    }

    const result = await updateDesignation(id, {
      des: String(des).trim(),
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Designation updated successfully",
    });
  } catch (error) {
    console.error("Update Designation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update designation",
      error: error.message,
    });
  }
};

// Delete Designation
const removeDesignation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Designation ID is required",
      });
    }

    const result = await deleteDesignation(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Designation deleted successfully",
    });
  } catch (error) {
    console.error("Delete Designation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete designation",
      error: error.message,
    });
  }
};

module.exports = {
  addDesignation,
  getDesignations,
  getDesignation,
  editDesignation,
  removeDesignation,
};
