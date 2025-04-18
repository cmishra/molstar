/**
 * Copyright (c) 2019-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Ryan DiRisio <rjdiris@gmail.com>
 */
import { StructureElement } from '../../../mol-model/structure';
import { PluginContext } from '../../../mol-plugin/context';
import { StateTransform, StateTransformer, StateObject, StateObjectCell } from '../../../mol-state';
import { StateTransforms } from '../../transforms';
import { PluginStateObject } from '../../objects';
import { StatefulPluginComponent } from '../../component';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { LociLabelTextParams } from '../../../mol-repr/shape/loci/common';
import { LineParams } from '../../../mol-repr/structure/representation/line';
import { Color } from '../../../mol-util/color';
export { StructureMeasurementManager };
export declare const MeasurementGroupTag = "measurement-group";
export declare const MeasurementOrderLabelTag = "measurement-order-label";
export type StructureMeasurementCell = StateObjectCell<PluginStateObject.Shape.Representation3D, StateTransform<StateTransformer<PluginStateObject.Molecule.Structure.Selections, PluginStateObject.Shape.Representation3D, any>>>;
export declare const StructureMeasurementParams: {
    distanceUnitLabel: PD.Text<string>;
    textColor: PD.Color;
};
export type StructureMeasurementOptions = PD.ValuesFor<typeof StructureMeasurementParams>;
export interface StructureMeasurementManagerState {
    labels: StructureMeasurementCell[];
    distances: StructureMeasurementCell[];
    angles: StructureMeasurementCell[];
    dihedrals: StructureMeasurementCell[];
    orientations: StructureMeasurementCell[];
    planes: StructureMeasurementCell[];
    options: StructureMeasurementOptions;
}
type StructureMeasurementManagerAddOptions = {
    customText?: string;
    selectionTags?: string | string[];
    reprTags?: string | string[];
    lineParams?: Partial<PD.Values<LineParams>>;
    labelParams?: Partial<PD.Values<LociLabelTextParams>>;
};
declare class StructureMeasurementManager extends StatefulPluginComponent<StructureMeasurementManagerState> {
    private plugin;
    readonly behaviors: {
        state: import("rxjs").BehaviorSubject<StructureMeasurementManagerState>;
    };
    private stateUpdated;
    private getGroup;
    setOptions(options: StructureMeasurementOptions): Promise<void>;
    addDistance(a: StructureElement.Loci, b: StructureElement.Loci, options?: StructureMeasurementManagerAddOptions & {
        visualParams?: Partial<StateTransformer.Params<typeof StateTransforms.Representation.StructureSelectionsDistance3D>>;
    }): Promise<{
        selection: import("../../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure.Selections, StateTransformer<PluginStateObject.Root, PluginStateObject.Molecule.Structure.Selections, PD.Normalize<{
            selections: PD.Normalize<{
                key: /*elided*/ any;
                ref: /*elided*/ any;
                groupId: /*elided*/ any;
                bundle: /*elided*/ any;
            }>[];
            isTransitive: boolean | undefined;
            label: string | undefined;
        }>>>;
        representation: import("../../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<PluginStateObject.Molecule.Structure.Selections, PluginStateObject.Shape.Representation3D, PD.Normalize<{
            visuals: ("text" | "lines")[];
            unitLabel: string;
            borderWidth: number;
            customText: string;
            textColor: Color;
            textSize: number;
            sizeFactor: number;
            borderColor: Color;
            offsetX: number;
            offsetY: number;
            offsetZ: number;
            background: boolean;
            backgroundMargin: number;
            backgroundColor: Color;
            backgroundOpacity: number;
            tether: boolean;
            tetherLength: number;
            tetherBaseWidth: number;
            attachment: "middle-center" | "bottom-left" | "bottom-center" | "bottom-right" | "middle-left" | "middle-right" | "top-left" | "top-center" | "top-right";
            fontFamily: import("../../../mol-geo/geometry/text/font-atlas").FontFamily;
            fontQuality: number;
            fontStyle: import("../../../mol-geo/geometry/text/font-atlas").FontStyle;
            fontVariant: import("../../../mol-geo/geometry/text/font-atlas").FontVariant;
            fontWeight: import("../../../mol-geo/geometry/text/font-atlas").FontWeight;
            alpha: number;
            quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
            material: PD.Normalize<{
                metalness: number;
                roughness: number;
                bumpiness: number;
            }>;
            clip: PD.Normalize<{
                variant: /*elided*/ any;
                objects: /*elided*/ any;
            }>;
            emissive: number;
            density: number;
            instanceGranularity: boolean;
            lod: import("../../../mol-math/linear-algebra").Vec3;
            cellSize: number;
            batchSize: number;
            lineSizeAttenuation: boolean;
            linesColor: Color;
            linesSize: number;
            dashLength: number;
        }>>>;
    } | undefined>;
    addAngle(a: StructureElement.Loci, b: StructureElement.Loci, c: StructureElement.Loci, options?: StructureMeasurementManagerAddOptions & {
        visualParams?: Partial<StateTransformer.Params<typeof StateTransforms.Representation.StructureSelectionsAngle3D>>;
    }): Promise<{
        selection: import("../../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure.Selections, StateTransformer<PluginStateObject.Root, PluginStateObject.Molecule.Structure.Selections, PD.Normalize<{
            selections: PD.Normalize<{
                key: /*elided*/ any;
                ref: /*elided*/ any;
                groupId: /*elided*/ any;
                bundle: /*elided*/ any;
            }>[];
            isTransitive: boolean | undefined;
            label: string | undefined;
        }>>>;
        representation: import("../../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<PluginStateObject.Molecule.Structure.Selections, PluginStateObject.Shape.Representation3D, PD.Normalize<{
            visuals: ("text" | "vectors" | "sector" | "arc")[];
            borderWidth: number;
            customText: string;
            textColor: Color;
            textSize: number;
            sizeFactor: number;
            borderColor: Color;
            offsetX: number;
            offsetY: number;
            offsetZ: number;
            background: boolean;
            backgroundMargin: number;
            backgroundColor: Color;
            backgroundOpacity: number;
            tether: boolean;
            tetherLength: number;
            tetherBaseWidth: number;
            attachment: "middle-center" | "bottom-left" | "bottom-center" | "bottom-right" | "middle-left" | "middle-right" | "top-left" | "top-center" | "top-right";
            fontFamily: import("../../../mol-geo/geometry/text/font-atlas").FontFamily;
            fontQuality: number;
            fontStyle: import("../../../mol-geo/geometry/text/font-atlas").FontStyle;
            fontVariant: import("../../../mol-geo/geometry/text/font-atlas").FontVariant;
            fontWeight: import("../../../mol-geo/geometry/text/font-atlas").FontWeight;
            alpha: number;
            quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
            material: PD.Normalize<{
                metalness: number;
                roughness: number;
                bumpiness: number;
            }>;
            clip: PD.Normalize<{
                variant: /*elided*/ any;
                objects: /*elided*/ any;
            }>;
            emissive: number;
            density: number;
            instanceGranularity: boolean;
            lod: import("../../../mol-math/linear-algebra").Vec3;
            cellSize: number;
            batchSize: number;
            ignoreLight: boolean;
            sectorOpacity: number;
            color: Color;
            arcScale: number;
            doubleSided: boolean;
            flipSided: boolean;
            flatShaded: boolean;
            celShaded: boolean;
            xrayShaded: boolean | "inverted";
            transparentBackfaces: "off" | "on" | "opaque";
            bumpFrequency: number;
            bumpAmplitude: number;
            lineSizeAttenuation: boolean;
            linesSize: number;
            dashLength: number;
        }>>>;
    } | undefined>;
    addDihedral(a: StructureElement.Loci, b: StructureElement.Loci, c: StructureElement.Loci, d: StructureElement.Loci, options?: StructureMeasurementManagerAddOptions & {
        visualParams?: Partial<StateTransformer.Params<typeof StateTransforms.Representation.StructureSelectionsDihedral3D>>;
    }): Promise<{
        selection: import("../../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure.Selections, StateTransformer<PluginStateObject.Root, PluginStateObject.Molecule.Structure.Selections, PD.Normalize<{
            selections: PD.Normalize<{
                key: /*elided*/ any;
                ref: /*elided*/ any;
                groupId: /*elided*/ any;
                bundle: /*elided*/ any;
            }>[];
            isTransitive: boolean | undefined;
            label: string | undefined;
        }>>>;
        representation: import("../../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<PluginStateObject.Molecule.Structure.Selections, PluginStateObject.Shape.Representation3D, PD.Normalize<{
            visuals: ("text" | "vectors" | "sector" | "arc" | "extenders" | "arms" | "connector")[];
            borderWidth: number;
            customText: string;
            textColor: Color;
            textSize: number;
            sizeFactor: number;
            borderColor: Color;
            offsetX: number;
            offsetY: number;
            offsetZ: number;
            background: boolean;
            backgroundMargin: number;
            backgroundColor: Color;
            backgroundOpacity: number;
            tether: boolean;
            tetherLength: number;
            tetherBaseWidth: number;
            attachment: "middle-center" | "bottom-left" | "bottom-center" | "bottom-right" | "middle-left" | "middle-right" | "top-left" | "top-center" | "top-right";
            fontFamily: import("../../../mol-geo/geometry/text/font-atlas").FontFamily;
            fontQuality: number;
            fontStyle: import("../../../mol-geo/geometry/text/font-atlas").FontStyle;
            fontVariant: import("../../../mol-geo/geometry/text/font-atlas").FontVariant;
            fontWeight: import("../../../mol-geo/geometry/text/font-atlas").FontWeight;
            alpha: number;
            quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
            material: PD.Normalize<{
                metalness: number;
                roughness: number;
                bumpiness: number;
            }>;
            clip: PD.Normalize<{
                variant: /*elided*/ any;
                objects: /*elided*/ any;
            }>;
            emissive: number;
            density: number;
            instanceGranularity: boolean;
            lod: import("../../../mol-math/linear-algebra").Vec3;
            cellSize: number;
            batchSize: number;
            ignoreLight: boolean;
            sectorOpacity: number;
            color: Color;
            arcScale: number;
            doubleSided: boolean;
            flipSided: boolean;
            flatShaded: boolean;
            celShaded: boolean;
            xrayShaded: boolean | "inverted";
            transparentBackfaces: "off" | "on" | "opaque";
            bumpFrequency: number;
            bumpAmplitude: number;
            lineSizeAttenuation: boolean;
            linesSize: number;
            dashLength: number;
        }>>>;
    } | undefined>;
    addLabel(a: StructureElement.Loci, options?: Omit<StructureMeasurementManagerAddOptions, 'customText' | 'lineParams'> & {
        visualParams?: Partial<StateTransformer.Params<typeof StateTransforms.Representation.StructureSelectionsLabel3D>>;
    }): Promise<{
        selection: import("../../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure.Selections, StateTransformer<PluginStateObject.Root, PluginStateObject.Molecule.Structure.Selections, PD.Normalize<{
            selections: PD.Normalize<{
                key: /*elided*/ any;
                ref: /*elided*/ any;
                groupId: /*elided*/ any;
                bundle: /*elided*/ any;
            }>[];
            isTransitive: boolean | undefined;
            label: string | undefined;
        }>>>;
        representation: import("../../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<PluginStateObject.Molecule.Structure.Selections, PluginStateObject.Shape.Representation3D, PD.Normalize<{
            scaleByRadius: boolean;
            visuals: "text"[];
            snapshotKey: string;
            tooltip: string;
            borderWidth: number;
            customText: string;
            textColor: Color;
            textSize: number;
            sizeFactor: number;
            borderColor: Color;
            offsetX: number;
            offsetY: number;
            offsetZ: number;
            background: boolean;
            backgroundMargin: number;
            backgroundColor: Color;
            backgroundOpacity: number;
            tether: boolean;
            tetherLength: number;
            tetherBaseWidth: number;
            attachment: "middle-center" | "bottom-left" | "bottom-center" | "bottom-right" | "middle-left" | "middle-right" | "top-left" | "top-center" | "top-right";
            fontFamily: import("../../../mol-geo/geometry/text/font-atlas").FontFamily;
            fontQuality: number;
            fontStyle: import("../../../mol-geo/geometry/text/font-atlas").FontStyle;
            fontVariant: import("../../../mol-geo/geometry/text/font-atlas").FontVariant;
            fontWeight: import("../../../mol-geo/geometry/text/font-atlas").FontWeight;
            alpha: number;
            quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
            material: PD.Normalize<{
                metalness: number;
                roughness: number;
                bumpiness: number;
            }>;
            clip: PD.Normalize<{
                variant: /*elided*/ any;
                objects: /*elided*/ any;
            }>;
            emissive: number;
            density: number;
            instanceGranularity: boolean;
            lod: import("../../../mol-math/linear-algebra").Vec3;
            cellSize: number;
            batchSize: number;
        }>>>;
    } | undefined>;
    addOrientation(locis: StructureElement.Loci[]): Promise<{
        selection: import("../../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure.Selections, StateTransformer<PluginStateObject.Root, PluginStateObject.Molecule.Structure.Selections, PD.Normalize<{
            selections: PD.Normalize<{
                key: /*elided*/ any;
                ref: /*elided*/ any;
                groupId: /*elided*/ any;
                bundle: /*elided*/ any;
            }>[];
            isTransitive: boolean | undefined;
            label: string | undefined;
        }>>>;
        representation: import("../../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<PluginStateObject.Molecule.Structure.Selections, PluginStateObject.Shape.Representation3D, PD.Normalize<{
            visuals: ("box" | "axes" | "ellipsoid")[];
            color: Color;
            scaleFactor: number;
            radiusScale: number;
            doubleSided: boolean;
            flipSided: boolean;
            flatShaded: boolean;
            ignoreLight: boolean;
            celShaded: boolean;
            xrayShaded: boolean | "inverted";
            transparentBackfaces: "off" | "on" | "opaque";
            bumpFrequency: number;
            bumpAmplitude: number;
            alpha: number;
            quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
            material: PD.Normalize<{
                metalness: number;
                roughness: number;
                bumpiness: number;
            }>;
            clip: PD.Normalize<{
                variant: /*elided*/ any;
                objects: /*elided*/ any;
            }>;
            emissive: number;
            density: number;
            instanceGranularity: boolean;
            lod: import("../../../mol-math/linear-algebra").Vec3;
            cellSize: number;
            batchSize: number;
        }>>>;
    } | undefined>;
    addPlane(locis: StructureElement.Loci[]): Promise<{
        selection: import("../../../mol-state").StateObjectSelector<PluginStateObject.Molecule.Structure.Selections, StateTransformer<PluginStateObject.Root, PluginStateObject.Molecule.Structure.Selections, PD.Normalize<{
            selections: PD.Normalize<{
                key: /*elided*/ any;
                ref: /*elided*/ any;
                groupId: /*elided*/ any;
                bundle: /*elided*/ any;
            }>[];
            isTransitive: boolean | undefined;
            label: string | undefined;
        }>>>;
        representation: import("../../../mol-state").StateObjectSelector<PluginStateObject.Shape.Representation3D, StateTransformer<PluginStateObject.Molecule.Structure.Selections, PluginStateObject.Shape.Representation3D, PD.Normalize<{
            visuals: "plane"[];
            color: Color;
            scaleFactor: number;
            doubleSided: boolean;
            flipSided: boolean;
            flatShaded: boolean;
            ignoreLight: boolean;
            celShaded: boolean;
            xrayShaded: boolean | "inverted";
            transparentBackfaces: "off" | "on" | "opaque";
            bumpFrequency: number;
            bumpAmplitude: number;
            alpha: number;
            quality: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
            material: PD.Normalize<{
                metalness: number;
                roughness: number;
                bumpiness: number;
            }>;
            clip: PD.Normalize<{
                variant: /*elided*/ any;
                objects: /*elided*/ any;
            }>;
            emissive: number;
            density: number;
            instanceGranularity: boolean;
            lod: import("../../../mol-math/linear-algebra").Vec3;
            cellSize: number;
            batchSize: number;
        }>>>;
    } | undefined>;
    addOrderLabels(locis: StructureElement.Loci[]): Promise<{
        representation: import("../../../mol-state").StateObjectSelector<StateObject<any, StateObject.Type<any>>, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>> | import("../../../mol-state").StateObjectSelector<StateObject<any, StateObject.Type<any>>, StateTransformer<never, PluginStateObject.Group, PD.Normalize<{
            label: string;
            description: string | undefined;
        }>>>;
    }>;
    private _empty;
    private getTransforms;
    private sync;
    constructor(plugin: PluginContext);
}
