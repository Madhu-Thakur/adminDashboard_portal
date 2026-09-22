const express = require('express');
const router = express.Router();
const birthdayController = require('../controllers/birthdayController');

router.get('/today-birthday', birthdayController.getTodayBirthday);

module.exports = router;