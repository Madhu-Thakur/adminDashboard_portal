const express = require('express');
const router = express.Router();
const { getReportingManager } = require('../controllers/managerController');

// GET /api/manager/rm/:email -> divya@gmail.com  RM
router.get('/manager/rm/:email', getReportingManager);
router.get('/manager/rm', getReportingManager); // 

module.exports = router;