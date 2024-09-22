import TypedEventEmitter from '../typed-emitter';
import { FragmenterError } from '../errors';
import { FragmenterContext } from '../core';
export interface FileDownloaderEvents {
    'progress': (loaded: number, total: number | undefined) => void;
    'downloadInterrupted': (fromUserAction: boolean) => void;
    'error': (error: Error) => void;
}
export interface FileDownloaderResult {
    bytesDownloaded: number;
    error?: FragmenterError;
}
declare const FileDownloader_base: new () => TypedEventEmitter<FileDownloaderEvents>;
export declare class FileDownloader extends FileDownloader_base {
    private readonly ctx;
    private readonly fileUrl;
    private readonly forceCacheBust;
    constructor(ctx: FragmenterContext, fileUrl: string, forceCacheBust: boolean);
    download(dest: string): Promise<FileDownloaderResult>;
    private static getHeaders;
}
export {};
