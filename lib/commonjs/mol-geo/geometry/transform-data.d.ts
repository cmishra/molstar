/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../mol-util';
import { Mat4 } from '../../mol-math/linear-algebra';
import { Sphere3D } from '../../mol-math/geometry';
import { InstanceGrid } from '../../mol-math/geometry/instance-grid';
export type TransformData = {
    /**
     * final per-instance transform calculated for instance `i` as
     * `aTransform[i] = matrix * transform[i] * extraTransform[i]`
     */
    aTransform: ValueCell<Float32Array>;
    /** global transform, see aTransform */
    matrix: ValueCell<Mat4>;
    /** base per-instance transform, see aTransform */
    transform: ValueCell<Float32Array>;
    /** additional per-instance transform, see aTransform */
    extraTransform: ValueCell<Float32Array>;
    uInstanceCount: ValueCell<number>;
    instanceCount: ValueCell<number>;
    aInstance: ValueCell<Float32Array>;
    hasReflection: ValueCell<boolean>;
    instanceGrid: ValueCell<InstanceGrid>;
};
export declare function createTransform(transformArray: Float32Array, instanceCount: number, invariantBoundingSphere: Sphere3D | undefined, cellSize: number, batchSize: number, transformData?: TransformData): TransformData;
export declare function createIdentityTransform(transformData?: TransformData): TransformData;
export declare function fillIdentityTransform(transform: Float32Array, count: number): Float32Array<ArrayBufferLike>;
/**
 * updates per-instance transform calculated for instance `i` as
 * `aTransform[i] = matrix * transform[i] * extraTransform[i]`
 */
export declare function updateTransformData(transformData: TransformData, invariantBoundingSphere: Sphere3D | undefined, cellSize: number, batchSize: number): void;
