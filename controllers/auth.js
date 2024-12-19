// controllers/auth.controller.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');
const { validationResult } = require('express-validator');

const COOKIE_OPTIONS = {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict', 
    maxAge: 24 * 60 * 60 * 1000 
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


