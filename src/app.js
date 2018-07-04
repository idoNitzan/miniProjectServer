import { handleSignUpRequest } from './api/signUp'
import express from 'express'
import expressValidator from 'express-validator'
import http from 'http'
import cors from 'cors'
import bodyParser from 'body-parser'
import { initDb } from './database/dbInterface'
import { handleLoginRequest } from './api/login'
import cookieParser from 'cookie-parser'
import { handleUserNameFetchRequest } from './api/userName'

initDb()

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())
app.use(expressValidator())
app.use(cookieParser())

app.post('/sign_up', handleSignUpRequest)
app.post('/login', handleLoginRequest)
app.post('/my_user_name', handleUserNameFetchRequest)

const httpServer = http.createServer(app)
httpServer.listen('8000', () => {
  console.log('Listening')
})