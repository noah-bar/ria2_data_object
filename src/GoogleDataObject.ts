import IDataObject, {Url} from "./IDataObject";

export default class GoogleDataObject implements IDataObject {
    doesExist(): Promise<boolean> {
        throw new Error("To implement")
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
