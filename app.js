const express = require('express')
const cors = require('cors')
const path = require('path')
const appRoutes = require('./src/routes/appRoutes')
const middleware = require('./src/utils/middlerware')
const usersRouter = require('./src/routes/users')
const fileRoutes = require('./src/routes/uploadFile')
const admRoutes = require('./src/routes/admRoutes')
const loginRouter = require('./src/routes/login')
const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(cors())
app.use(express.static('build'))
app.use('/public', express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api', appRoutes)
app.use('/upload', fileRoutes)
app.use('/adm', admRoutes)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app