import TypedEventEmitter from '../typed-emitter';
import { DistributionModule } from '../types';
import { FragmenterContext } from '../core';
export interface ModuleDecompressorProgress {
    entryIndex: number;
    entryName: string;
    entryCount: number;
}
export interface ModuleDecompressorEvents {
    'progress': (progress: ModuleDecompressorProgress) => void;
}
declare const ModuleDecompressor_base: new () => TypedEventEmitter<ModuleDecompressorEvents>;
export declare class ModuleDecompressor extends ModuleDecompressor_base {
    private readonly ctx;
    private readonly module;
    private readonly moduleIndex;
    constructor(ctx: FragmenterContext, module: DistributionModule, moduleIndex: number);
    decompress(filePath: string, destDir: string): Promise<boolean>;
}
export {};
