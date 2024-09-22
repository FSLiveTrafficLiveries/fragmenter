import { BaseCommandOptions } from '../types';
import TypedEventEmitter from '../typed-emitter';
import { FragmenterPhase } from './fragmenter-operation';
export interface FragmenterContextEvents {
    'phaseChange': (phase: FragmenterPhase) => void;
    'logInfo': (...bits: any[]) => void;
    'logWarn': (...bits: any[]) => void;
    'logTrace': (...bits: any[]) => void;
    'logError': (...bits: any[]) => void;
}
declare const FragmenterContext_base: new () => TypedEventEmitter<FragmenterContextEvents>;
export declare class FragmenterContext extends FragmenterContext_base {
    readonly signal: AbortSignal;
    readonly options: BaseCommandOptions;
    private readonly doUseConsole;
    private phase;
    get currentPhase(): FragmenterPhase;
    set currentPhase(phase: FragmenterPhase);
    unrecoverableErrorEncountered: boolean;
    constructor(options: Partial<BaseCommandOptions>, signal: AbortSignal);
    logInfo(...bits: any[]): void;
    logWarn(...bits: any[]): void;
    logTrace(...bits: any[]): void;
    logError(...bits: any[]): void;
}
export {};
