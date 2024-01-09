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


describe("Test upload method", () => {
    it("Should upload local file if bucket exist", async () => {

        //given
        expect(await dataObject.doesExist()).toBeTruthy()
        expect(await dataObject.doesExist('testFile')).toBeFalsy()

        //when
        await uploadTestFile()

        //then
        expect(await dataObject.doesExist('testFile')).toBeTruthy()
    })
})

describe("Test doesExist method", () => {
    it("Should return true if the bucket exist", async () => {
        //then
        const exists = await dataObject.doesExist()
        expect(exists).toBeTruthy()
    })

    it("Should return true if the object exist", async () => {
        //when
        await uploadTestFile()

        //then
        const exists = await dataObject.doesExist("testFile")
        expect(exists).toBeTruthy()
    })

    it("Should return false if the object doesn't exist", async () => {
        //then
        const exists = await dataObject.doesExist("testMissingFile")
        expect(exists).toBeFalsy()
    })
})

describe("Test remove method", () => {
    it("Should remove object on the bucket", async () => {

        //given
        await uploadTestFile()
        let exists = await dataObject.doesExist("testFile")
        expect(exists).toBeTruthy()

        //when
        await dataObject.remove("testFile")

        //then
        exists = await dataObject.doesExist("testFile")
        expect(exists).toBeFalsy()
    })

    it("Should remove object and folder on the bucket", async () => {
        //given
        await uploadTestFile("testFolder/testFileInSubfolder")
        expect(await dataObject.doesExist("testFolder")).toBeTruthy()
        expect(await dataObject.doesExist("testFolder/testFileInSubfolder")).toBeTruthy()

        //when
        await dataObject.remove("testFolder", true)

        //then
        expect(await dataObject.doesExist("testFolder")).toBeFalsy()
        expect(await dataObject.doesExist("testFolder/testFileInSubfolder")).toBeFalsy()
    })
})
