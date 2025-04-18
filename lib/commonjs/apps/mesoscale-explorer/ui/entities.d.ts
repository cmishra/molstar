/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginUIComponent } from '../../../mol-plugin-ui/base';
import { State, StateObjectCell, StateSelection, StateTransformer } from '../../../mol-state';
import { ParamOnChange } from '../../../mol-plugin-ui/controls/parameters';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Clip } from '../../../mol-util/clip';
import { Color } from '../../../mol-util/color';
import { ColorProps, LodParams, MesoscaleGroupProps, GraphicsMode } from '../data/state';
import React from 'react';
import { PluginStateObject as PSO } from '../../../mol-plugin-state/objects';
import { PluginContext } from '../../../mol-plugin/context';
export declare class ModelInfo extends PluginUIComponent<{}, {
    isDisabled: boolean;
}> {
    state: {
        isDisabled: boolean;
    };
    componentDidMount(): void;
    get info(): {
        selectionDescription: string;
        description: string;
        link: string;
    } | undefined;
    render(): import("react/jsx-runtime").JSX.Element | undefined;
}
declare const SelectionStyleParam: PD.Select<"color" | "outline" | "color+outline">;
type SelectionStyle = typeof SelectionStyleParam['defaultValue'];
export declare class SelectionInfo extends PluginUIComponent<{}, {
    isDisabled: boolean;
}> {
    state: {
        isDisabled: boolean;
    };
    componentDidMount(): void;
    get info(): {
        label: string;
        key: string;
        description?: string;
    }[];
    find(label: string): void;
    remove(key: string): void;
    center(key: string): void;
    get selection(): import("react/jsx-runtime").JSX.Element;
    get style(): "color" | "color+outline" | "outline" | undefined;
    setStyle(value: SelectionStyle): void;
    renderStyle(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare function MesoMarkdownAnchor({ href, children, element }: {
    href?: string;
    children?: any;
    element?: any;
}): any;
export declare function MesoViewportSnapshotDescription(): import("react/jsx-runtime").JSX.Element | null;
export declare class FocusInfo extends PluginUIComponent<{}, {
    isDisabled: boolean;
}> {
    componentDidMount(): void;
    get info(): string;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class EntityControls extends PluginUIComponent<{}, {
    isDisabled: boolean;
}> {
    filterRef: React.RefObject<HTMLInputElement>;
    prevFilter: string;
    filterFocus: boolean;
    state: {
        isDisabled: boolean;
    };
    componentDidMount(): void;
    componentDidUpdate(): void;
    get roots(): StateSelection.CellSeq<StateObjectCell<import("../data/state").MesoscaleGroupObject, import("../../../mol-state").StateTransform<StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>>>>;
    setGroupBy: (value: number) => void;
    get groupBy(): number;
    setFilter: (value: string) => void;
    get filter(): string;
    setGraphics: (graphics: GraphicsMode) => void;
    get graphics(): GraphicsMode;
    renderGraphics(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare class Node<P extends {}, S extends {
    isDisabled: boolean;
}> extends PluginUIComponent<P & {
    cell: StateObjectCell;
    depth: number;
}, S> {
    is(e: State.ObjectEvent): boolean;
    get ref(): string;
    get cell(): (P & {
        cell: StateObjectCell;
        depth: number;
    } & {
        children?: any;
    })["cell"];
    get roots(): StateSelection.CellSeq<StateObjectCell<import("../data/state").MesoscaleGroupObject, import("../../../mol-state").StateTransform<StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>>>>;
    componentDidMount(): void;
}
export declare class GroupNode extends Node<{
    filter: string;
}, {
    isCollapsed: boolean;
    action?: 'color' | 'clip' | 'root';
    isDisabled: boolean;
}> {
    state: {
        isCollapsed: boolean;
        action: undefined;
        isDisabled: boolean;
    };
    toggleExpanded: (e: React.MouseEvent<HTMLElement>) => void;
    toggleColor: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    toggleClip: () => void;
    toggleRoot: () => void;
    showInfo: (e: React.MouseEvent<HTMLElement>) => void;
    highlight: (e: React.MouseEvent<HTMLElement>) => void;
    clearHighlight: (e: React.MouseEvent<HTMLElement>) => void;
    get groups(): StateSelection.CellSeq<StateObjectCell<import("../data/state").MesoscaleGroupObject, import("../../../mol-state").StateTransform<StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>>>>;
    get allGroups(): StateObjectCell<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateTransform<StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>>>[];
    get entities(): StateObjectCell<PSO.Molecule.Structure.Representation3D | PSO.Shape.Representation3D, import("../../../mol-state").StateTransform<StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>>>[];
    get filteredEntities(): StateObjectCell<PSO.Molecule.Structure.Representation3D | PSO.Shape.Representation3D, import("../../../mol-state").StateTransform<StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>>>[];
    get allEntities(): StateObjectCell<PSO.Molecule.Structure.Representation3D | PSO.Shape.Representation3D, import("../../../mol-state").StateTransform<StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>>>[];
    get allFilteredEntities(): StateObjectCell<PSO.Molecule.Structure.Representation3D | PSO.Shape.Representation3D, import("../../../mol-state").StateTransform<StateTransformer<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, any>>>[];
    toggleVisible: (e: React.MouseEvent<HTMLElement>) => void;
    updateColor: (values: ColorProps) => void;
    updateRoot: (values: PD.Values) => Promise<void>;
    updateClip: (values: PD.Values) => void;
    updateLod: (values: PD.Values) => void;
    update: (props: MesoscaleGroupProps) => void;
    renderColor(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element | undefined;
}
export declare class EntityNode extends Node<{}, {
    action?: 'color' | 'clip';
    isDisabled: boolean;
}> {
    state: {
        action: undefined;
        isDisabled: boolean;
    };
    clipMapping: import("../../../mol-util/param-mapping").ParamMapping<{
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
            position: import("../../../mol-math/linear-algebra").Vec3;
            rotation: PD.Normalize<{
                axis: /*elided*/ any;
                angle: /*elided*/ any;
            }>;
            scale: import("../../../mol-math/linear-algebra").Vec3;
            transform: import("../../../mol-math/linear-algebra").Mat4;
        }>>;
    }> | undefined, PluginContext>;
    get groups(): StateSelection.CellSeq<StateObjectCell<import("../../../mol-state").StateObject<any, import("../../../mol-state").StateObject.Type<any>>, import("../../../mol-state").StateTransform<StateTransformer<PSO.Root, import("../data/state").MesoscaleGroupObject, PD.Normalize<{
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
    }>>>>>;
    toggleVisible: (e: React.MouseEvent<HTMLElement>) => void;
    toggleColor: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    toggleClip: () => void;
    highlight: (e: React.MouseEvent<HTMLElement>) => void;
    clearHighlight: (e: React.MouseEvent<HTMLElement>) => void;
    toggleSelect: (e: React.MouseEvent<HTMLElement>) => void;
    center: (e: React.MouseEvent<HTMLElement>) => void;
    handleClick: (e: React.MouseEvent<HTMLElement>) => void;
    get colorValue(): Color | undefined;
    get illustrativeValue(): {
        illustrative: boolean;
    } | undefined;
    get lightnessValue(): {
        lightness: number;
    } | undefined;
    get opacityValue(): {
        alpha: number;
    } | undefined;
    get emissiveValue(): {
        emissive: number;
    } | undefined;
    get clipValue(): Clip.Props | undefined;
    get lodValue(): PD.Values<typeof LodParams> | undefined;
    get patternValue(): {
        amplitude: number;
        frequency: number;
    } | undefined;
    updateColor: ParamOnChange;
    updateIllustrative: (values: PD.Values) => Promise<void>;
    updateLightness: (values: PD.Values) => Promise<void>;
    updateOpacity: (values: PD.Values) => Promise<void>;
    updateEmissive: (values: PD.Values) => Promise<void>;
    updateClip: (props: Clip.Props) => void;
    updateLod: (values: PD.Values) => void;
    updatePattern: (values: PD.Values) => Promise<void>;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};
