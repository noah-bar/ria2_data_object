export class DataObjectException extends Error {
    constructor(message: string) {
        super(message);
        if ("captureStackTrace" in Error) {
            Error.captureStackTrace(this, DataObjectException);
        }
    }
}

export class ObjectNotFoundException extends DataObjectException {
    constructor(objectName: string) {
        super(`Object "${objectName}" not found.`);
    }
}

export class NotEmptyObjectException extends DataObjectException {
    constructor(objectUrl: string) {
        super(`Failed to download the object from "${objectUrl}".`);
    }
}

export class ObjectAlreadyExistsException extends DataObjectException {
    constructor(objectUrl: string) {
        super(`Failed to upload the object to "${objectUrl}".`);
    }
}
