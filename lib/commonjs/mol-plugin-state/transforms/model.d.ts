/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 */
import { Mat4 } from '../../mol-math/linear-algebra';
import { StructureElement, Frame } from '../../mol-model/structure';
import { Expression } from '../../mol-script/language/expression';
import { Script } from '../../mol-script/script';
import { StateTransformer } from '../../mol-state';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginStateObject as SO } from '../objects';
export { CoordinatesFromDcd };
export { CoordinatesFromXtc };
export { CoordinatesFromTrr };
export { CoordinatesFromNctraj };
export { CoordinatesFromLammpstraj };
export { TopologyFromPsf };
export { TopologyFromPrmtop };
export { TopologyFromTop };
export { TrajectoryFromModelAndCoordinates };
export { TrajectoryFromBlob };
export { TrajectoryFromMmCif };
export { TrajectoryFromPDB };
export { TrajectoryFromGRO };
export { TrajectoryFromXYZ };
export { TrajectoryFromLammpsData };
export { TrajectoryFromLammpsTrajData };
export { TrajectoryFromMOL };
export { TrajectoryFromSDF };
export { TrajectoryFromMOL2 };
export { TrajectoryFromCube };
export { TrajectoryFromCifCore };
export { ModelFromTrajectory };
export { ModelWithCoordinates };
export { StructureFromTrajectory };
export { StructureFromModel };
export { TransformStructureConformation };
export { StructureSelectionFromExpression };
export { MultiStructureSelectionFromExpression };
export { MultiStructureSelectionFromBundle };
export { StructureSelectionFromScript };
export { StructureSelectionFromBundle };
export { StructureComplexElement };
export { StructureComponent };
export { CustomModelProperties };
export { CustomStructureProperties };
export { ShapeFromPly };
type CoordinatesFromDcd = typeof CoordinatesFromDcd;
declare const CoordinatesFromDcd: StateTransformer<SO.Data.Binary, SO.Molecule.Coordinates, PD.Normalize<{}>>;
type CoordinatesFromXtc = typeof CoordinatesFromXtc;
declare const CoordinatesFromXtc: StateTransformer<SO.Data.Binary, SO.Molecule.Coordinates, PD.Normalize<{}>>;
type CoordinatesFromTrr = typeof CoordinatesFromTrr;
declare const CoordinatesFromTrr: StateTransformer<SO.Data.Binary, SO.Molecule.Coordinates, PD.Normalize<{}>>;
type CoordinatesFromNctraj = typeof CoordinatesFromNctraj;
declare const CoordinatesFromNctraj: StateTransformer<SO.Data.Binary, SO.Molecule.Coordinates, PD.Normalize<{}>>;
type CoordinatesFromLammpstraj = typeof CoordinatesFromLammpstraj;
declare const CoordinatesFromLammpstraj: StateTransformer<SO.Data.String, SO.Molecule.Coordinates, PD.Normalize<{}>>;
type TopologyFromPsf = typeof TopologyFromPsf;
declare const TopologyFromPsf: StateTransformer<SO.Format.Psf, SO.Molecule.Topology, PD.Normalize<{}>>;
type TopologyFromPrmtop = typeof TopologyFromPrmtop;
declare const TopologyFromPrmtop: StateTransformer<SO.Format.Prmtop, SO.Molecule.Topology, PD.Normalize<{}>>;
type TopologyFromTop = typeof TopologyFromTop;
declare const TopologyFromTop: StateTransformer<SO.Format.Top, SO.Molecule.Topology, PD.Normalize<{}>>;
type TrajectoryFromModelAndCoordinates = typeof TrajectoryFromModelAndCoordinates;
declare const TrajectoryFromModelAndCoordinates: StateTransformer<SO.Root, SO.Molecule.Trajectory, PD.Normalize<{
    modelRef: string;
    coordinatesRef: string;
}>>;
type TrajectoryFromBlob = typeof TrajectoryFromBlob;
declare const TrajectoryFromBlob: StateTransformer<SO.Format.Blob, SO.Molecule.Trajectory, PD.Normalize<{}>>;
type TrajectoryFromMmCif = typeof TrajectoryFromMmCif;
declare const TrajectoryFromMmCif: StateTransformer<SO.Format.Cif, SO.Molecule.Trajectory, PD.Normalize<{
    loadAllBlocks: boolean | undefined;
    blockHeader: string | undefined;
    blockIndex: number | undefined;
}>>;
type TrajectoryFromPDB = typeof TrajectoryFromPDB;
declare const TrajectoryFromPDB: StateTransformer<SO.Data.String, SO.Molecule.Trajectory, PD.Normalize<{
    isPdbqt: boolean;
}>>;
type TrajectoryFromGRO = typeof TrajectoryFromGRO;
declare const TrajectoryFromGRO: StateTransformer<SO.Data.String, SO.Molecule.Trajectory, PD.Normalize<{}>>;
type TrajectoryFromXYZ = typeof TrajectoryFromXYZ;
declare const TrajectoryFromXYZ: StateTransformer<SO.Data.String, SO.Molecule.Trajectory, PD.Normalize<{}>>;
type TrajectoryFromLammpsData = typeof TrajectoryFromLammpsData;
declare const TrajectoryFromLammpsData: StateTransformer<SO.Data.String, SO.Molecule.Trajectory, PD.Normalize<{
    unitsStyle: "metal" | "si" | "lj" | "real" | "cgs" | "electron" | "micro" | "nano";
}>>;
type TrajectoryFromLammpsTrajData = typeof TrajectoryFromLammpsTrajData;
declare const TrajectoryFromLammpsTrajData: StateTransformer<SO.Data.String, SO.Molecule.Trajectory, PD.Normalize<{
    unitsStyle: "metal" | "si" | "lj" | "real" | "cgs" | "electron" | "micro" | "nano";
}>>;
type TrajectoryFromMOL = typeof TrajectoryFromMOL;
declare const TrajectoryFromMOL: StateTransformer<SO.Data.String, SO.Molecule.Trajectory, PD.Normalize<{}>>;
type TrajectoryFromSDF = typeof TrajectoryFromSDF;
declare const TrajectoryFromSDF: StateTransformer<SO.Data.String, SO.Molecule.Trajectory, PD.Normalize<{}>>;
type TrajectoryFromMOL2 = typeof TrajectoryFromMOL;
declare const TrajectoryFromMOL2: StateTransformer<SO.Data.String, SO.Molecule.Trajectory, PD.Normalize<{}>>;
type TrajectoryFromCube = typeof TrajectoryFromCube;
declare const TrajectoryFromCube: StateTransformer<SO.Format.Cube, SO.Molecule.Trajectory, PD.Normalize<{}>>;
type TrajectoryFromCifCore = typeof TrajectoryFromCifCore;
declare const TrajectoryFromCifCore: StateTransformer<SO.Format.Cif, SO.Molecule.Trajectory, PD.Normalize<{
    blockHeader: string | undefined;
}>>;
type ModelFromTrajectory = typeof ModelFromTrajectory;
declare const ModelFromTrajectory: StateTransformer<SO.Molecule.Trajectory, SO.Molecule.Model, PD.Normalize<{
    modelIndex: number;
}>>;
type StructureFromTrajectory = typeof StructureFromTrajectory;
declare const StructureFromTrajectory: StateTransformer<SO.Molecule.Trajectory, SO.Molecule.Structure, PD.Normalize<{}>>;
type StructureFromModel = typeof StructureFromModel;
declare const StructureFromModel: StateTransformer<SO.Molecule.Model, SO.Molecule.Structure, PD.Normalize<{
    type: PD.NamedParams<PD.Normalize<{
        dynamicBonds: /*elided*/ any;
    }>, "auto"> | PD.NamedParams<PD.Normalize<{
        dynamicBonds: /*elided*/ any;
        id: /*elided*/ any;
    }>, "assembly"> | PD.NamedParams<PD.Normalize<{
        dynamicBonds: /*elided*/ any;
        ijkMin: /*elided*/ any;
        ijkMax: /*elided*/ any;
    }>, "symmetry"> | PD.NamedParams<PD.Normalize<{
        dynamicBonds: /*elided*/ any;
    }>, "model"> | PD.NamedParams<PD.Normalize<{
        dynamicBonds: /*elided*/ any;
        radius: /*elided*/ any;
    }>, "symmetry-mates"> | PD.NamedParams<PD.Normalize<{
        dynamicBonds: /*elided*/ any;
        generators: /*elided*/ any;
    }>, "symmetry-assembly">;
}>>;
type TransformStructureConformation = typeof TransformStructureConformation;
declare const TransformStructureConformation: StateTransformer<SO.Molecule.Structure, SO.Molecule.Structure, PD.Normalize<{
    transform: PD.NamedParams<PD.Normalize<{
        data: /*elided*/ any;
        transpose: /*elided*/ any;
    }>, "matrix"> | PD.NamedParams<PD.Normalize<{
        axis: /*elided*/ any;
        angle: /*elided*/ any;
        translation: /*elided*/ any;
    }>, "components">;
}>>;
type ModelWithCoordinates = typeof ModelWithCoordinates;
declare const ModelWithCoordinates: StateTransformer<SO.Molecule.Model, SO.Molecule.Model, PD.Normalize<{
    frameIndex: number | undefined;
    frameCount: number | undefined;
    atomicCoordinateFrame: Frame | undefined;
}>>;
type StructureSelectionFromExpression = typeof StructureSelectionFromExpression;
declare const StructureSelectionFromExpression: StateTransformer<SO.Molecule.Structure, SO.Molecule.Structure, PD.Normalize<{
    expression: Expression;
    label: string | undefined;
}>>;
type MultiStructureSelectionFromExpression = typeof MultiStructureSelectionFromExpression;
declare const MultiStructureSelectionFromExpression: StateTransformer<SO.Root, SO.Molecule.Structure.Selections, PD.Normalize<{
    selections: PD.Normalize<{
        key: /*elided*/ any;
        ref: /*elided*/ any;
        groupId: /*elided*/ any;
        expression: /*elided*/ any;
    }>[];
    isTransitive: boolean | undefined;
    label: string | undefined;
}>>;
type MultiStructureSelectionFromBundle = typeof MultiStructureSelectionFromBundle;
declare const MultiStructureSelectionFromBundle: StateTransformer<SO.Root, SO.Molecule.Structure.Selections, PD.Normalize<{
    selections: PD.Normalize<{
        key: /*elided*/ any;
        ref: /*elided*/ any;
        groupId: /*elided*/ any;
        bundle: /*elided*/ any;
    }>[];
    isTransitive: boolean | undefined;
    label: string | undefined;
}>>;
type StructureSelectionFromScript = typeof StructureSelectionFromScript;
declare const StructureSelectionFromScript: StateTransformer<SO.Molecule.Structure, SO.Molecule.Structure, PD.Normalize<{
    script: Script;
    label: string | undefined;
}>>;
type StructureSelectionFromBundle = typeof StructureSelectionFromBundle;
declare const StructureSelectionFromBundle: StateTransformer<SO.Molecule.Structure, SO.Molecule.Structure, PD.Normalize<{
    bundle: StructureElement.Bundle;
    label: string | undefined;
}>>;
export declare const StructureComplexElementTypes: {
    readonly polymer: "polymer";
    readonly protein: "protein";
    readonly nucleic: "nucleic";
    readonly water: "water";
    readonly branched: "branched";
    readonly ligand: "ligand";
    readonly 'non-standard': "non-standard";
    readonly coarse: "coarse";
    readonly 'atomic-sequence': "atomic-sequence";
    readonly 'atomic-het': "atomic-het";
    readonly spheres: "spheres";
};
export type StructureComplexElementTypes = keyof typeof StructureComplexElementTypes;
type StructureComplexElement = typeof StructureComplexElement;
declare const StructureComplexElement: StateTransformer<SO.Molecule.Structure, SO.Molecule.Structure, PD.Normalize<{
    type: "spheres" | "polymer" | "water" | "branched" | "ligand" | "protein" | "nucleic" | "coarse" | "non-standard" | "atomic-sequence" | "atomic-het";
}>>;
type StructureComponent = typeof StructureComponent;
declare const StructureComponent: StateTransformer<SO.Molecule.Structure, SO.Molecule.Structure, PD.Normalize<{
    type: PD.NamedParams<"all" | "polymer" | "water" | "branched" | "ligand" | "ion" | "lipid" | "protein" | "nucleic" | "coarse" | "non-standard", "static"> | PD.NamedParams<Script, "script"> | PD.NamedParams<Expression, "expression"> | PD.NamedParams<StructureElement.Bundle, "bundle">;
    nullIfEmpty: boolean | undefined;
    label: string;
}>>;
type CustomModelProperties = typeof CustomModelProperties;
declare const CustomModelProperties: StateTransformer<SO.Molecule.Model, SO.Molecule.Model, PD.Normalize<{
    autoAttach: string[];
    properties: PD.Normalize<{
        [x: string]: /*elided*/ any;
    }>;
}>>;
type CustomStructureProperties = typeof CustomStructureProperties;
declare const CustomStructureProperties: StateTransformer<SO.Molecule.Structure, SO.Molecule.Structure, PD.Normalize<{
    autoAttach: string[];
    properties: PD.Normalize<{
        [x: string]: /*elided*/ any;
    }>;
}>>;
type ShapeFromPly = typeof ShapeFromPly;
declare const ShapeFromPly: StateTransformer<SO.Format.Ply, SO.Shape.Provider, PD.Normalize<{
    transforms: Mat4[] | undefined;
    label: string | undefined;
}>>;
