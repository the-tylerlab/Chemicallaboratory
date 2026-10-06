// Serverless entrypoint for Vercel
// Strictly load environment variables from the execution environment
// NO hardcoded JWT secret fallback
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const app = require('../server.js');

module.exports = app;
