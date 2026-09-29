const otpStore = new Map();

const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

// Save OTP temporarily
const saveOTP = (key, otp) => {
  otpStore.set(key, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY,
    verified: false,
    attempts: 0,
  });
};

// Verify OTP
const verifyOTP = (key, otp) => {
  const data = otpStore.get(key);

  if (!data) {
    return {
      success: false,
      reason: "otp_not_found",
    };
  }

  // Check OTP expiry
  if (Date.now() > data.expiresAt) {
    otpStore.delete(key);

    return {
      success: false,
      reason: "otp_expired",
    };
  }

  // Check OTP
  if (data.otp !== otp) {
    data.attempts += 1;

    // Maximum attempts reached
    if (data.attempts >= MAX_OTP_ATTEMPTS) {
      otpStore.delete(key);

      return {
        success: false,
        reason: "too_many_attempts",
      };
    }

    return {
      success: false,
      reason: "invalid_otp",
    };
  }

  // OTP verified successfully
  data.verified = true;

  return {
    success: true,
  };
};

// Check whether OTP has been verified
const isOTPVerified = (key) => {
  const data = otpStore.get(key);

  if (!data) {
    return false;
  }

  // Check expiry
  if (Date.now() > data.expiresAt) {
    otpStore.delete(key);
    return false;
  }

  return data.verified === true;
};

// Remove OTP
const removeOTP = (key) => {
  otpStore.delete(key);
};

module.exports = {
  saveOTP,
  verifyOTP,
  isOTPVerified,
  removeOTP,
};