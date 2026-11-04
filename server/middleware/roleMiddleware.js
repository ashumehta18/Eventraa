// server/middleware/roleMiddleware.js

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    if (req.user.role !== role) return res.status(403).json({ message: "Forbidden — insufficient role" });
    next();
  };
};

// Export as named export
module.exports = { authorizeRole };
