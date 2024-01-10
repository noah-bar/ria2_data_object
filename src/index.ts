import { resolve } from "path";
import GoogleDataObject from "./GoogleDataObject";
import express, { Router, Request, Response } from 'express'
import dotenv from 'dotenv'
import multer from 'multer'

dotenv.config()

const PORT = 3000
const app = express()
const router = Router()
const upload = multer()

const keyFilename = resolve("./config/key.json")
const bucketName = process.env.BUCKET_NAME as string
const googleLabelDetector = new GoogleDataObject(keyFilename, bucketName)

app.use(express.json())

router.post('/upload',upload.single('file'), async (req: Request, res: Response) => {
  const errors = []
  const file = req.file
  const name = req.body.name

  if(!file) errors.push("The request must contain an file")
  if(!name) errors.push("The request must contain a name")
  if(errors.length > 0) return res.status(401).json({errors})

  const exists = await googleLabelDetector.doesExist(name)
  if(!exists) await googleLabelDetector.upload(file!.buffer, name)
  return res.json({name})
})

router.get('/publish/:name', async (req: Request, res: Response) => {
  const name = req.params.name
  const expirationTime = req.body.expirationTime || 90
  if(!name) {
    return res.status(401).send({
      errors: ["The request must contain an name"]
    })
  }
  const url = await googleLabelDetector.publish(name, expirationTime)
  return res.json({
    url: url
  })
})

app.use("/api/v1", router)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})