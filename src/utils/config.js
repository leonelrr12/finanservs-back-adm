require('dotenv').config()
const mysql = require('mysql2')

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST
const AWS_Access_key_ID = process.env.AWS_Access_key_ID
const AWS_Secret_access_key = process.env.AWS_Secret_access_key

//SMTP gmail
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS
const EMAIL_FROM = process.env.EMAIL_FROM
const EMAIL_PORT = process.env.EMAIL_PORT
const EMAIL_FINA = process.env.EMAIL_FINA
const EMAIL_PRUEBA = process.env.EMAIL_PRUEBA

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


// Create the connection pool. The pool-specific settings are the defaults
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
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  EMAIL_PORT,  
  EMAIL_FINA,
  EMAIL_PRUEBA,
}
