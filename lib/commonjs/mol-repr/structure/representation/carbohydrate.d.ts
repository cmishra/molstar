/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure } from '../../../mol-model/structure';
import { RepresentationContext, RepresentationParamsGetter } from '../../../mol-repr/representation';
import { ThemeRegistryContext } from '../../../mol-theme/theme';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureRepresentation, StructureRepresentationProvider } from '../representation';
export declare const CarbohydrateParams: {
    visuals: PD.MultiSelect<"carbohydrate-symbol" | "carbohydrate-link" | "carbohydrate-terminal-link">;
    bumpFrequency: PD.Numeric;
    density: PD.Numeric;
    terminalLinkSizeFactor: PD.Numeric;
    linkScale: PD.Numeric;
    linkSpacing: PD.Numeric;
    linkCap: PD.BooleanParam;
    aromaticScale: PD.Numeric;
    aromaticSpacing: PD.Numeric;
    aromaticDashCount: PD.Numeric;
    dashCount: PD.Numeric;
    dashScale: PD.Numeric;
    dashCap: PD.BooleanParam;
    stubCap: PD.BooleanParam;
    radialSegments: PD.Numeric;
    colorMode: PD.Select<"default" | "interpolate">;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    bumpAmplitude: PD.Numeric;
    alpha: PD.Numeric;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    emissive: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
    linkSizeFactor: PD.Numeric;
    detail: PD.Numeric;
    sizeFactor: PD.Numeric;
};
export type CarbohydrateParams = typeof CarbohydrateParams;
export declare function getCarbohydrateParams(ctx: ThemeRegistryContext, structure: Structure): {
    visuals: PD.MultiSelect<"carbohydrate-symbol" | "carbohydrate-link" | "carbohydrate-terminal-link">;
    bumpFrequency: PD.Numeric;
    density: PD.Numeric;
    terminalLinkSizeFactor: PD.Numeric;
    linkScale: PD.Numeric;
    linkSpacing: PD.Numeric;
    linkCap: PD.BooleanParam;
    aromaticScale: PD.Numeric;
    aromaticSpacing: PD.Numeric;
    aromaticDashCount: PD.Numeric;
    dashCount: PD.Numeric;
    dashScale: PD.Numeric;
    dashCap: PD.BooleanParam;
    stubCap: PD.BooleanParam;
    radialSegments: PD.Numeric;
    colorMode: PD.Select<"default" | "interpolate">;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    bumpAmplitude: PD.Numeric;
    alpha: PD.Numeric;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    emissive: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
    linkSizeFactor: PD.Numeric;
    detail: PD.Numeric;
    sizeFactor: PD.Numeric;
};
export type CarbohydrateRepresentation = StructureRepresentation<CarbohydrateParams>;
export declare function CarbohydrateRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, CarbohydrateParams>): CarbohydrateRepresentation;
export declare const CarbohydrateRepresentationProvider: StructureRepresentationProvider<{
    visuals: PD.MultiSelect<"carbohydrate-symbol" | "carbohydrate-link" | "carbohydrate-terminal-link">;
    bumpFrequency: PD.Numeric;
    density: PD.Numeric;
    terminalLinkSizeFactor: PD.Numeric;
    linkScale: PD.Numeric;
    linkSpacing: PD.Numeric;
    linkCap: PD.BooleanParam;
    aromaticScale: PD.Numeric;
    aromaticSpacing: PD.Numeric;
    aromaticDashCount: PD.Numeric;
    dashCount: PD.Numeric;
    dashScale: PD.Numeric;
    dashCap: PD.BooleanParam;
    stubCap: PD.BooleanParam;
    radialSegments: PD.Numeric;
    colorMode: PD.Select<"default" | "interpolate">;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    bumpAmplitude: PD.Numeric;
    alpha: PD.Numeric;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    emissive: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
    linkSizeFactor: PD.Numeric;
    detail: PD.Numeric;
    sizeFactor: PD.Numeric;
}, "carbohydrate">;
