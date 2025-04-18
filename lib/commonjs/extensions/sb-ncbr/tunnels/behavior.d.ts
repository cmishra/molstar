/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
import { PluginBehavior } from '../../../mol-plugin/behavior';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureRepresentationPresetProvider } from '../../../mol-plugin-state/builder/structure/representation-preset';
import { Structure } from '../../../mol-model/structure';
export declare const SbNcbrTunnels: import("../../../mol-state").StateTransformer<PluginBehavior.Category, PluginBehavior.Behavior, {
    autoAttach: boolean;
}>;
export declare function isApplicable(structure?: Structure): boolean;
export declare const TunnelsPreset: StructureRepresentationPresetProvider<{
    serverType: "pdb";
    serverUrl: string;
    ignoreHydrogens: boolean | undefined;
    ignoreHydrogensVariant: "all" | "non-polar" | undefined;
    ignoreLight: boolean | undefined;
    quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest" | undefined;
    theme: PD.Normalize<{
        globalName: /*elided*/ any;
        globalColorParams: /*elided*/ any;
        carbonColor: /*elided*/ any;
        symmetryColor: /*elided*/ any;
        symmetryColorParams: /*elided*/ any;
        focus: /*elided*/ any;
    }> | undefined;
}, {
    components?: undefined;
    representations?: undefined;
} | {
    components: {
        polymer: import("../../../mol-state").StateObjectSelector<import("../../../mol-plugin-state/objects").PluginStateObject.Molecule.Structure, import("../../../mol-state").StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>> | undefined;
    } | {
        all: import("../../../mol-state").StateObjectSelector<import("../../../mol-plugin-state/objects").PluginStateObject.Molecule.Structure, import("../../../mol-state").StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>> | undefined;
        branched: undefined;
    } | undefined;
    representations: {};
}>;
