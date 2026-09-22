const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

router.get("/leave/leave-balance/:eid", leaveController.getLeaveBalance);
router.get('/leave/leave-balance/:email', leaveController.getEidByEmail);
router.post('/leave/apply', leaveController.applyLeave);
router.get('/leave/:eid', leaveController.getLeaves);



module.exports = router;