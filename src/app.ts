import GoogleDataObject from "./GoogleDataObject";
import {resolve} from "path";
import dotenv from 'dotenv'
dotenv.config()

const keyFilename = resolve("./config/es-bi-noah.json")
const bucketName = process.env.BUCKET_NAME as string
const dataObject = new GoogleDataObject(keyFilename, bucketName)
