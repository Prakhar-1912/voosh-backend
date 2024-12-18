// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SyncSpace Chat App API Documentation',
            version: '1.0.0',
            description: 'API documentation for SyncSpace Chat Application',
            contact: {
                name: 'API Support',
                email: 'your-email@example.com'
            }
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['username', 'email', 'mobile'],
                    properties: {
                        username: {
                            type: 'string',
                            description: 'User\'s username'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User\'s email address'
                        },
                        mobile: {
                            type: 'string',
                            description: 'User\'s mobile number'
                        },
                        password: {
                            type: 'string',
                            description: 'User\'s password (not returned in responses)'
                        },
                        profilePicture: {
                            type: 'string',
                            description: 'URL to user\'s profile picture'
                        },
                        friends: {
                            type: 'array',
                            items: {
                                type: 'string',
                                description: 'User ID of friend'
                            }
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string'
                        },
                        error: {
                            type: 'string'
                        }
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js', './models/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;