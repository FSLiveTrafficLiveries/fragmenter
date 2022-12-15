/// <reference types="node" />
import fs from 'fs-extra';
import TypedEventEmitter from '../typed-emitter';
import { FragmenterError } from '../errors';
import { FragmenterContext } from '../core';
export interface StreamDownloaderEvents {
    'progress': (loaded: number) => void;
    'error': (error: any) => void;
}
export interface StreamDownloaderResult {
    bytesWritten: number;
    error?: FragmenterError;
}
declare const StreamDownloader_base: new () => TypedEventEmitter<StreamDownloaderEvents>;
export declare class StreamDownloader extends StreamDownloader_base {
    private readonly ctx;
    private readonly downloadUrl;
    constructor(ctx: FragmenterContext, downloadUrl: string);
    downloadFrom(startIndex: number, writeStream: fs.WriteStream): Promise<StreamDownloaderResult>;
    private getReadStream;
}
export {};
