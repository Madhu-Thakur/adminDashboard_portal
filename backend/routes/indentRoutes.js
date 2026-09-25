const express = require("express");
const router = express.Router();
const indentController = require("../controllers/indentController");

// POST /api/indent
router.post("/indent", indentController.createIndent);

// GET /api/indent?email=user@mail.com 
router.get("/indent", indentController.getIndents);

// NEW -> GET /api/indent/:id 
router.get("/indent/:id", indentController.getIndentsByUserId);

// PUT /api/indent/:id/status
router.put("/indent/:id/status", indentController.updateIndentStatus);

// DELETE /api/indent/:id
router.delete("/indent/:id", indentController.deleteIndent);

module.exports = router;