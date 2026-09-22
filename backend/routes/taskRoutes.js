const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// GET /api/task?email=user@mail.com
router.get('/task', taskController.getTasks);

// PUT /api/task -> only for status update
router.put('/task', taskController.updateTaskStatus);

module.exports = router;