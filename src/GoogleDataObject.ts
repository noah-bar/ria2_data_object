import IDataObject, {Url} from "./IDataObject";
import {ApiError, Bucket, Storage} from "@google-cloud/storage"
import {DataObjectException, ObjectNotFoundException} from "./exceptions/dataObjectExceptions";

export default class GoogleDataObject implements IDataObject {
    private storage: Storage
    private bucket: Bucket

    constructor(keyFilename: string, private bucketName: string) {
        this.storage = new Storage({keyFilename})
        this.bucket = this.storage.bucket(this.bucketName)
    }

    async doesExist(remoteFullPath?: string): Promise<boolean> {
        if(remoteFullPath) {
            const [files] = await this.bucket.getFiles({prefix: remoteFullPath})
            return files.length > 0
        }
        const [exists] = (await this.bucket.exists())
        return exists
    }

    async download(remoteFullPath: Url , localFullPath: Url) {
        try {
            await this.bucket.file(remoteFullPath).download({
                destination: localFullPath
            })
        } catch(e: unknown) {
            if(e instanceof ApiError) {
                if(e.code === 404) throw new ObjectNotFoundException(remoteFullPath)
            }
            throw new DataObjectException("Unknown error")
        }
    }

    publish(remoteFullPath: Url, expirationTime?: number): Promise<Url> {
        throw new Error("To implement")
    }

    remove(remoteFullPath: Url, recursive?: boolean): void {
        throw new Error("To implement")
    }

    upload(file: Buffer, remoteFullPath: Url): void {
        throw new Error("To implement")
    }

}
