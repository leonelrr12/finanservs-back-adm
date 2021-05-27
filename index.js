const app = require('./app')
const http = require('http')
const config = require('./src/utils/config')
const logger = require('./src/utils/logger')

const server = http.createServer(app)

const PORT = config.PORT
server.listen(PORT, () => {
  logger.info(`Server conecting on port ${config.PORT}`)
})
