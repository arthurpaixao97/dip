import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import express from 'express'
import mongoose from 'mongoose'
import viewsRouter from './src/views.js'
import apiRouter from './src/api.js'
import authRouter from './src/auth.js'

import Recurrence from './src/api/v2/models/recurrence.js'
import Recurrency from './src/api/v2/models/recurrency.js'
import Transaction from './src/api/v2/models/transaction.js'

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
app.post('/refresh', async (req, res) => {
  await Recurrence.deleteMany()
  await Recurrency.deleteMany()
  await Transaction.deleteMany()
  res.send("ok")
})

app.listen(PORT, () => {
  mongoose.connect(DB_URI)
  console.log(`Server is running at ${BASEURL}/`)
})