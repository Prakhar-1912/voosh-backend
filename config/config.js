// config/config.js

require("dotenv").config(); // Load environment variables from .env file

const config = {
  mongoURI: process.env.MONGO_URI, // Database URI
  port: process.env.PORT || 5000,  // Port for the server
  nodeEnv: process.env.NODE_ENV || "development", // Environment (development/production)
};

module.exports = config;
