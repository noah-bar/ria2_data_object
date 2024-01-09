export type Url = string

// Interface IDataObject
export default interface IDataObject {
    doesExist(): Promise<boolean>;
    upload(file: Buffer, remoteFullPath: Url): void;
    download(remoteFullPath: Url , localFullPath: Url): Promise<void>;
    publish(remoteFullPath: Url, expirationTime?: number): Promise<Url>;
    remove(remoteFullPath: Url, recursive?: boolean): void;
}
