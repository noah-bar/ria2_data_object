import { resolve } from "path";
import GoogleDataObject from "./GoogleDataObject";
import express, { Router, Request, Response } from 'express'
import dotenv from 'dotenv'
import multer from 'multer'
import { ObjectAlreadyExistsException, ObjectNotFoundException } from "./exceptions/dataObjectExceptions";

dotenv.config()

const PORT = process.env.PORT || 3000
const app = express()
const router = Router()
const upload = multer()

const googleCredentials = resolve(process.env.GOOGLE_CREDENTIALS_PATH as string)
const bucketName = process.env.BUCKET_NAME as string
const googleLabelDetector = new GoogleDataObject(googleCredentials, bucketName)

app.use(express.json({ limit: '50mb' }))

router.post('/upload',upload.single('file'), async (req: Request, res: Response) => {
  const errors: string[] = []
  const file = req.file
  const name: string = req.body.name

  if(!file) errors.push("The request must contain a file")
  if(!name) errors.push("The request must contain a name")
  if(errors.length > 0) return res.status(422).json({errors})

  try {
    const exists = await googleLabelDetector.doesExist(name)
    if(!exists) await googleLabelDetector.upload(file!.buffer, name)
    return res.json({name})
  } catch (err: unknown) {
    if(err instanceof ObjectAlreadyExistsException) {
      return res.status(422).json({ errors: [err.message]})
    }
    return res.status(500).json({ errors: ["Unknown error"] })
  }
})

router.get('/publish/:name', async (req: Request, res: Response) => {
  const name: string = req.params.name
  const expirationTime: number = req.body.expirationTime || 90

  try {
    const url = await googleLabelDetector.publish(name, expirationTime)
    return res.json({
      url: url
    })
  } catch (err: unknown) {
    if(err instanceof ObjectNotFoundException) {
      return res.status(422).send({
        errors: [err.message]
      })
    }
    return res.status(500).send({
      errors: ['Unknown error']
    })
  }
})

app.use("/api/v1", router)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})