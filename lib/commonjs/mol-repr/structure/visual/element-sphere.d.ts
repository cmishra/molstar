/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsVisual } from '../units-visual';
import { WebGLContext } from '../../../mol-gl/webgl/context';
import { Structure } from '../../../mol-model/structure';
import { ComplexVisual } from '../complex-visual';
export declare const CommonElementSphereParams: {
    sizeFactor: PD.Numeric;
    detail: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    traceOnly: PD.BooleanParam;
    tryUseImpostor: PD.BooleanParam;
    stride: PD.Numeric;
};
export declare const ElementSphereParams: {
    sizeFactor: PD.Numeric;
    detail: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    traceOnly: PD.BooleanParam;
    tryUseImpostor: PD.BooleanParam;
    stride: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    doubleSided: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    solidInterior: PD.BooleanParam;
    clipPrimitive: PD.BooleanParam;
    approximate: PD.BooleanParam;
    alphaThickness: PD.Numeric;
    bumpFrequency: PD.Numeric;
    bumpAmplitude: PD.Numeric;
    lodLevels: PD.ObjectList<PD.Normalize<{
        minDistance: number;
        maxDistance: number;
        overlap: number;
        stride: number;
        scaleBias: number;
    }>>;
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
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
};
export type ElementSphereParams = typeof ElementSphereParams;
export declare function ElementSphereVisual(materialId: number, structure: Structure, props: PD.Values<ElementSphereParams>, webgl?: WebGLContext): UnitsVisual<{
    sizeFactor: PD.Numeric;
    detail: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    traceOnly: PD.BooleanParam;
    tryUseImpostor: PD.BooleanParam;
    stride: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    doubleSided: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    solidInterior: PD.BooleanParam;
    clipPrimitive: PD.BooleanParam;
    approximate: PD.BooleanParam;
    alphaThickness: PD.Numeric;
    bumpFrequency: PD.Numeric;
    bumpAmplitude: PD.Numeric;
    lodLevels: PD.ObjectList<PD.Normalize<{
        minDistance: number;
        maxDistance: number;
        overlap: number;
        stride: number;
        scaleBias: number;
    }>>;
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
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
}>;
export declare function ElementSphereImpostorVisual(materialId: number): UnitsVisual<ElementSphereParams>;
export declare function ElementSphereMeshVisual(materialId: number): UnitsVisual<ElementSphereParams>;
export declare const StructureElementSphereParams: {
    sizeFactor: PD.Numeric;
    detail: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    traceOnly: PD.BooleanParam;
    tryUseImpostor: PD.BooleanParam;
    stride: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    doubleSided: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    solidInterior: PD.BooleanParam;
    clipPrimitive: PD.BooleanParam;
    approximate: PD.BooleanParam;
    alphaThickness: PD.Numeric;
    bumpFrequency: PD.Numeric;
    bumpAmplitude: PD.Numeric;
    lodLevels: PD.ObjectList<PD.Normalize<{
        minDistance: number;
        maxDistance: number;
        overlap: number;
        stride: number;
        scaleBias: number;
    }>>;
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
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
};
export type StructureElementSphereParams = typeof ElementSphereParams;
export declare function StructureElementSphereVisual(materialId: number, structure: Structure, props: PD.Values<ElementSphereParams>, webgl?: WebGLContext): ComplexVisual<{
    sizeFactor: PD.Numeric;
    detail: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    traceOnly: PD.BooleanParam;
    tryUseImpostor: PD.BooleanParam;
    stride: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    includeParent: PD.BooleanParam;
    doubleSided: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    solidInterior: PD.BooleanParam;
    clipPrimitive: PD.BooleanParam;
    approximate: PD.BooleanParam;
    alphaThickness: PD.Numeric;
    bumpFrequency: PD.Numeric;
    bumpAmplitude: PD.Numeric;
    lodLevels: PD.ObjectList<PD.Normalize<{
        minDistance: number;
        maxDistance: number;
        overlap: number;
        stride: number;
        scaleBias: number;
    }>>;
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
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
}>;
export declare function StructureElementSphereImpostorVisual(materialId: number): ComplexVisual<StructureElementSphereParams>;
export declare function StructureElementSphereMeshVisual(materialId: number): ComplexVisual<StructureElementSphereParams>;
