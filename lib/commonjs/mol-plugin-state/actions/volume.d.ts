/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StateAction, StateTransformer } from '../../mol-state';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginStateObject } from '../objects';
export type EmdbDownloadProvider = 'pdbe' | 'rcsb';
export { DownloadDensity };
type DownloadDensity = typeof DownloadDensity;
declare const DownloadDensity: StateAction<PluginStateObject.Root, void, PD.Normalize<{
    source: PD.NamedParams<PD.Normalize<{
        url: /*elided*/ any;
        isBinary: /*elided*/ any;
        format: /*elided*/ any;
    }>, "url"> | PD.NamedParams<PD.Normalize<{
        provider: /*elided*/ any;
        type: /*elided*/ any;
    }>, "pdb-xray"> | PD.NamedParams<PD.Normalize<{
        provider: /*elided*/ any;
        detail: /*elided*/ any;
    }>, "pdb-xray-ds"> | PD.NamedParams<PD.Normalize<{
        provider: /*elided*/ any;
        detail: /*elided*/ any;
    }>, "pdb-emd-ds">;
}>>;
export declare const AssignColorVolume: StateAction<PluginStateObject.Volume.Data, Promise<import("../../mol-state").StateObjectSelector<PluginStateObject.Volume.Data, StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>, PD.Normalize<{
    ref: string;
}>>;
