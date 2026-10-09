const express = require("express");

const {
  addVoucher,
  getVouchers,
  getAvailableSaleInvoicesList,
  getAvailablePurchasesList,
} = require("../controllers/voucherControllers");

const router = express.Router();

router.post("/", addVoucher);

router.get("/", getVouchers);

router.get("/available-invoices", getAvailableSaleInvoicesList);

router.get("/available-purchases", getAvailablePurchasesList);

module.exports = router;