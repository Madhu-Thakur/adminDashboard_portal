const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const crypto = require("crypto");

const {
  saveOTP,
  verifyOTP,
  isOTPVerified,
  removeOTP,
} = require("../utils/otpStore");

const { sendOTPEmail } = require("../utils/mailService");

const userModel = require("../models/userModel");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");

 

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find user
    const user = await userModel.findUserByUsername(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Check account status
    if (user.status !== 1) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    let isPasswordValid = false;
    let isLegacyPassword = false;

    /*
      1. Check if password is already bcrypt
      2. Otherwise check old MD5 password
    */

    if (
      user.password?.startsWith("$2a$") ||
      user.password?.startsWith("$2b$") ||
      user.password?.startsWith("$2y$")
    ) {
      // New bcrypt password
      isPasswordValid = await bcrypt.compare(
        password,
        user.password
      );
    } else {
      // Existing legacy MD5 password
      isPasswordValid = md5(password) === user.password;
      isLegacyPassword = isPasswordValid;
    }

    // Password incorrect
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    /*
      If old MD5 password was correct,
      convert it to bcrypt immediately.
    */
    if (isLegacyPassword) {
      const newHashedPassword = await bcrypt.hash(password, 12);

      await userModel.updateUserPassword(
        user.id,
        newHashedPassword
      );
    }

    // Normalize role
    const role = user.role?.toUpperCase();

    const accessToken = generateAccessToken({
      id: user.id,
      role: role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
    });

    // Access token cookie - 5 minutes
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 60 * 1000,
    });

    // Refresh token cookie - 1 day
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send safe user information
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.emp_name,
        username: user.username,
        role: role,
        branch: user.bname,
        file: user.file,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ======================================================
// REFRESH ACCESS TOKEN
// ======================================================

exports.refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // Find user using userId from refresh token
    const user = await userModel.findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Check account status
    if (user.status !== 1) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const role = user.role?.toUpperCase();

    const newAccessToken = generateAccessToken({
      id: user.id,
      role: role,
    });

    // New access token - 5 minutes
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};


// ======================================================
// GET CURRENT USER
// ======================================================

exports.getMe = async (req, res) => {
  try {
    const user = await userModel.findUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.emp_name,
        username: user.username,
        role: user.role?.toUpperCase(),
        branch: user.bname,
        file: user.file,
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

 
exports.logout = async (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

 
exports.forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const user = await userModel.findUserByUsername(username);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== 1) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // Generate secure 6-digit OTP
    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // Store OTP temporarily
    saveOTP(username, otp);

    // Send OTP through email only when enabled
    if (process.env.OTP_EMAIL_ENABLED === "true") {
      await sendOTPEmail(username, otp);
    } else {
      // Development mode
      console.log(
        `DEV Password Reset OTP for ${username}: ${otp}`
      );
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
 

exports.verifyOTP = async (req, res) => {
  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      return res.status(400).json({
        success: false,
        message: "Username and OTP are required",
      });
    }

    const result = verifyOTP(
      username,
      otp.toString()
    );

    if (!result.success) {

      // OTP expired
      if (result.reason === "otp_expired") {
        return res.status(400).json({
          success: false,
          message: "OTP has expired",
        });
      }

      // OTP not found
      if (result.reason === "otp_not_found") {
        return res.status(400).json({
          success: false,
          message:
            "OTP not found. Please request a new OTP",
        });
      }

      // Too many attempts
      if (result.reason === "too_many_attempts") {
        return res.status(429).json({
          success: false,
          message:
            "Too many incorrect OTP attempts. Please request a new OTP",
        });
      }

      // Invalid OTP
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

 

exports.resetPassword = async (req, res) => {
  try {
    const {
      username,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!username || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Username, new password and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long",
      });
    }

    // Check whether OTP was successfully verified
    const otpVerified = isOTPVerified(username);

    if (!otpVerified) {
      return res.status(401).json({
        success: false,
        message: "OTP verification required",
      });
    }

    // Find user
    const user = await userModel.findUserByUsername(username);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    // Update password
    await userModel.updateUserPassword(
      user.id,
      hashedPassword
    );

    // Remove OTP after successful password reset
    removeOTP(username);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};