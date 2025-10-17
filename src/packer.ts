import fs from "fs-extra";
import { Zip } from "zip-lib";
import SplitFile from "split-file";
import path from "path";
// eslint-disable-next-line import/no-unresolved
import readRecurse from "fs-readdir-recursive";
// eslint-disable-next-line import/no-unresolved
import hasha from "hasha";
import {
  BuildManifest,
  CrcInfo,
  DistributionManifest,
  PackOptions,
} from "./types";
import {
  BASE_FILE,
  FULL_FILE,
  MODULES_MANIFEST,
  SINGLE_MODULE_MANIFEST,
  DEFAULT_SPLIT_FILE_SIZE,
} from "./constants";
import { rmSync } from "fs";

/**
 * Build the individual zip files with the provided spec.
 * @param buildManifest Specification for the source, destination and modules to build.
 */
export async function pack(
  buildManifest: BuildManifest
): Promise<DistributionManifest> {
  const options: PackOptions = {
    useConsoleLog: true,

    forceCacheBust: false,

    splitFileSize: DEFAULT_SPLIT_FILE_SIZE,

    keepCompleteModulesAfterSplit: true,

    noBaseCopy: false,
  };

  if (buildManifest.packOptions) {
    Object.assign(options, buildManifest.packOptions);
  }

  const generateHashFromPath = async (
    absolutePath: string,
    baseDir: string
  ): Promise<string> => {
    // The hash is undefined if the path doesn't exist.
    if (!fs.existsSync(absolutePath)) {
      return undefined;
    }

    const stats = fs.statSync(absolutePath);

    if (stats.isFile()) {
      const relativePath = path.relative(absolutePath, baseDir);
      const normalizedPath = relativePath.replace(/\\/g, "/");

      return hasha(
        normalizedPath +
          (await hasha.fromStream(fs.createReadStream(absolutePath)))
      );
    } else {
      const directoryPaths = fs
        .readdirSync(absolutePath)
        .map((i) => path.join(absolutePath, i));

      return generateHashFromPaths(directoryPaths, baseDir);
    }
  };

  const generateHashFromPaths = async (
    absolutePaths: string[],
    baseDir: string
  ): Promise<string> => {
    const paths = [];
    for (const absolutePath of absolutePaths) {
      const baseName = path.basename(absolutePath);
      const contentsHash = await generateHashFromPath(absolutePath, baseDir);

      paths.push(hasha(baseName + contentsHash));
    }

    return hasha(paths.join(""));
  };

  const zip = async (
    sourcePath: string,
    zipDest: string
  ): Promise<
    [
      crc: string,
      splitFileCount: number,
      completeModuleSize: number,
      completeFileSizeUncompressed: number
    ]
  > => {
    console.log("[FRAGMENT] Calculating CRC", {
      source: sourcePath,
      dest: zipDest,
    });

    const allFiles = readRecurse(sourcePath).map((i) =>
      path.resolve(sourcePath, i)
    );

    const crcInfo: CrcInfo = {
      hash: await generateHashFromPaths(allFiles, sourcePath),
    };
    await fs.writeJSON(path.join(sourcePath, SINGLE_MODULE_MANIFEST), crcInfo);

    console.log("[FRAGMENT] Creating ZIP", {
      source: sourcePath,
      dest: zipDest,
    });

    const zip = new Zip();
    // Add all files while maintaining directory structure
    for (const file of allFiles) {
      const relativePath = path.relative(sourcePath, file);
      await zip.addFile(file, relativePath);
    }
    await zip.archive(zipDest);

    const zipStat = await fs.stat(zipDest);

    const doSplit =
      options.splitFileSize > 0 && zipStat.size > options.splitFileSize;

    let splitFileCount = 0;
    if (doSplit) {
      console.log(
        `[FRAGMENT] Splitting file ${
          path.parse(zipDest).base
        } because it is larger than 1GB`
      );

      const files = await SplitFile.splitFileBySize(
        zipDest,
        options.splitFileSize
      );

      console.log(
        `[FRAGMENT] Split file ${path.parse(zipDest).base} into ${
          files.length
        } parts`
      );

      splitFileCount = files.length;

      if (!options.keepCompleteModulesAfterSplit) {
        fs.rmSync(zipDest);
      }
    }

    console.log("[FRAGMENT] Done writing zip", zipDest);

    const sizeUncompressed = allFiles.reduce<number>(
      (accu: number, filePath: string) => accu + fs.statSync(filePath).size,
      0
    );

    return [crcInfo.hash, splitFileCount, zipStat.size, sizeUncompressed];
  };

  const zipAndDelete = async (
    sourcePath: string,
    zipDest: string
  ): Promise<
    [
      crc: string,
      splitFileCount: number,
      completeModuleSize: number,
      completeFileSizeUncompressed: number
    ]
  > => {
    const res = await zip(sourcePath, zipDest);

    fs.rmdirSync(sourcePath, { recursive: true });

    return res;
  };

  const toUnixPath = (path: string): string => {
    const isExtendedLengthPath = /^\\\\\?\\/.test(path);
    // eslint-disable-next-line no-control-regex
    const hasNonAscii = /[^\u0000-\u0080]+/.test(path);

    if (isExtendedLengthPath || hasNonAscii) {
      return path;
    }

    return path.replace(/\\/g, "/");
  };

  // Manifest validation: Nested modules are not supported yet
  buildManifest.modules.forEach((moduleA) => {
    if (["base", "full"].includes(moduleA.name.toLowerCase())) {
      throw new Error(`'${moduleA.name}' is a reserved module name`);
    }

    const sourceDirsA = Array.isArray(moduleA.sourceDir) ? moduleA.sourceDir : [moduleA.sourceDir];

    buildManifest.modules.forEach((moduleB) => {
      if (moduleA !== moduleB) {
        const sourceDirsB = Array.isArray(moduleB.sourceDir) ? moduleB.sourceDir : [moduleB.sourceDir];

        // Check each combination of source directories for nesting
        for (const sourceA of sourceDirsA) {
          for (const sourceB of sourceDirsB) {
            const pathDiff = path.relative(sourceA, sourceB);
            
            if (!pathDiff.startsWith("..")) {
              throw new Error(
                `Module '${moduleA.name}' directory '${sourceA}' contains module '${moduleB.name}' directory '${sourceB}'. Modules within modules are not supported yet!`
              );
            }
          }
        }
      }
    });
  });

  const moduleNames: string[] = [""];
  buildManifest.modules.forEach((module) => {
    if (moduleNames.includes(module.name)) {
      throw new Error(
        `Module name '${module.name}' is set for more than one module. Each module must have a unique name!`
      );
    }
    moduleNames.push(module.name);
  });

  if (!fs.existsSync(buildManifest.baseDir)) {
    throw new Error("Base directory does not exist");
  }

  if (fs.existsSync(buildManifest.outDir)) {
    fs.rmdirSync(buildManifest.outDir, { recursive: true });
  }
  fs.mkdirSync(buildManifest.outDir, { recursive: true });

  // Create a temp dir with all required files
  const tempDir = options.noBaseCopy
    ? buildManifest.baseDir
    : await fs.mkdtemp("fbw-build-");

  // Trap everything to ensure a proper cleanup of the temp directory
  try {
    if (!options.noBaseCopy) fs.copySync(buildManifest.baseDir, tempDir);

    const distributionManifest: DistributionManifest = {
      modules: [],
      base: {
        hash: "",
        files: [],
        splitFileCount: 0,
        completeFileSize: 0,
        completeFileSizeUncompressed: 0,
      },
      fullHash: "",
      fullSplitFileCount: 0,
      fullCompleteFileSize: 0,
      fullCompleteFileSizeUncompressed: 0,
    };

    // Create full zip
    console.log("[FRAGMENT] Creating full ZIP");

    [
      distributionManifest.fullHash,
      distributionManifest.fullSplitFileCount,
      distributionManifest.fullCompleteFileSize,
      distributionManifest.fullCompleteFileSizeUncompressed,
    ] = await zip(tempDir, path.join(buildManifest.outDir, FULL_FILE));

    // Zip Modules
    console.log("[FRAGMENT] Creating module ZIPs");

    for (const module of buildManifest.modules) {
      const sourceDirs = Array.isArray(module.sourceDir) ? module.sourceDir : [module.sourceDir];
      const zipDest = path.join(buildManifest.outDir, `${module.name}.zip`);

      // Create a new zip file
      // First calculate CRC for the module
      console.log("[FRAGMENT] Calculating module CRC", {
        module: module.name,
        sourceDirs: sourceDirs,
        dest: zipDest,
      });

      const zip = new Zip();
      let sizeUncompressed = 0;

      // Generate hash for all files in all source directories
      const allFiles = sourceDirs.flatMap(dir => 
        readRecurse(path.join(tempDir, dir)).map(f => path.resolve(tempDir, dir, f))
      );
      const moduleHash = await generateHashFromPaths(allFiles, tempDir);

      console.log("[FRAGMENT] Creating module ZIP", {
        module: module.name,
        sourceDirs: sourceDirs,
        dest: zipDest,
      });

      // Add each source directory to the zip, preserving the directory structure
      for (const dir of sourceDirs) {
        const sourcePath = path.join(tempDir, dir);
        const dirName = path.basename(dir);
        const filesInDir = readRecurse(sourcePath).map((i) => path.resolve(sourcePath, i));
        sizeUncompressed += filesInDir.reduce((accu, filePath) => accu + fs.statSync(filePath).size, 0);
        
        // Add the directory and its contents to maintain structure
        await zip.addFile(sourcePath, dirName);
        for (const file of filesInDir) {
          const relativePath = path.relative(sourcePath, file);
          await zip.addFile(file, path.join(dirName, relativePath));
        }
      }

      // Archive the zip
      await zip.archive(zipDest);
      
      console.log("[FRAGMENT] Done writing module ZIP", zipDest);

      const zipStat = await fs.stat(zipDest);
      const doSplit = options.splitFileSize > 0 && zipStat.size > options.splitFileSize;

      let splitFileCount = 0;
      if (doSplit) {
        console.log(
          `[FRAGMENT] Splitting file ${path.parse(zipDest).base} because it is larger than 1GB`
        );

        const files = await SplitFile.splitFileBySize(zipDest, options.splitFileSize);
        console.log(
          `[FRAGMENT] Split file ${path.parse(zipDest).base} into ${files.length} parts`
        );

        splitFileCount = files.length;

        if (!options.keepCompleteModulesAfterSplit) {
          fs.rmSync(zipDest);
        }
      }

      // Clean up source directories
      for (const dir of sourceDirs) {
        const sourcePath = path.join(tempDir, dir);
        fs.rmdirSync(sourcePath, { recursive: true });
      }

      // Store in manifest
      distributionManifest.modules.push({
        ...module,
        hash: moduleHash,
        splitFileCount,
        completeFileSize: zipStat.size,
        completeFileSizeUncompressed: sizeUncompressed,
      });
    }

    // Zip the rest
    console.log("[FRAGMENT] Creating base ZIP");

    distributionManifest.base.files = readRecurse(tempDir).map(toUnixPath);

    const zipDest = path.join(buildManifest.outDir, BASE_FILE);

    [
      distributionManifest.base.hash,
      distributionManifest.base.splitFileCount,
      distributionManifest.base.completeFileSize,
      distributionManifest.base.completeFileSizeUncompressed,
    ] = await zipAndDelete(tempDir, zipDest);

    await fs.writeJSON(
      path.join(buildManifest.outDir, MODULES_MANIFEST),
      distributionManifest
    );

    return distributionManifest;
  } catch (e) {
    if (!options.noBaseCopy) await fs.rmdirSync(tempDir, { recursive: true });
    throw e;
  }
}
