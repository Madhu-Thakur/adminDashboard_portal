const express = require('express');
const router = express.Router();
const meetController = require('../controllers/meetController');

// bina id ke - direct meeting link
router.get('//meet/meeting', meetController.getAllMeeting);

// id/eid se - purana wala bhi kaam karega
router.get('/meet/:id/meeting', meetController.getMeeting);

module.exports = router;