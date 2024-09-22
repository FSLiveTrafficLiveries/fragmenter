export declare enum FragmenterErrorCode {
    Null = 0,
    PermissionsError = 1,
    ResourcesBusy = 2,
    NoSpaceOnDevice = 3,
    MaxModuleRetries = 4,
    FileNotFound = 5,
    DirectoryNotEmpty = 6,
    NotADirectory = 7,
    ModuleJsonInvalid = 8,
    ModuleCrcMismatch = 9,
    UserAborted = 10,
    NetworkError = 11,
    CorruptedZipFile = 12,
    Unknown = 13
}
export declare class FragmenterError extends Error {
    readonly code: FragmenterErrorCode;
    readonly message: string;
    readonly fromError?: Error;
    private constructor();
    static isFragmenterError(error: Error): error is FragmenterError;
    static createFromError(e: Error): FragmenterError;
    static create(code: FragmenterErrorCode, message: string): FragmenterError;
    static parseFromMessage(message: string): FragmenterError;
    private static interpretNodeException;
}
export declare const UnrecoverableErrors: FragmenterErrorCode[];
