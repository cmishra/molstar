/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Representation, RepresentationParamsGetter, RepresentationContext } from '../../representation';
import { StructureElement } from '../../../mol-model/structure';
export interface OrientationData {
    locis: StructureElement.Loci[];
}
export declare const OrientationParams: {
    visuals: PD.MultiSelect<"box" | "axes" | "ellipsoid">;
    color: PD.Color;
    scaleFactor: PD.Numeric;
    radiusScale: PD.Numeric;
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
export type OrientationParams = typeof OrientationParams;
export type OrientationProps = PD.Values<OrientationParams>;
export type OrientationRepresentation = Representation<OrientationData, OrientationParams>;
export declare function OrientationRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<OrientationData, OrientationParams>): OrientationRepresentation;
