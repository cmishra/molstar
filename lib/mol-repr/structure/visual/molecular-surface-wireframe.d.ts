/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsVisual } from '../units-visual';
export declare const MolecularSurfaceWireframeParams: {
    sizeFactor: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    traceOnly: PD.BooleanParam;
    includeParent: PD.BooleanParam;
    probeRadius: PD.Numeric;
    resolution: PD.Numeric;
    probePositions: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    lineSizeAttenuation: PD.BooleanParam;
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
export type MolecularSurfaceWireframeParams = typeof MolecularSurfaceWireframeParams;
export declare function MolecularSurfaceWireframeVisual(materialId: number): UnitsVisual<MolecularSurfaceWireframeParams>;
