const express = require("express");
const router = express.Router();

const authControllers = require("../controllers/authControllers");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Login
router.post("/auth/login", authControllers.login);

// Forgot Password
router.post(
  "/auth/forgot-password",
  authControllers.forgotPassword
);

// Verify OTP
router.post(
  "/auth/verify-otp",
  authControllers.verifyOTP
);

// Reset Password
router.post(
  "/auth/reset-password",
  authControllers.resetPassword
);

// Refresh access token
router.post(
  "/auth/refresh",
  authControllers.refreshAccessToken
);

// Get current logged-in user
router.get(
  "/auth/me",
  authMiddleware,
  authControllers.getMe
);

router.post("/auth/logout", authControllers.logout);
 
// ADMIN + STAFF can access
router.get(
  "/auth/test-admin-staff",
  authMiddleware,
  roleMiddleware("ADMIN", "STAFF"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "You have ADMIN/STAFF access",
      user: req.user,
    });
  }
);

// Only ADMIN can access
router.get(
  "/auth/test-admin",
  authMiddleware,
  roleMiddleware("ADMIN"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "You have ADMIN access",
      user: req.user,
    });
  }
);


module.exports = router;