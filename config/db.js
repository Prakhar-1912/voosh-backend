const mongoose = require("mongoose");
const logger = require("./../utils/logger"); // Assuming a logger utility is in place

// Default MongoDB URI from environment variables
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/syncspace";

/**
 * Establishes a connection to MongoDB using Mongoose.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        // MongoDB Connection Options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: process.env.NODE_ENV === "development", // Auto-create indexes in dev only
            maxPoolSize: 10, // Maintain a pool of 10 connections
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };

        // Connecting to MongoDB
        const conn = await mongoose.connect(MONGO_URI, options);

        // Log successful connection
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        // Log connection errors
        logger.error(`Error connecting to MongoDB: ${err.message}`);
        process.exit(1); // Exit process on fatal connection error
    }
};

/**
 * Disconnects from MongoDB, useful for graceful shutdown or testing.
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed successfully.");
    } catch (err) {
        logger.error(`Error closing MongoDB connection: ${err.message}`);
    }
};

module.exports = { connectDB, disconnectDB };
