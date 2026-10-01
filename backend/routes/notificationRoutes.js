const express = require("express");

const {
  addNotification,
  getNotifications,
  getNotificationsByRole,   // added this line to import the new function
  getNotification,
  editNotification,
  removeNotification,
} = require("../controllers/notificationControllers");

const router = express.Router();

 
router.post("/", addNotification);

 
router.get("/", getNotifications);

router.get("/role/:role", getNotificationsByRole); // added this line to handle fetching notifications by role

 
router.get("/:id", getNotification);
 
router.put("/:id", editNotification);

 
router.delete("/:id", removeNotification);

module.exports = router;