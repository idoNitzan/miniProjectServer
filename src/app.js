import { handleSignUpRequest } from './api/signUp'
import express from 'express'
import expressValidator from 'express-validator'
import fileUpload from 'express-fileupload'
import http from 'http'
import cors from 'cors'
import bodyParser from 'body-parser'
import { initDb } from './database/dbInterface'
import { handleLoginRequest } from './api/login'
import RateLimiter from './utils/RateLimiter'
import cookieParser from 'cookie-parser'
import { handleUserNameFetchRequest } from './api/userName'

initDb()

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())
app.use(fileUpload())
app.use(expressValidator())
app.use(cookieParser())

const rateLimiter = new RateLimiter()

app.post('/sign_up', handleSignUpRequest)
app.post('/login', handleLoginRequest(rateLimiter))
app.post('/my_user_name', handleUserNameFetchRequest)

app.post('/upload', async (req, res) => {
  if(!req.files) {
    return res.status(400).send('No files were uploaded.')
  }

  let sampleFile = req.files.sampleFile
  console.log(req.files, req.body.email, req.body)

  try {
    await sampleFile.mv(`../uploadedFiles/${req.files.sampleFile.name}`)
  } catch(err) {
    return res.status(500).send(err)
  }
  res.send('File uploaded!!')
})

const httpServer = http.createServer(app)
httpServer.listen('8000', () => {
  console.log('Listening')
})