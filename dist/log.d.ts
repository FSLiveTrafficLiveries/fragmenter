import { BaseCommandOptions } from './types';
/**
 * Returns, in this order, the info, warn and error settings for logging.
 *
 * @param options an object extending `BaseCommandOptions`
 */
export declare function getLoggerSettingsFromOptions(options: Partial<BaseCommandOptions>): boolean[];
