// controllers/auth.controller.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');

// Cookie configuration
const COOKIE_OPTIONS = {
    httpOnly: true, // Prevents client-side access to the cookie
    secure: process.env.NODE_ENV === 'production', // Only sends cookie over HTTPS in production
    sameSite: 'strict', // Protects against CSRF
    maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

// Helper functions remain the same
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

const isValidUsername = (username) => {
    return typeof username === 'string' &&
        username.length >= 3 &&
        username.length <= 30 &&
        !username.includes('@');
};

const getIdentifierType = (identifier) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobilePattern = /^\d{10,15}$/;

    if (emailPattern.test(identifier)) {
        return 'email';
    } else if (mobilePattern.test(identifier)) {
        return 'mobile';
    } else if (identifier.includes('@')) {
        throw new Error('Invalid identifier format');
    } else {
        return 'username';
    }
};

// Modified controller methods
exports.register = async (req, res, next) => {
    try {
        const { username, email, mobile, password } = req.body;

        if (!isValidUsername(username)) {
            return res.status(400).json({
                message: 'Invalid username format. Username should not contain @ symbol and should be between 3-30 characters'
            });
        }

        const existingUser = await User.findOne({
            $or: [{ username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with these credentials'
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = new User({
            username,
            email,
            mobile,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Set JWT token in cookie
        res.cookie('token', token, COOKIE_OPTIONS);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;

        const identifierType = getIdentifierType(identifier);
        const query = { [identifierType]: identifier };

        // console.log(query);

        const user = await User.findOne(query)
            .populate('friends', 'name username email profilePicture')
            .populate('sentFriendRequests', 'name username profilePicture')
            .populate('pendingFriendRequests', 'name username profilePicture');
        
            if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Set JWT token in cookie
        res.cookie('token', token, COOKIE_OPTIONS);

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                name: user.name,
                userbio: user.userbio,
                mobile: user.mobile,
                friends: user.friends,
                groups: user.groups,
                sentFriendRequests: user.sentFriendRequests,
                pendingFriendRequests: user.pendingFriendRequests,
            },
            token: token,
        });

    } catch (error) {
        if (error.message === 'Invalid identifier format') {
            return res.status(400).json({
                message: 'Invalid login identifier format'
            });
        }
        next(error);
    }
};

// Add logout functionality
exports.logout = async (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.json({ message: 'Logged out successfully' });
};