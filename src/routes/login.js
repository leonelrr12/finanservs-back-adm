const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const config = require('../utils/config')
const logger = require('../utils/logger')

loginRouter.get('/', async (request, response) => {
  response
    .status(200)
    .send("Hola desde api/login")
})

loginRouter.get('/users', (request, response) => {
  let sql = "SELECT a.id,email,a.name,phoneNumber,cellPhone,b.role,"
  sql += " CASE WHEN a.is_new THEN 'Si' ELSE 'No' END as is_new,"
  sql += " CASE WHEN a.is_active THEN 'Si' ELSE 'No' END as is_active"
  sql += " FROM users a"
  sql += " INNER JOIN roles b on b.id = a.id_role"
  sql += " ORDER BY a.id"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

loginRouter.get('/new-user/:email',  (request, response) => {
 let sql = "SELECT is_new"
  sql += " FROM users"
  sql += " WHERE email=?"
  sql += " AND (is_active = true OR id_role = 1)"

  const {email} = request.params
  const params = [email]

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
})

loginRouter.get('/:email/:password',  (request, response) => {
  let sql = "SELECT id, hash, name, is_active, is_new"
   sql += " FROM users"
   sql += " WHERE email=?"
   sql += " AND (is_active = true OR id_role = 1)"
 
   const {email, password} = request.params
   const params = [email]
 
   config.cnn.query(sql, params, async (error, rows, fields) => {
     if (error) {
       logger.error('Error SQL:', error.sqlMessage)
       response.status(500)
     } 
     if (rows.length > 0) {   
       const {id, hash, name, is_active} = rows[0]  
       if(!is_active){
         logger.error('Error Status:', 'Usuario Bloqueado.')
         return response.json({message: 'Usuario Bloqueado.  Llame al Administrador!', token: ''})
       }
       const validPass = await bcrypt.compare(password, hash)
       if(validPass){
         const userForToken = {
           username: name,
           id: id
         }
         const token = jwt.sign(userForToken, process.env.SECRET)
         response.status(200).json({userName: name, token})
       } else {
         // const hash = await bcrypt.hash('123456', 10)
         console.log(hash);
         logger.error('Error Seguridad:', 'Credenciales Inválidas ...!')
         response.status(200).json({message: 'Credenciales Inválidas ...!', token: ''})
       }
     } else {
       logger.error('Error Seguridad:', 'Usuario no existe ...! '+body.email)
       response.json({message: 'Usuario no existe ...!', token: ''})
     }
   })
 })

loginRouter.post('/token-verify', async (request, response) => {
  const body = request.body
  const token = body.token
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if(token && decodedToken) {
      response
        .status(200)
        .send({ message: 'Todo bien!!!' })   
    }
  } catch (error) {
    logger.error('Error Seguridad:', 'token missing or invalid')
    response.status(401).json({ error: 'token missing or invalid' })
  }
})

loginRouter.put('/chgpwd', async (request, response) => {
  let sql = "UPDATE users SET hash=?, is_new=false"
  sql += " WHERE email=?"

  const {email,password} = request.body
  const hash = await bcrypt.hash(password, 10)
  const params = [hash, email]

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

module.exports = loginRouter