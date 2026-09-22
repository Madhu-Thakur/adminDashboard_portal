const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Personal Detail
// GET /api/profile/personal/:identifier
router.get('/profile/personal/:identifier', profileController.getPersonalDetail);

// Official Detail
// GET /api/profile/official/:identifier
router.get('/profile/official/:identifier', profileController.getOfficialDetail);


router.post('/change-password', profileController.changePassword);

module.exports = router;

module.exports = router;