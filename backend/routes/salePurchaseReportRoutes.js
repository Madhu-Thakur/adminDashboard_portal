const express = require("express");

const {
  fetchSalePurchaseReport,
} = require("../controllers/salePurchaseReportController");

const router = express.Router();

// GET Sale & Purchase Report
router.get("/", fetchSalePurchaseReport);

module.exports = router;