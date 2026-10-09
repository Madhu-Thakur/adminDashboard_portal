const express = require("express");
const multer = require("multer");

const {
  addPurchase,
  getPurchases,
  getPurchase,
} = require("../controllers/purchaseController");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/", upload.single("file"), addPurchase);

router.get("/", getPurchases);

router.get("/:id", getPurchase);

module.exports = router;