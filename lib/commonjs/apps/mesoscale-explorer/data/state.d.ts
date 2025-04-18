/**
 * Copyright (c) 2023-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginStateObject as PSO } from '../../../mol-plugin-state/objects';
import { PluginContext } from '../../../mol-plugin/context';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Color } from '../../../mol-util/color';
import { Clip } from '../../../mol-util/clip';
import { Mat4, Vec3 } from '../../../mol-math/linear-algebra';
import { ParamMapping } from '../../../mol-util/param-mapping';
import { EntityNode } from '../ui/entities';
import { DistinctColorsProps } from '../../../mol-util/color/distinct';
import { Sphere3D } from '../../../mol-math/geometry';
import { StateObjectCell, StateSelection } from '../../../mol-state';
import { SpacefillRepresentationProvider } from '../../../mol-repr/structure/representation/spacefill';
import { Material } from '../../../mol-util/material';
export declare function getDistinctGroupColors(count: number, color: Color, variability: number, shift: number, props?: Partial<DistinctColorsProps>): Color[];
export declare function getDistinctBaseColors(count: number, shift: number, props?: Partial<DistinctColorsProps>): Color[];
export declare const ColorParams: {
    type: PD.Select<string>;
    illustrative: PD.BooleanParam;
    value: PD.Color;
    variability: PD.Numeric;
    shift: PD.Numeric;
    lightness: PD.Numeric;
    alpha: PD.Numeric;
    emissive: PD.Numeric;
};
export type ColorProps = PD.Values<typeof ColorParams>;
export declare const ColorValueParam: PD.Color;
export declare const RootParams: {
    type: PD.Select<string>;
    illustrative: PD.BooleanParam;
    value: PD.Color;
    variability: PD.Numeric;
    shift: PD.Numeric;
    lightness: PD.Numeric;
    alpha: PD.Numeric;
    emissive: PD.Numeric;
};
export declare const LightnessParams: {
    lightness: PD.Numeric;
};
export declare const DimLightness = 6;
export declare const IllustrativeParams: {
    illustrative: PD.BooleanParam;
};
export declare const OpacityParams: {
    alpha: PD.Numeric;
};
export declare const EmissiveParams: {
    emissive: PD.Numeric;
};
export declare const celShaded: {
    celShaded: PD.BooleanParam;
};
export type celShadedProps = PD.Values<typeof celShaded>;
export declare const PatternParams: {
    frequency: PD.Numeric;
    amplitude: PD.Numeric;
};
export declare const StyleParams: {
    ignoreLight: PD.BooleanParam;
    materialStyle: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    celShaded: PD.BooleanParam;
};
export declare const LodParams: {
    lodLevels: PD.ObjectList<PD.Normalize<{
        minDistance: number;
        maxDistance: number;
        overlap: number;
        stride: number;
        scaleBias: number;
    }>>;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
    approximate: PD.BooleanParam;
};
export declare const SimpleClipParams: {
    type: PD.Select<"none" | "sphere" | "cube" | "plane" | "cylinder" | "infiniteCone">;
    invert: PD.BooleanParam;
    position: PD.Group<PD.Normalize<{
        x: number;
        y: number;
        z: number;
    }>>;
    rotation: PD.Group<PD.Normalize<{
        axis: Vec3;
        angle: number;
    }>>;
    scale: PD.Group<PD.Normalize<{
        x: number;
        y: number;
        z: number;
    }>>;
};
export type SimpleClipParams = typeof SimpleClipParams;
export type SimpleClipProps = PD.Values<SimpleClipParams>;
export declare function getClipObjects(values: SimpleClipProps, boundingSphere: Sphere3D): Clip.Props['objects'];
export declare function createClipMapping(node: EntityNode): ParamMapping<{
    type: "none" | "sphere" | "cube" | "plane" | "cylinder" | "infiniteCone";
    invert: boolean;
    position: PD.Normalize<{
        x: /*elided*/ any;
        y: /*elided*/ any;
        z: /*elided*/ any;
    }>;
    rotation: PD.Normalize<{
        axis: /*elided*/ any;
        angle: /*elided*/ any;
    }>;
    scale: PD.Normalize<{
        x: /*elided*/ any;
        y: /*elided*/ any;
        z: /*elided*/ any;
    }>;
}, PD.Values<{
    variant: PD.Select<Clip.Variant>;
    objects: PD.ObjectList<PD.Normalize<{
        type: "none" | "sphere" | "cube" | "plane" | "cylinder" | "infiniteCone";
        invert: boolean;
        position: Vec3;
        rotation: PD.Normalize<{
            axis: /*elided*/ any;
            angle: /*elided*/ any;
        }>;
        scale: Vec3;
        transform: Mat4;
    }>>;
}> | undefined, PluginContext>;
export declare const MesoscaleGroupParams: {
    root: PD.Value<boolean>;
    index: PD.Value<number>;
    tag: PD.Value<string>;
    label: PD.Value<string>;
    description: PD.Value<string>;
    hidden: PD.BooleanParam;
    color: PD.Group<PD.Normalize<{
        type: string;
        illustrative: boolean;
        value: Color;
        variability: number;
        shift: number;
        lightness: number;
        alpha: number;
        emissive: number;
    }>>;
    lightness: PD.Numeric;
    alpha: PD.Numeric;
    emissive: PD.Numeric;
    lod: PD.Group<PD.Normalize<{
        lodLevels: PD.Normalize<{
            minDistance: number;
            maxDistance: number;
            overlap: number;
            stride: number;
            scaleBias: number;
        }>[];
        cellSize: number;
        batchSize: number;
        approximate: boolean;
    }>>;
    clip: PD.Group<PD.Normalize<{
        type: "none" | "sphere" | "cube" | "plane" | "cylinder" | "infiniteCone";
        invert: boolean;
        position: PD.Normalize<{
            x: /*elided*/ any;
            y: /*elided*/ any;
            z: /*elided*/ any;
        }>;
        rotation: PD.Normalize<{
            axis: /*elided*/ any;
            angle: /*elided*/ any;
        }>;
        scale: PD.Normalize<{
            x: /*elided*/ any;
            y: /*elided*/ any;
            z: /*elided*/ any;
        }>;
    }>>;
};
export type MesoscaleGroupProps = PD.Values<typeof MesoscaleGroupParams>;
declare const MesoscaleGroupObject_base: {
    new (data: {}, props?: {
        label: string;
        description?: string;
    } | undefined): {
        id: import("../../../mol-util").UUID;
        type: PSO.TypeInfo;
        label: string;
        description?: string;
        data: {};
    };
    type: PSO.TypeInfo;
    is(obj?: import("../../../mol-state").StateObject): obj is import("../../../mol-state").StateObject<{}, PSO.TypeInfo>;
};
export declare class MesoscaleGroupObject extends MesoscaleGroupObject_base {
}
export declare const MesoscaleGroup: import("../../../mol-state").StateTransformer<PSO.Root, MesoscaleGroupObject, PD.Normalize<{
    root: boolean;
    index: number;
    tag: string;
    label: string;
    description: string;
    hidden: boolean;
    color: PD.Normalize<{
        type: /*elided*/ any;
        illustrative: /*elided*/ any;
        value: /*elided*/ any;
        variability: /*elided*/ any;
        shift: /*elided*/ any;
        lightness: /*elided*/ any;
        alpha: /*elided*/ any;
        emissive: /*elided*/ any;
    }>;
    lightness: number;
    alpha: number;
    emissive: number;
    lod: PD.Normalize<{
        lodLevels: /*elided*/ any;
        cellSize: /*elided*/ any;
        batchSize: /*elided*/ any;
        approximate: /*elided*/ any;
    }>;
    clip: PD.Normalize<{
        type: /*elided*/ any;
        invert: /*elided*/ any;
        position: /*elided*/ any;
        rotation: /*elided*/ any;
        scale: /*elided*/ any;
    }>;
}>>;
export declare function getMesoscaleGroupParams(graphicsMode: GraphicsMode): MesoscaleGroupProps;
export type LodLevels = typeof SpacefillRepresentationProvider.defaultValues['lodLevels'];
export declare function getLodLevels(graphicsMode: Exclude<GraphicsMode, 'custom'>): LodLevels;
export type GraphicsMode = 'ultra' | 'quality' | 'balanced' | 'performance' | 'custom';
export declare function getGraphicsModeProps(graphicsMode: Exclude<GraphicsMode, 'custom'>): {
    lodLevels: PD.Normalize<{
        minDistance: number;
        maxDistance: number;
        overlap: number;
        stride: number;
        scaleBias: number;
    }>[];
    approximate: boolean;
    alphaThickness: number;
};
export declare function setGraphicsCanvas3DProps(ctx: PluginContext, graphics: GraphicsMode): void;
export declare const MesoscaleStateParams: {
    filter: PD.Value<string>;
    graphics: PD.Select<GraphicsMode>;
    description: PD.Value<string>;
    focusInfo: PD.Value<string>;
    link: PD.Value<string>;
    textSizeDescription: PD.Numeric;
    index: PD.Value<number>;
};
declare const MesoscaleStateObject_base: {
    new (data: PD.Values<{
        filter: PD.Value<string>;
        graphics: PD.Select<GraphicsMode>;
        description: PD.Value<string>;
        focusInfo: PD.Value<string>;
        link: PD.Value<string>;
        textSizeDescription: PD.Numeric;
        index: PD.Value<number>;
    }>, props?: {
        label: string;
        description?: string;
    } | undefined): {
        id: import("../../../mol-util").UUID;
        type: PSO.TypeInfo;
        label: string;
        description?: string;
        data: PD.Values<{
            filter: PD.Value<string>;
            graphics: PD.Select<GraphicsMode>;
            description: PD.Value<string>;
            focusInfo: PD.Value<string>;
            link: PD.Value<string>;
            textSizeDescription: PD.Numeric;
            index: PD.Value<number>;
        }>;
    };
    type: PSO.TypeInfo;
    is(obj?: import("../../../mol-state").StateObject): obj is import("../../../mol-state").StateObject<PD.Values<{
        filter: PD.Value<string>;
        graphics: PD.Select<GraphicsMode>;
        description: PD.Value<string>;
        focusInfo: PD.Value<string>;
        link: PD.Value<string>;
        textSizeDescription: PD.Numeric;
        index: PD.Value<number>;
    }>, PSO.TypeInfo>;
};
export declare class MesoscaleStateObject extends MesoscaleStateObject_base {
}
export { MesoscaleState };
type MesoscaleState = PD.Values<typeof MesoscaleStateParams>;
declare const MesoscaleState: {
    init(ctx: PluginContext): Promise<void>;
    get(ctx: PluginContext): MesoscaleState;
    set(ctx: PluginContext, props: Partial<MesoscaleState>): Promise<void>;
    ref(ctx: PluginContext): string;
    has(ctx: PluginContext): boolean;
};
export declare function getRoots(plugin: PluginContext): StateSelection.CellSeq<StateObjectCell<MesoscaleGroupObject>>;
export declare function getGroups(plugin: PluginContext, tag?: string): StateSelection.CellSeq<StateObjectCell<MesoscaleGroupObject>>;
export declare function getAllGroups(plugin: PluginContext, tag?: string): StateObjectCell<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateTransform<import("../../../mol-state").StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>>>[];
export declare function getAllLeafGroups(plugin: PluginContext, tag: string): StateObjectCell<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateTransform<import("../../../mol-state").StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>>>[];
type EntityCells = StateSelection.CellSeq<StateObjectCell<PSO.Molecule.Structure.Representation3D | PSO.Shape.Representation3D>>;
export declare function getEntities(plugin: PluginContext, tag?: string): EntityCells;
export declare function getFilteredEntities(plugin: PluginContext, tag: string, filter: string): EntityCells;
export declare function getAllEntities(plugin: PluginContext, tag?: string): EntityCells;
export declare function getAllFilteredEntities(plugin: PluginContext, tag: string, filter: string): EntityCells;
export declare function getEveryEntity(plugin: PluginContext, filter?: string, tag?: string): EntityCells;
export declare function getEntityLabel(plugin: PluginContext, cell: StateObjectCell): string;
export declare function getCellDescription(cell: StateObjectCell): string;
export declare function getEntityDescription(plugin: PluginContext, cell: StateObjectCell): string;
export declare function updateStyle(plugin: PluginContext, options: {
    ignoreLight: boolean;
    material: Material;
    celShaded: boolean;
    illustrative: boolean;
}): Promise<void>;
export declare function updateColors(plugin: PluginContext, values: PD.Values, tag: string, filter: string): Promise<void>;
export declare function expandAllGroups(plugin: PluginContext): void;
