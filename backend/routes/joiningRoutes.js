const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/joiningController');

// 
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const cpUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'degree', maxCount: 1 },
  { name: 'aadharc', maxCount: 1 },
  { name: 'sslip', maxCount: 1 },
  { name: 'passbook', maxCount: 1 },
]);

router.post('/join-candidate', cpUpload, controller.createJoinCandidate);
router.get('/join-candidate', controller.getAllCandidates);
router.get('/join-candidate/:id', controller.getCandidateById);
router.put('/join-candidate/:id/status', controller.updateStatus);
router.delete('/join-candidate/:id', controller.deleteCandidate);

module.exports = router;