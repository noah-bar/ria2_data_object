import GoogleDataObject from "../src/GoogleDataObject";
import dotenv from "dotenv"
import {resolve} from 'path'
import * as fs from "fs";
dotenv.config()

const bucketName = process.env.BUCKET_NAME as string
const keyFilename = resolve("./config/es-bi-noah.json")
const dataObject = new GoogleDataObject(keyFilename,bucketName)

const uploadTestFile = async (filename: string = "testFile") => {
    if(!(await dataObject.doesExist(filename))) {
        const filePath = resolve("./data/testFile")
        const buffer = fs.readFileSync(filePath)
        await dataObject.upload(buffer, filename)
    }
}

//Delete testfile after each test
afterEach(async () => {
    if(await dataObject.doesExist("testFile")) {
        await dataObject.remove("testFile")
    }
})
