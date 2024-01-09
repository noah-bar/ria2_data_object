import IDataObject, {Url} from "./IDataObject";
import {ApiError, Bucket, Storage} from "@google-cloud/storage"

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

    download(remoteFullPath: Url, localFullPath: Url): Promise<void> {
        throw new Error("To implement")
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
