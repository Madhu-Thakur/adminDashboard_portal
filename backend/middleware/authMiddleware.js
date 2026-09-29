const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get access token from HTTP-only cookie
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify access token
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET
    );

    // Store decoded user information in request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

module.exports = authMiddleware;