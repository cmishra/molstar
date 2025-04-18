/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { DataFormatProvider } from '../../mol-plugin-state/formats/provider';
import { PluginUIContext } from '../../mol-plugin-ui/context';
import { PluginLayoutControlsDisplay } from '../../mol-plugin/layout';
import '../../mol-util/polyfill';
import { SaccharideCompIdMapType } from '../../mol-model/structure/structure/carbohydrates/constants';
import { GraphicsMode } from './data/state';
import { Transparency } from '../../mol-gl/webgl/render-item';
export { PLUGIN_VERSION as version } from '../../mol-plugin/version';
export { setDebugMode, setProductionMode, setTimingMode, consoleStats } from '../../mol-util/debug';
export type ExampleEntry = {
    id: string;
    label: string;
    url: string;
    type: 'molx' | 'molj' | 'cif' | 'bcif';
    description?: string;
    link?: string;
};
export type MesoscaleExplorerState = {
    examples?: ExampleEntry[];
    graphicsMode: GraphicsMode;
    illumination: boolean;
    stateRef?: string;
    driver?: any;
    stateCache: {
        [k: string]: any;
    };
};
declare const DefaultMesoscaleExplorerOptions: {
    customFormats: [string, DataFormatProvider][];
    extensions: ("mp4-export" | "backgrounds")[];
    layoutIsExpanded: boolean;
    layoutShowControls: boolean;
    layoutShowRemoteState: boolean;
    layoutControlsDisplay: PluginLayoutControlsDisplay;
    layoutShowSequence: boolean;
    layoutShowLog: boolean;
    layoutShowLeftPanel: boolean;
    collapseLeftPanel: boolean;
    collapseRightPanel: boolean;
    disableAntialiasing: boolean | undefined;
    pixelScale: number | undefined;
    pickScale: number | undefined;
    transparency: Transparency;
    preferWebgl1: boolean | undefined;
    allowMajorPerformanceCaveat: boolean | undefined;
    powerPreference: WebGLPowerPreference | undefined;
    resolutionMode: "auto" | "scaled" | "native" | undefined;
    illumination: boolean;
    viewportShowExpand: boolean | undefined;
    viewportShowControls: boolean | undefined;
    viewportShowSettings: boolean | undefined;
    viewportShowSelectionMode: boolean;
    viewportShowAnimation: boolean;
    viewportShowTrajectoryControls: boolean;
    pluginStateServer: string | undefined;
    volumeStreamingServer: string | undefined;
    volumeStreamingDisabled: boolean;
    pdbProvider: "rcsb" | "pdbe" | "pdbj" | undefined;
    emdbProvider: import("../../mol-plugin-state/actions/volume").EmdbDownloadProvider | undefined;
    saccharideCompIdMapType: SaccharideCompIdMapType;
    graphicsMode: GraphicsMode;
    driver: undefined;
};
type MesoscaleExplorerOptions = typeof DefaultMesoscaleExplorerOptions;
export declare class MesoscaleExplorer {
    plugin: PluginUIContext;
    constructor(plugin: PluginUIContext);
    loadExample(id: string): Promise<void>;
    loadUrl(url: string, type: 'molx' | 'molj' | 'cif' | 'bcif'): Promise<void>;
    loadPdb(id: string): Promise<void>;
    /**
     * @deprecated Scheduled for removal in v5. Use {@link loadPdbIhm | loadPdbIhm(id: string)} instead.
     */
    loadPdbDev(id: string): Promise<void>;
    loadPdbIhm(id: string): Promise<void>;
    static create(elementOrId: string | HTMLElement, options?: Partial<MesoscaleExplorerOptions>): Promise<MesoscaleExplorer>;
    handleResize(): void;
    dispose(): void;
}
