const express = require('express');
const router = express.Router();
const todayLeaveController = require('../controllers/todayLeaveController');

router.get('/today-leave', todayLeaveController.getTodayLeave);

module.exports = router;