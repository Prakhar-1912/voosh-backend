const express = require("express");
const { connectDB, disconnectDB } = require("./config/db");
const config = require("./config/config");
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");
const cors = require("cors");
const routes = require('./routes/index');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('./utils/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const http = require('http');

// Initialize the app
const app = express();

const server = http.createServer(app);

// Load environment variables early in the application
require("dotenv").config();

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware Setup
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
// app.use(express.static(path.join(__dirname, 'public')));

// Database connection with retry logic and exponential backoff
// const connectWithRetry = async (retryCount = 0) => {
//   const maxRetries = 5;
//   const baseDelay = 1000; // 1 second

//   try {
//     await connectDB();
//     logger.info('MongoDB connected successfully');
//   } catch (err) {
//     if (retryCount < maxRetries) {
//       const delay = baseDelay * Math.pow(2, retryCount);
//       logger.error(`MongoDB connection error. Retrying in ${delay / 1000} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);
//       setTimeout(() => connectWithRetry(retryCount + 1), delay);
//     } else {
//       logger.error('Failed to connect to MongoDB after maximum retries. Exiting...');
//       process.exit(1);
//     }
//   }
// };

// connectWithRetry();

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "SyncSpace API Documentation"
}));

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    socketConnections: global.io ? global.io.engine.clientsCount : 0,
    uptime: process.uptime()
  });
});

// Welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to SyncSpace Chat App",
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorHandler);

// Server setup with error handling
server.listen(config.port, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on http://localhost:${config.port}`);
});


// Export for testing
module.exports = app;