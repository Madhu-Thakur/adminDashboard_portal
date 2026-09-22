const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary-v2");
const cloudinary = require("cloudinary").v2;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "deem_selfies",
    allowed_formats: ["jpg", "jpeg", "png"],
    // FIX: 
    public_id: (req, file) => {
      return `attendance-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    },
    transformation: [
      {
        width: 720,
        height: 1280,
        crop: "limit",
        quality: "auto:good",
        fetch_format: "jpg"
      }
    ]
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// 
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error("MULTER ERROR:", err);
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.post("/attendance", handleUpload, attendanceController.punch);
router.get("/attendance/:eid", attendanceController.getAttendance);
router.delete("/attendance/:eid/:date", attendanceController.deleteAttendance);

module.exports = router;