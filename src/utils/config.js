require('dotenv').config()
const mysql = require('mysql2')

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST
const AWS_Access_key_ID = process.env.AWS_Access_key_ID
const AWS_Secret_access_key = process.env.AWS_Secret_access_key

//SMTP G-Suit
const sendGEmail = {
  EMAIL_USER: process.env.EMAIL_USER,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REDIRECT_URI: process.env.REDIRECT_URI,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN
}


// MySql DIgital Ocean-2
const cnn = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DATABASE,
  password: process.env.DB_PWD,
  port: process.env.PORTDB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


module.exports = {
  AWS_Access_key_ID,
  AWS_Secret_access_key,
  PORT,
  HOST,
  cnn,
  sendGEmail
}
