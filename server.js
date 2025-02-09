import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import express from 'express'
import mongoose from 'mongoose'
import viewsRouter from './src/views.js'
import apiRouter from './src/api.js'
import authRouter from './src/auth.js'

const PROTOCOL = process.env.PROTOCOL || 'http'
const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 3000
const BASEURL = `${PROTOCOL}://${HOST}:${PORT}`
const DB_URI = process.env.DB_URI

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.use('/', viewsRouter)
app.use('/api', apiRouter)
app.use('/auth', authRouter)

app.listen(PORT, () => {
  mongoose.connect(DB_URI)
  console.log(`Server is running at ${BASEURL}/`)
})