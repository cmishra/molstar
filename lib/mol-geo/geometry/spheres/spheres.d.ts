/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../../mol-util';
import { GeometryUtils } from '../geometry';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { TextureImage } from '../../../mol-gl/renderable/util';
import { Sphere3D } from '../../../mol-math/geometry';
import { GroupMapping } from '../../util';
import { Vec2 } from '../../../mol-math/linear-algebra';
export interface Spheres {
    readonly kind: 'spheres';
    /** Number of spheres */
    sphereCount: number;
    /** Center buffer as array of xyz values wrapped in a value cell */
    readonly centerBuffer: ValueCell<Float32Array>;
    /** Group buffer as array of group ids for each vertex wrapped in a value cell */
    readonly groupBuffer: ValueCell<Float32Array>;
    /** Bounding sphere of the spheres */
    readonly boundingSphere: Sphere3D;
    /** Maps group ids to sphere indices */
    readonly groupMapping: GroupMapping;
    setBoundingSphere(boundingSphere: Sphere3D): void;
    shaderData: Spheres.ShaderData;
}
export declare namespace Spheres {
    export interface ShaderData {
        readonly positionGroup: ValueCell<TextureImage<Float32Array>>;
        readonly texDim: ValueCell<Vec2>;
        readonly lodLevels: ValueCell<LodLevelsValue>;
        readonly sizeFactor: ValueCell<number>;
        update(props?: {
            lodLevels: LodLevels;
            sizeFactor: number;
        }): void;
    }
    export function create(centers: Float32Array, groups: Float32Array, sphereCount: number, spheres?: Spheres): Spheres;
    export function createEmpty(spheres?: Spheres): Spheres;
    type LodLevels = {
        minDistance: number;
        maxDistance: number;
        overlap: number;
        stride: number;
        scaleBias: number;
    }[];
    type LodLevelsValue = [minDistance: number, maxDistance: number, overlap: number, count: number, scale: number, stride: number, scaleBias: number][];
    export const Params: {
        sizeFactor: PD.Numeric;
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
    };
    export type Params = typeof Params;
    export const Utils: GeometryUtils<Spheres, Params>;
    export {};
}
