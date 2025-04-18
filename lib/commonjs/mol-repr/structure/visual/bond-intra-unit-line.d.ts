/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsVisual } from '../units-visual';
import { ComplexVisual } from '../complex-visual';
export declare const IntraUnitBondLineParams: {
    includeParent: PD.BooleanParam;
    includeTypes: PD.MultiSelect<"covalent" | "metal-coordination" | "hydrogen-bond" | "disulfide" | "aromatic" | "computed">;
    excludeTypes: PD.MultiSelect<"covalent" | "metal-coordination" | "hydrogen-bond" | "disulfide" | "aromatic" | "computed">;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    aromaticBonds: PD.BooleanParam;
    multipleBonds: PD.Select<"offset" | "off" | "symmetric">;
    linkScale: PD.Numeric;
    linkSpacing: PD.Numeric;
    aromaticDashCount: PD.Numeric;
    dashCount: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    sizeFactor: PD.Numeric;
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
export type IntraUnitBondLineParams = typeof IntraUnitBondLineParams;
export declare function IntraUnitBondLineVisual(materialId: number): UnitsVisual<IntraUnitBondLineParams>;
export declare const StructureIntraUnitBondLineParams: {
    includeParent: PD.BooleanParam;
    includeTypes: PD.MultiSelect<"covalent" | "metal-coordination" | "hydrogen-bond" | "disulfide" | "aromatic" | "computed">;
    excludeTypes: PD.MultiSelect<"covalent" | "metal-coordination" | "hydrogen-bond" | "disulfide" | "aromatic" | "computed">;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    aromaticBonds: PD.BooleanParam;
    multipleBonds: PD.Select<"offset" | "off" | "symmetric">;
    linkScale: PD.Numeric;
    linkSpacing: PD.Numeric;
    aromaticDashCount: PD.Numeric;
    dashCount: PD.Numeric;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    sizeFactor: PD.Numeric;
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
export type StructureIntraUnitBondLineParams = typeof StructureIntraUnitBondLineParams;
export declare function StructureIntraUnitBondLineVisual(materialId: number): ComplexVisual<StructureIntraUnitBondLineParams>;
