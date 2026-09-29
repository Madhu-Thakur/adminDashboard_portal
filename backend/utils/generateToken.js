const jwt = require("jsonwebtoken");

// Generate short-lived access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "5m",
    }
  );
};

// Generate long-lived refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};