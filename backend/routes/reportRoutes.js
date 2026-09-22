const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');


router.post('/report', reportController.submitReport);
router.get('/report/:email', reportController.getReports);
router.delete('/report/all/:email', reportController.deleteAllReports);

module.exports = router;