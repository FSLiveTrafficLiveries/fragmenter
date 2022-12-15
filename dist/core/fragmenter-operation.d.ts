import { DistributionModule } from '../types';
export declare enum FragmenterOperation {
    NotStarted = 0,
    UpdateCheck = 1,
    InstallBegin = 2,
    InstallModuleDownload = 3,
    InstallModuleDecompress = 4,
    InstallFinish = 5,
    InstallFailRestore = 6,
    Done = 7
}
interface GenericFragmenterPhase {
    op: FragmenterOperation;
}
interface NotStartedPhase extends GenericFragmenterPhase {
    op: FragmenterOperation.NotStarted;
}
interface UpdateCheckPhase extends GenericFragmenterPhase {
    op: FragmenterOperation.UpdateCheck;
}
interface InstallBeginPhase extends GenericFragmenterPhase {
    op: FragmenterOperation.InstallBegin;
}
interface InstallModuleDownloadPhase extends GenericFragmenterPhase {
    op: FragmenterOperation.InstallModuleDownload;
    module: DistributionModule;
    moduleIndex: number;
}
interface InstallModuleDecompressPhase extends GenericFragmenterPhase {
    op: FragmenterOperation.InstallModuleDecompress;
    module: DistributionModule;
    moduleIndex: number;
}
interface InstallFinishPhase extends GenericFragmenterPhase {
    op: FragmenterOperation.InstallFinish;
}
interface InstallFailRestorePhase extends GenericFragmenterPhase {
    op: FragmenterOperation.InstallFailRestore;
}
interface DonePhase extends GenericFragmenterPhase {
    op: FragmenterOperation.Done;
}
export declare type FragmenterPhase = NotStartedPhase | UpdateCheckPhase | InstallBeginPhase | InstallModuleDownloadPhase | InstallModuleDecompressPhase | InstallFinishPhase | InstallFailRestorePhase | DonePhase;
export {};
