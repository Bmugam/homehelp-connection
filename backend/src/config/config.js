// config/config.js
require('dotenv').config();

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'mysecret',
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB: {
        HOST: process.env.DB_HOST || 'localhost',
        USER: process.env.DB_USER || 'root',
        PASSWORD: process.env.DB_PASSWORD || 'Moracha',
        DATABASE: process.env.DB_DATABASE || 'homehelp_db',
    },
};