const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const authMiddleware = (req, res, next) => {
    // Get token from cookie
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;