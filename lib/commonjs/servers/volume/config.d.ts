/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
declare const DefaultServerConfig: {
    apiPrefix: string;
    defaultPort: number;
    shutdownTimeoutMinutes: number;
    shutdownTimeoutVarianceMinutes: number;
    idMap: [string, string][];
    healthCheckPath: string[];
};
export interface ServerJsonConfig {
    cfg?: string;
    printCfg?: any;
    cfgTemplate?: any;
}
export type ServerConfig = typeof DefaultServerConfig;
export declare const ServerConfig: {
    apiPrefix: string;
    defaultPort: number;
    shutdownTimeoutMinutes: number;
    shutdownTimeoutVarianceMinutes: number;
    idMap: [string, string][];
    healthCheckPath: string[];
};
declare const DefaultLimitsConfig: {
    maxRequestBlockCount: number;
    maxFractionalBoxVolume: number;
    maxOutputSizeInVoxelCountByPrecisionLevel: number[];
};
export type LimitsConfig = typeof DefaultLimitsConfig;
export declare const LimitsConfig: {
    maxRequestBlockCount: number;
    maxFractionalBoxVolume: number;
    maxOutputSizeInVoxelCountByPrecisionLevel: number[];
};
export declare function configureServer(): void;
export declare function configureLocal(): {
    maxRequestBlockCount: number;
    maxFractionalBoxVolume: number;
    maxOutputSizeInVoxelCountByPrecisionLevel: number[];
} & {
    jobs: string;
    jobsTemplate: any;
};
export {};
