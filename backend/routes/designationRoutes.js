const express = require("express");

const {
  addDesignation,
  getDesignations,
  getDesignation,
  editDesignation,
  removeDesignation,
} = require("../controllers/designationControllers");

const router = express.Router();

router.post("/", addDesignation);

router.get("/", getDesignations);

router.get("/:id", getDesignation);

router.put("/:id", editDesignation);

// Delete Designation
router.delete("/:id", removeDesignation);

module.exports = router;
