const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const authMiddleware = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader?.split(' ')[1]

    if (!token) {
    console.log("reached here now");
        return res.status(401).json({
            status: 401,
            data:null, 
            message: 'Unauthorized Access',
            error: null 
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        
        next();
    } catch (error) {
        return res.status(401).json({
            status: 401,
            data:null, 
            message: 'Token Expired',
            error: null 
        });
    }
};

module.exports = authMiddleware;