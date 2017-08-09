const http = require('http')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const Cron = require('./backgroundTasks')
const { adminMiddleware } = require('./auth/authorization')
const { routes, adminRoutes } = require('./router')


const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/ornitoapi', { useMongoClient: true })


const handler = require('ornito-route-handler')({
  version: '1.0',
  route_map: routes
})

const adminHandler = require('ornito-route-handler')({
  version: '1.0',
  route_map: adminRoutes
})

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

const port = process.env.PORT || 3000
const activateJobs = process.env.JOBS || false
const server = http.createServer(app)

app.use('/', handler)
app.use('/admin', [adminMiddleware, adminHandler])

async function start () {
  server.listen(port)
  const env = process.env.NODE_ENV || 'development'
  console.log(`API listening on port ${port} and environment ${env}`)

  let type = typeof activateJobs
  let active = activateJobs
  if (type === 'string') {
    active = (activateJobs)
  }

  if (active) {
    let cron = new Cron()
    cron.register()
  }
}

start().catch(error => console.error(error.stack))
