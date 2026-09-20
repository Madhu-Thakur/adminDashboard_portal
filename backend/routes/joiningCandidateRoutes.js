 const express = require("express");
const multer = require("multer");

const {
  addJoiningCandidate,
  getJoiningCandidates,
  getJoiningCandidate,
  editJoiningCandidate,
  removeJoiningCandidate,
} = require("../controllers/joiningCandidateControllers");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const joiningCandidateUpload = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "degree", maxCount: 1 },
  { name: "aadharc", maxCount: 1 },
  { name: "sslip", maxCount: 1 },
  { name: "passbook", maxCount: 1 },
]);
 
router.post(
  "/join-candidate",
  joiningCandidateUpload,
  addJoiningCandidate
);

// Our GET APIs
router.get("/joining-candidates", getJoiningCandidates);
router.get("/joining-candidates/:id", getJoiningCandidate);

// Existing update/delete APIs
router.put(
  "/joining-candidates/:id",
  joiningCandidateUpload,
  editJoiningCandidate
);

router.delete("/joining-candidates/:id", removeJoiningCandidate);

module.exports = router;