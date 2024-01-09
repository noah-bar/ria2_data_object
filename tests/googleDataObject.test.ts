import GoogleDataObject from "../src/GoogleDataObject";
import dotenv from "dotenv"
import {resolve} from 'path'
import * as fs from "fs";
import {ObjectNotFoundException} from "../src/exceptions/dataObjectExceptions";
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

describe("Test download method", () => {
    const localPath = resolve("./data/testDownloadedFile")

    //Remove downloadedFile
    afterEach(() => {
        if(fs.existsSync(localPath)) {
            fs.rmSync(localPath)
        }
    })

    it("Should download remote file", async () => {
        //given
        await uploadTestFile()
        expect(await dataObject.doesExist("testFile")).toBeTruthy()
        expect(fs.existsSync(localPath)).toBeFalsy()

        //when
        await dataObject.download("testFile", localPath)

        //then
        expect(fs.existsSync(localPath)).toBeTruthy()
    })

    it("Should throw error if object is missing", async() => {
        //given
        expect(await dataObject.doesExist(localPath)).toBeFalsy()
        expect(fs.existsSync(localPath)).toBeFalsy()

        //then
        await expect(dataObject.download("testFile", localPath)).rejects.toThrow(ObjectNotFoundException)
    })
})

describe("Test publish method", () => {
    const localPath = resolve("./data/testPublishedFile")

    //Remove downloadedFile
    afterEach(() => {
        if(fs.existsSync(localPath)) {
            fs.rmSync(localPath)
        }
    })

    it("Should download remote file with url", async () => {
        //given
        await uploadTestFile()
        expect(await dataObject.doesExist("testFile")).toBeTruthy()
        expect(fs.existsSync(localPath)).toBeFalsy()

        //when
        const url = await dataObject.publish("testFile")
        const res = await fetch(url, {})
        const blob = await res.blob()
        fs.writeFileSync(localPath, Buffer.from(await blob.arrayBuffer()))

        //then
        expect(fs.existsSync(localPath)).toBeTruthy()
    })

    it("Should throw error if object is missing", async() => {
        //given
        expect(await dataObject.doesExist(localPath)).toBeFalsy()
        expect(fs.existsSync(localPath)).toBeFalsy()

        //then
        await expect(dataObject.publish("testFile")).rejects.toThrow(ObjectNotFoundException)
    })
})
