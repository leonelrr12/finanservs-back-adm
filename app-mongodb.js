
// const middleware = require('./utils/middleware')
// const logger = require('./utils/logger')
// const mongoose = require('mongoose')

// logger.info('connecting to', config.MONGOEN_URI)

// mongoose.connect(config.MONGOEN_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
//   useCreateIndex: true
// })
//   .then(() => {
//     logger.info('Connected to MondoDB')
//   })
//   .catch(error => {
//     logger.error('Error connecting to MongoDB: ', error.message)
//   })


// RUTAS *************
// appRoutes.post('/api-token-auth', (req, res) => {
//   if(req.body.username === "leonel" && req.body.password === "123456") {
// const payload = {
//  check:  true
// };
// const token = jwt.sign(payload, app.get('key'), {
//  expiresIn: 1440
// });
// res.json({
//  token: token
// });
//   } else {
//       res.json({ mensaje: "Usuario o contraseña incorrectos"})
//   }
// })

// Register a route that requires a valid token to view data
// appRoutes.get('/api', function(req, res){
//   var token = req.query.token;
//   jwt.verify(token, 'supersecret', function(err, decoded){
//     if(!err){
//       var secrets = {"accountNumber" : "938291239","pin" : "11289","account" : "Finance"};
//       res.json(secrets);
//     } else {
//       res.send(err);
//     }
//   })
// })

// appRoutes.post('/api-token-verify', (req, res) => {

// })