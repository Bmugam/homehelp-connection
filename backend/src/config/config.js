// config/config.js
require('dotenv').config();

const API_URL = process.env.API_URL;

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET ,
    PORT: process.env.PORT ,
    NODE_ENV: process.env.NODE_ENV ,
    DB: {
        HOST: process.env.DB_HOST || 'localhost',
        USER: process.env.DB_USER || 'root',
        PASSWORD: process.env.DB_PASSWORD || '',
        DATABASE: process.env.DB_NAME || '',
    },
    API_URL,
};