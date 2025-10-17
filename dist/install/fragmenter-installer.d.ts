import TypedEventEmitter from '../typed-emitter';
import { DistributionModule, FragmenterInstallerEvents, InstallInfo } from '../types';
import { FragmenterContext } from '../core';
/**
 * Options passed to a {@link FragmenterInstaller}
 */
export declare type InstallOptions = Partial<{
    /**
     * Provides a custom temporary directory for use when extracting compressed modules.
     *
     * **Warning:** if this is specified, the caller must make sure the provided directory is unique.
     *
     * Defaults to a randomised directory in `os.tmpdir()`.
     */
    temporaryDirectory: string;
    /**
     * Maximum amount of retries when downloading a module fails.
     *
     * Defaults to `5`.
     */
    maxModuleRetries: number;
    /**
     * Whether to force a fresh install.
     *
     * Defaults to `false`.
     */
    forceFreshInstall: boolean;
    /**
     * Whether to force using cache busting for the manifest.
     *
     * Defaults to `false`.
     */
    forceManifestCacheBust: boolean;
    forceCacheBust: boolean;
    /**
     * Disables falling back to a full module download after exhausting the max amount of module retries.
     *
     * Defaults to `false`.
     */
    disableFallbackToFull: boolean;
    /**
     * The ratio at which to force a full install.
     *
     * Default turns this behaviour off; 0.5 means more than half of total modules updated or added leads to a full install.
     */
    forceFullInstallRatio: number;
}>;
declare const FragmenterInstaller_base: new () => TypedEventEmitter<FragmenterInstallerEvents>;
export declare class FragmenterInstaller extends FragmenterInstaller_base {
    private readonly ctx;
    private readonly baseUrl;
    private readonly destDir;
    private readonly options;
    constructor(ctx: FragmenterContext, baseUrl: string, destDir: string, options: InstallOptions);
    install(): Promise<InstallInfo>;
    private doInstall;
    private performFullInstall;
    private performModularUpdate;
    downloadAndInstallModule(module: DistributionModule, moduleIndex: number, fullModuleHash: string, move?: boolean): Promise<void>;
    private tryDownloadAndInstallModule;
    private cleanupTempModuleFiles;
    /**
     * Normalize module.sourceDir to an array of strings
     */
    private getModuleSourceDirs;
    private moveOverBackedUpFiles;
    private moveOverExtractedFiles;
    private moveOverModuleFiles;
    private ensureTempDirExists;
    private ensureTempDirRemoved;
    private ensureDestDirIsEmpty;
    private backupExistingFiles;
    private restoreBackedUpFiles;
    private finishInstall;
}
export {};
