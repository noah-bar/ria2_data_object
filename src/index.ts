import { resolve } from "path";
import GoogleDataObject from "./GoogleDataObject";
import express, { Express, Router, Request, Response } from 'express'
import dotenv from 'dotenv'
dotenv.config()

const PORT = 3000
const app = express()
const router = Router()

const keyFilename = resolve("./config/key.json")
const bucketName = process.env.BUCKET_NAME as string
const googleLabelDetector = new GoogleDataObject(keyFilename, bucketName)

app.use(express.json())

app.use("/api/v1", router)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})