/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { MagicWandSvg } from '../../../mol-plugin-ui/controls/icons';
import { CollapsableControls, PluginUIComponent } from '../../../mol-plugin-ui/base';
import { PluginContext } from '../../../mol-plugin/context';
import { StateAction } from '../../../mol-state';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ExampleEntry } from '../app';
export declare function loadExampleEntry(ctx: PluginContext, entry: ExampleEntry): Promise<void>;
export declare function loadUrl(ctx: PluginContext, url: string, type: 'molx' | 'molj' | 'cif' | 'bcif'): Promise<void>;
export declare function loadPdb(ctx: PluginContext, id: string): Promise<void>;
export declare function loadPdbIhm(ctx: PluginContext, id: string): Promise<void>;
export declare const LoadDatabase: StateAction<PluginStateObject.Root, void, PD.Normalize<{
    source: "pdb" | "pdbIhm";
    entry: string;
}>>;
export declare const LoadExample: StateAction<PluginStateObject.Root, void, PD.Normalize<{
    entry: number;
}>>;
export declare const LoadModel: StateAction<PluginStateObject.Root, void, PD.Normalize<{
    files: import("../../../mol-util/assets").Asset.File[] | null;
}>>;
export declare class DatabaseControls extends PluginUIComponent {
    componentDidMount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class LoaderControls extends PluginUIComponent {
    componentDidMount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class ExampleControls extends PluginUIComponent {
    componentDidMount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare function ColorLoaderControls({ plugin }: {
    plugin: PluginContext;
}): import("react/jsx-runtime").JSX.Element;
export declare function openState(ctx: PluginContext, file: File): Promise<void>;
export declare class SessionControls extends PluginUIComponent {
    downloadToFileZip: () => void;
    open: (e: React.ChangeEvent<HTMLInputElement>) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class SnapshotControls extends PluginUIComponent<{}> {
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class ExplorerInfo extends PluginUIComponent<{}, {
    isDisabled: boolean;
    showHelp: boolean;
}> {
    state: {
        isDisabled: boolean;
        showHelp: boolean;
    };
    componentDidMount(): void;
    setupDriver: () => void;
    openHelp: () => void;
    toggleHelp: () => void;
    render(): import("react/jsx-runtime").JSX.Element | undefined;
}
export declare class MesoQuickStylesControls extends CollapsableControls {
    defaultState(): {
        isCollapsed: boolean;
        header: string;
        brand: {
            accent: "gray";
            svg: typeof MagicWandSvg;
        };
    };
    renderControls(): import("react/jsx-runtime").JSX.Element;
}
export declare class MesoQuickStyles extends PluginUIComponent {
    default(): Promise<void>;
    celshading(): Promise<void>;
    shinyDof(): Promise<void>;
    illustrative(): Promise<void>;
    shiny(): Promise<void>;
    stylized(): Promise<void>;
    render(): import("react/jsx-runtime").JSX.Element;
}
