const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const authenticateToken = (req, res, next) => {
    // Get token from cookie
    // console.log(req.cookies)
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Add user data to request object
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateToken;