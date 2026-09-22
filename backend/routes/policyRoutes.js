const express = require("express");
const router = express.Router();
const policyController = require("../controllers/policyController");

router.get("/policy", policyController.getAllPolicy);
router.get("/policy/:id", policyController.getPolicyById);
router.post("/policy", policyController.createPolicy);
router.put("/policy/:id", policyController.updatePolicy);
router.delete("/policy/:id", policyController.deletePolicy);

module.exports = router;