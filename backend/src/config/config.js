// config/config.js
require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    DB: {
        HOST: process.env.DB_HOST || 'localhost',
        USER: process.env.DB_USER || 'root',
        PASSWORD: process.env.DB_PASSWORD || 'Moracha',
        DATABASE: process.env.DB_NAME || 'homehelp_db',
        PORT: process.env.DB_PORT || 3306
    },
    NODE_ENV: process.env.NODE_ENV || 'development',
};