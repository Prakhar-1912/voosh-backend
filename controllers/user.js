const User = require('../models/User')
const jwtUtils = require('../utils/password.utils')
const bcrypt = require('bcryptjs');
const hashPassword = jwtUtils.hashPassword;
const comparePassword = jwtUtils.comparePassword;

exports.getAllUsers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const offset = parseInt(req.query.offset) || 0;
        
        const queryFilter = {};
        
        if (req.query.role) {
            queryFilter.role = req.query.role;
        }

        queryFilter.admin_id = req.user.id;

        const users = await User.find(queryFilter)
            .select('user_id email role created_at') 
            .limit(limit)
            .skip(offset)
            .sort({ created_at: -1 });

        res.status(200).json({
            status: 200,
            data: users,
            message: 'Users retrieved successfully.',
            error: null
        });
    } catch (error) {
        console.error('Error retrieving users:', error);
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

        if (!email || !password || !role) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: 'Email, password and role are required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: 'Invalid email format'
            });
        }

        if (role === 'admin') {
            return res.status(403).json({
                status: 403,
                data: null,
                message: 'Forbidden Access',
                error: 'Cannot create admin users through this endpoint'
            });
        }

        const allowedRoles = ['editor', 'viewer'];
        if (role && !allowedRoles.includes(role.toLowerCase())) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: 'Invalid role. Allowed roles are: editor, viewer'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                status: 409,
                data: null,
                message: 'Email already exists',
                error: 'Email already exists.'
            });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role,
        });

        await newUser.save();

        res.status(201).json({
            status: 201,
            data: null,
            message: 'User created successfully.',
            error: null
        });

    } catch (error) {
        console.error('Error adding user:', error);
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
        const { user_id } = req.params;

        if(!user_id){
            return res.status(400).json({
                    "status": 400,
                    "data": null,
                    "message": "Bad Request",
                    "error": null
            })
        }

        const userToDelete = await User.findOne({ _id : user_id });

        if (!userToDelete) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'User not found.',
                error: null
            });
        }

        if (userToDelete.role === 'admin') {
            return res.status(403).json({
                status: 403,
                data: null,
                message: 'Forbidden Access',
                error: 'Admin users cannot be deleted through this endpoint'
            });
        }

        await User.deleteOne({ _id: user_id });

        res.status(200).json({
            status: 200,
            data: null,
            message: 'User deleted successfully.',
            error: null
        });

    } catch (error) {
        console.error('Error deleting user:', error);
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;

        if (!old_password || !new_password) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: 'Both old and new passwords are required'
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: 'New password must be at least 8 characters long'
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                status: 400,
                data: null,
                message: 'User not found',
                error: null
            });
        }

        const isValidPassword = await comparePassword(old_password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                status: 401,
                data: null,
                message: 'Unauthorized Access',
                error: 'Invalid old password'
            });
        }

        const isSamePassword = await comparePassword(new_password, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request',
                error: 'New password must be different from old password'
            });
        }

        const hashedPassword = await hashPassword(new_password);
        
        await User.findByIdAndUpdate(req.user.userId, { 
            password: hashedPassword 
        });

        return res.status(200).json({
            status: 200,
            data: null,
            message: "Password updated successfully",
            error: null
        });

    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({
            status: 500,
            data: null,
            message: 'Internal server error',
            error: 'Failed to update password'
        });
    }
};