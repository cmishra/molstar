/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ComplexVisual } from '../../../mol-repr/structure/complex-visual';
export declare const InteractionsInterUnitParams: {
    sizeFactor: PD.Numeric;
    dashCount: PD.Numeric;
    dashScale: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    includeParent: PD.BooleanParam;
    parentDisplay: PD.Select<"stub" | "full" | "between">;
    linkScale: PD.Numeric;
    linkSpacing: PD.Numeric;
    linkCap: PD.BooleanParam;
    aromaticScale: PD.Numeric;
    aromaticSpacing: PD.Numeric;
    aromaticDashCount: PD.Numeric;
    dashCap: PD.BooleanParam;
    stubCap: PD.BooleanParam;
    radialSegments: PD.Numeric;
    colorMode: PD.Select<"default" | "interpolate">;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    bumpFrequency: PD.Numeric;
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
    density: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
};
export type InteractionsInterUnitParams = typeof InteractionsInterUnitParams;
export declare function InteractionsInterUnitVisual(materialId: number): ComplexVisual<InteractionsInterUnitParams>;
