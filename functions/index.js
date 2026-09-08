// functions/index.js

import { onRequest } from 'firebase-functions/v2/https'
import express from 'express'
import cors from 'cors'

import imagesRouter from './routes/images.js'
import uploadRouter from './routes/upload.js'
import updateRouter from './routes/update-image.js'
import deleteRouter from './routes/delete-image.js'

const app = express()

app.use(cors({
  origin: true,
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'AWSNF CMS API running',
  })
})

app.use('/images', imagesRouter)
app.use('/upload', uploadRouter)
app.use('/update-image', updateRouter)
app.use('/delete-image', deleteRouter)

export const api = onRequest(
  {
    region: 'australia-southeast1',
    secrets: [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ],
  },
  app
)