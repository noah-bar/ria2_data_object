import IDataObject, {Url} from "./IDataObject";
import {ApiError, Bucket, Storage} from "@google-cloud/storage"
import {
    DataObjectException,
    ObjectAlreadyExistsException,
    ObjectNotFoundException
} from "./exceptions/dataObjectExceptions";

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

    async publish(remoteFullPath: Url, expirationTime: number = 90): Promise<Url> {
        const exists = await this.doesExist(remoteFullPath)
        if(!exists) throw new ObjectNotFoundException(remoteFullPath)
        const expires = new Date()
        expires.setHours(expirationTime)
        const [v1] = await this.bucket.file(remoteFullPath).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires
        })
        return v1
    }

    async remove(remoteFullPath: Url, recursive?: boolean): Promise<void> {
        if(recursive) {
            const [files] = await this.bucket.getFiles({ prefix: remoteFullPath })
            for(const file of files) {
                await file.delete()
            }
            return
        }
        await this.bucket.file(remoteFullPath).delete()
    }

    async upload(buffer: Buffer, remoteFullPath: Url): Promise<void> {
        const exists = await this.doesExist(remoteFullPath)
        if(exists) throw new ObjectAlreadyExistsException(remoteFullPath)
        await this.bucket.file(remoteFullPath).save(buffer)
    }

}
