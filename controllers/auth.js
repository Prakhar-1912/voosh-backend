// controllers/auth.controller.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');
const { validationResult } = require('express-validator');

const COOKIE_OPTIONS = {
    httpOnly: true, // Prevents client-side access to the cookie
    secure: process.env.NODE_ENV === 'production', // Only sends cookie over HTTPS in production
    sameSite: 'strict', // Protects against CSRF
    maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

exports.signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request, missing field',
                error: null
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }]
        });

        if (existingUser) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Email already exists.',
                error: null
            });
        }

        const hashedPassword = await hashPassword(password);
        
        const user = new User({
            email,
            password: hashedPassword,
            role: "admin"   
        });

        await user.save();

        const token = jwt.sign(
            {
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Set JWT token in cookie
        res.cookie('token', token, COOKIE_OPTIONS);

        res.status(201).json({
            status: 201,
            message: 'User registered successfully',
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
            error: null
        });

    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {

    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            $or: [{ email }]
        });

        if (!user) {
        return res.status(404).json({
            status: 404,
            data: null,
            message: 'User Not Found',
            error: error 
        });
        }
        
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request, Invalid credentials',
                error: error
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Set JWT token in cookie
        res.cookie('token', token, COOKIE_OPTIONS);

        res.status(200).json({
            status: 200,
            data: {
                token: token,
            },
            message: 'Login successful',
            error: null
        });
    } 
    catch (error) {
        if (error.message === 'Invalid identifier format') {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Invalid login identifier format'
            });
        }
        next(error);
    }
};

exports.logout = async (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.json({ message: 'Logged out successfully' });
};

exports.getAllUsers = async (req, res) => {
    try {
        // Validate request parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: errors.array()
            });
        }

        // Extract query parameters with defaults
        const limit = parseInt(req.query.limit) || 5;
        const offset = parseInt(req.query.offset) || 0;
        const role = req.query.role ? req.query.role.toLowerCase() : null;

        // Construct query filter
        const queryFilter = {};
        if (role) {
            queryFilter.role = role;
        }

        // Ensure only users under the same admin are fetched
        queryFilter.admin_id = req.user.id; // Assumes authentication middleware sets req.user

        // Fetch users with pagination and optional role filtering
        const users = await User.find(queryFilter)
            .select('user_id email role created_at') // Select only required fields
            .limit(limit)
            .skip(offset)
            .sort({ created_at: -1 }); // Sort by most recent first

        // Count total users for this admin (for potential frontend pagination)
        const totalUsers = await User.countDocuments(queryFilter);

        // Prepare response
        res.status(200).json({
            status: 200,
            data: users,
            message: 'Users retrieved successfully.',
            error: null,
            pagination: {
                total: totalUsers,
                limit,
                offset
            }
        });
    } catch (error) {
        // Log the error for server-side tracking
        console.error('Error retrieving users:', error);

        // Send generic error response
        res.status(500).json({
            status: 500,
            data: null,
            message: 'Internal Server Error',
            error: 'Unable to retrieve users'
        });
    }
};

exports.addUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log(email)
        // Validate input fields
        if (!email || !password || !role) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: 'Email, password and role are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: 'Invalid email format'
            });
        }

        // Check for forbidden role
        if (role === 'admin') {
            return res.status(403).json({
                status: 403,
                data: null,
                message: 'Forbidden Access',
                error: 'Cannot create admin users through this endpoint'
            });
        }

        // Validate role
        const allowedRoles = ['editor', 'viewer'];
        if (role && !allowedRoles.includes(role.toLowerCase())) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: 'Invalid role. Allowed roles are: editor, viewer'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                status: 409,
                data: null,
                message: 'Email already exists',
                error: 'Email already exists.'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const newUser = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role,
        });

        // Save user to database
        await newUser.save();

        // Respond with success
        res.status(201).json({
            status: 201,
            data: null,
            message: 'User created successfully.',
            error: null
        });

    } catch (error) {
        // Log the error for server-side tracking
        console.error('Error adding user:', error);

        // Handle specific mongo duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({
                status: 409,
                data: null,
                message: 'Email already exists',
                error: 'Email already exists.'
            });
        }
    }
};

exports.deleteUser = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                status: 401,
                data: null,
                message: 'Unauthorized Access',
                error: 'Authentication required'
            });
        }

        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                status: 403,
                data: null,
                message: 'Forbidden Access',
                error: 'Admin privileges required for this operation'
            });
        }

        const { user_id } = req.params;

        // Find the user to be deleted
        const userToDelete = await User.findOne({ 
            user_id: user_id,
            admin_id: req.user.id // Ensure the user belongs to the current admin
        });

        // Check if user exists
        if (!userToDelete) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'User not found.',
                error: null
            });
        }

        // Check if trying to delete an admin user
        if (userToDelete.role === 'admin') {
            return res.status(403).json({
                status: 403,
                data: null,
                message: 'Forbidden Access',
                error: 'Admin users cannot be deleted through this endpoint'
            });
        }

        // Check if trying to delete a user from another admin
        if (userToDelete.admin_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                status: 403,
                data: null,
                message: 'Forbidden Access',
                error: 'You can only delete users under your administration'
            });
        }

        // Delete the user
        await User.deleteOne({ 
            user_id: user_id,
            admin_id: req.user.id 
        });

        // Respond with success
        res.status(200).json({
            status: 200,
            data: null,
            message: 'User deleted successfully.',
            error: null
        });

    } catch (error) {
        // Log the error for server-side tracking
        console.error('Error deleting user:', error);
    }
};

exports.updatePassword = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                status: 401,
                data: null,
                message: 'Unauthorized Access',
                error: 'Authentication required'
            });
        }

        const { old_password, new_password } = req.body;

        // Validate request body
        if (!old_password || !new_password) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: 'Both old and new passwords are required'
            });
        }

        // Validate new password
        if (new_password.length < 8) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: 'New password must be at least 8 characters long'
            });
        }

        // Find the user
        const user = await User.findOne({ user_id: req.user.user_id });

        if (!user) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'User not found.',
                error: null
            });
        }

        // Verify old password
        const isValidPassword = await bcrypt.compare(old_password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 401,
                data: null,
                message: 'Unauthorized Access',
                error: 'Invalid old password'
            });
        }

        // Check if new password is same as old password
        const isSamePassword = await bcrypt.compare(new_password, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: 'New password must be different from old password'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        // Update password
        await User.updateOne(
            { user_id: req.user.user_id },
            { $set: { password: hashedPassword } }
        );

        // Return 204 No Content for successful update
        res.status(204).send();

    } catch (error) {
        // Log the error for server-side tracking
        console.error('Error updating password:', error);

        // Handle token verification errors
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 401,
                data: null,
                message: 'Unauthorized Access',
                error: 'Invalid or expired token'
            });
        }

        // Send generic error response
        res.status(500).json({
            status: 500,
            data: null,
            message: 'Internal Server Error',
            error: 'Unable to update password'
        });
    }
};
