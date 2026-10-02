process.env.JWT_SECRET = process.env.JWT_SECRET || '2844067e13c352e4b87d6bdde865f8e6d2259db8e64eb1c7db96101feaf136a6';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://avzneyaalenbyawfvykp.supabase.co';
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_iqpHDJXb983_PwFSoSDV9w_kd2pvKoj';
process.env.GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxMA_8zdAdniensdoPQx9XkhTVya4c-afMx2qz7adS3eHs5OlBpsEkbZGLXMac1taN8xw/exec';

const app = require('../server.js');
module.exports = app;
