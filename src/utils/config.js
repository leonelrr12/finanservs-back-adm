require('dotenv').config()
const mysql = require('mysql2')

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST
const AWS_Access_key_ID = process.env.AWS_Access_key_ID
const AWS_Secret_access_key = process.env.AWS_Secret_access_key

//SMTP G-Suit
const sendGEmail = {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_PORT: process.env.EMAIL_PORT,
  clientId: '975688741054-qsre2625tkgveh5jjebdic210b9c2l7g.apps.googleusercontent.com',
  clientSecret: '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',
  redirectUri: 'https://developers.google.com/oauthplayground'
}


// MySql DIgital Ocean-2
// const cnn = mysql.createConnection({
//     host: process.env.DB_HOST,
//     database: process.env.DATABASE,
//     user: process.env.DB_USER,
//     password: process.env.DB_PWD,
//     port: process.env.PORTDB
// })

// Check connection
// cnn.connect(error => {
//   if (error) throw error;
//   console.log('Database server runnuning!');
// })


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
