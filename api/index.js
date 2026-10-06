// Serverless entrypoint for Vercel
// Ensure critical security & environment variables are loaded
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.JWT_SECRET = process.env.JWT_SECRET || '2844067e13c352e4b87d6bdde865f8e6d2259db8e64eb1c7db96101feaf136a6';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://avzneyaalenbyawfvykp.supabase.co';
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_iqpHDJXb983_PwFSoSDV9w_kd2pvKoj';
process.env.GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxMA_8zdAdniensdoPQx9XkhTVya4c-afMx2qz7adS3eHs5OlBpsEkbZGLXMac1taN8xw/exec';
process.env.VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BI7w_Eht-smu8QdTY2vscBTLp4IIaXmF4WyoP5oUILUo5X21sve8Z13x8rna-er2OMDdk7RqsSdE_shJH29zbks';
process.env.VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'fubBgyFnpWSfYY00yLXK6gnYFmZUiM_2ul14q4pi36M';
process.env.VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@chemlab.local';

const app = require('../server.js');

module.exports = app;
