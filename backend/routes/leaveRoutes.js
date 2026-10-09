const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

router.get("/leave/leave-balance/:eid", leaveController.getLeaveBalance);
router.post('/leave/apply', leaveController.applyLeave);
router.put('/leave/:eid/:id/withdraw', leaveController.withdrawLeave);
router.get('/leave/:eid', leaveController.getLeaves);



module.exports = router;