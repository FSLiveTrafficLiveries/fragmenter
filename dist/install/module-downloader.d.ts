import { DistributionModule } from '../types';
import TypedEventEmitter from '../typed-emitter';
import { FragmenterContext } from '../core';
export interface ModuleDownloaderProgress {
    loaded: number;
    total: number;
    partLoaded: number;
    partTotal: number;
    partIndex: number;
    numParts: number;
}
export interface ModuleDownloaderEvents {
    'progress': (progress: ModuleDownloaderProgress) => void;
    'downloadInterrupted': (fromUserAction: boolean) => void;
    'error': (error: Error) => void;
}
declare const ModuleDownloader_base: new () => TypedEventEmitter<ModuleDownloaderEvents>;
export declare class ModuleDownloader extends ModuleDownloader_base {
    private readonly ctx;
    private readonly baseUrl;
    private readonly module;
    private readonly moduleIndex;
    private readonly retryCount;
    private readonly fullModuleHash;
    constructor(ctx: FragmenterContext, baseUrl: string, module: DistributionModule, moduleIndex: number, retryCount: number, fullModuleHash: string);
    private probedModuleFileSize;
    startDownload(destDir: string): Promise<boolean>;
    private probeModuleCompleteFileSize;
    private downloadModuleFile;
    private downloadModuleFileParts;
    private mergeModuleFileParts;
}
export {};
