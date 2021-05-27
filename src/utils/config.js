require('dotenv').config()
const mysql = require('mysql2')

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST
const AWS_Access_key_ID = process.env.AWS_Access_key_ID
const AWS_Secret_access_key = process.env.AWS_Secret_access_key

// MySql DIgital Ocean-2
const cnn = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    port: process.env.PORTDB
})

// // MySql DIgital Ocean
// const cnn = mysql.createConnection({
//     host: process.env.DB_HOST,
//     database: process.env.DATABASE,
//     user: process.env.DB_USER,
//     password: process.env.DB_PWD
// })

// // MySql de James - IS
// const cnn = mysql.createConnection({
//     host: '69.10.63.218',
//     database: 'finanservs',
//     user: 'AdminFinanservs',
//     password: '0t_pYv70'
// })

// // MySql -->  Dockert
// const cnn = mysql.createConnection({
//   host:'localhost',
//   database:'finanservs',
//   user:'rsanchez',
//   password:'cafekotowa'
// })

// // MySql clever-cloud.com
// const cnn = mysql.createConnection({
//   host:'bjxexd6ulauq7ap6pqxv-mysql.services.clever-cloud.com',
//   database:'bjxexd6ulauq7ap6pqxv',
//   user:'usch2d6auluhu2pz',
//   password:'2mO43d7a0ih8POFWvyBL'
// })


// Check connection
cnn.connect(error => {
  if (error) throw error;
  console.log('Database server runnuning!');
})


module.exports = {
  AWS_Access_key_ID,
  AWS_Secret_access_key,
  PORT,
  HOST,
  cnn
}