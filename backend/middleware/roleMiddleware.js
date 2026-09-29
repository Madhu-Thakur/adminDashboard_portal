const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    

    const userRole = req.user.role?.toUpperCase();

    const hasAccess = allowedRoles
      .map((role) => role.toUpperCase())
      .includes(userRole);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;