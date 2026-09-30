const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get access token from HTTP-only cookie
    // const accessToken = req.cookies?.access_token;

    let accessToken = req.cookies?.access_token;

    if (!accessToken) {
      const authHeader = req.headers.authorization;

      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.split(" ")[1];
      }
    }

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
 
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
