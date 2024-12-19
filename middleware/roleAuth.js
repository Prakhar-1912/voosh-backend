// src/middlewares/roleAuth.js

const roleAuth = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      console.log(req.user.role);
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Access denied. Insufficient permissions' 
        });
      }
      next();
    };
  };
  
  module.exports = roleAuth;