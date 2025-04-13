/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Jason Pattle <jpattle.exscientia.co.uk>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 * @author Ventura Rivera <venturaxrivera@gmail.com>
 */
import * as React from 'react';
import { Structure } from '../../mol-model/structure/structure/structure';
import { StructureSelectionQuery } from '../../mol-plugin-state/helpers/structure-selection-query';
import { StructureSelectionModifier } from '../../mol-plugin-state/manager/structure/selection';
import { ParamDefinition } from '../../mol-util/param-definition';
import { PluginUIComponent, PurePluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { ParamOnChange } from '../controls/parameters';
export declare class ToggleSelectionModeButton extends PurePluginUIComponent<{
    inline?: boolean;
}> {
    componentDidMount(): void;
    _toggleSelMode: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare const StructureSelectionParams: {
    granularity: ParamDefinition.Select<"element" | "operator" | "residue" | "entity" | "chain" | "model" | "structure" | "elementInstances" | "residueInstances" | "chainInstances">;
};
type SelectionHelperType = 'residue-list';
interface StructureSelectionActionsControlsState {
    isEmpty: boolean;
    isBusy: boolean;
    canUndo: boolean;
    action?: StructureSelectionModifier | 'theme' | 'add-component' | 'help';
    helper?: SelectionHelperType;
    structureSelectionParams?: typeof StructureSelectionParams;
}
export declare class StructureSelectionActionsControls extends PluginUIComponent<{}, StructureSelectionActionsControlsState> {
    state: {
        action: StructureSelectionActionsControlsState["action"];
        helper: StructureSelectionActionsControlsState["helper"];
        isEmpty: boolean;
        isBusy: boolean;
        canUndo: boolean;
        structureSelectionParams: {
            granularity: ParamDefinition.Select<"element" | "operator" | "residue" | "entity" | "chain" | "model" | "structure" | "elementInstances" | "residueInstances" | "chainInstances">;
        };
    };
    componentDidMount(): void;
    get isDisabled(): boolean;
    set: (modifier: StructureSelectionModifier, selectionQuery: StructureSelectionQuery) => void;
    selectQuery: ActionMenu.OnSelect;
    selectHelper: ActionMenu.OnSelect;
    get structures(): Structure[];
    private queriesItems;
    private queriesVersion;
    get queries(): ActionMenu.Items[];
    private helpersItems?;
    get helpers(): ActionMenu.Items[];
    private showAction;
    toggleAdd: () => void;
    toggleRemove: () => void;
    toggleIntersect: () => void;
    toggleSet: () => void;
    toggleTheme: () => void;
    toggleAddComponent: () => void;
    toggleHelp: () => void;
    setGranuality: ParamOnChange;
    turnOff: () => boolean;
    undo: () => void;
    subtract: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class StructureSelectionStatsControls extends PluginUIComponent<{
    hideOnEmpty?: boolean;
}, {
    isEmpty: boolean;
    isBusy: boolean;
}> {
    state: {
        isEmpty: boolean;
        isBusy: boolean;
    };
    componentDidMount(): void;
    get isDisabled(): boolean;
    get stats(): string;
    clear: () => void;
    focus: () => void;
    highlight: (e: React.MouseEvent<HTMLElement>) => void;
    clearHighlight: () => void;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export {};
