// config/config.js

require("dotenv").config(); 
const config = {
  mongoURI: process.env.MONGO_URI, 
  port: process.env.PORT || 5000,  
  nodeEnv: process.env.NODE_ENV || "development", 
};

module.exports = config;
