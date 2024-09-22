import { FragmenterUpdateCheckerEvents, InstallManifest, NeedsUpdateOptions, UpdateInfo } from './types';
import TypedEventEmitter from './typed-emitter';
declare const FragmenterUpdateChecker_base: new () => TypedEventEmitter<FragmenterUpdateCheckerEvents>;
export declare class FragmenterUpdateChecker extends FragmenterUpdateChecker_base {
    /**
     * Check whether a destination directory is up to date or needs to be updated.
     *
     * @param source Base URL of the artifact server.
     * @param destDir Directory to validate.
     * @param options Advanced options for the check.
     */
    needsUpdate(source: string, destDir: string, options?: NeedsUpdateOptions): Promise<UpdateInfo>;
}
/**
 * Get the current install manifest.
 * @param destDir Directory to search.
 */
export declare function getCurrentInstall(destDir: string): InstallManifest;
export {};
