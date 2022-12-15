import { BuildManifest, DistributionManifest } from "./types";
/**
 * Build the individual zip files with the provided spec.
 * @param buildManifest Specification for the source, destination and modules to build.
 */
export declare function pack(buildManifest: BuildManifest): Promise<DistributionManifest>;
