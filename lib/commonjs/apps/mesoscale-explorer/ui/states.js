"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MesoQuickStyles = exports.MesoQuickStylesControls = exports.ExplorerInfo = exports.SnapshotControls = exports.SessionControls = exports.ExampleControls = exports.LoaderControls = exports.DatabaseControls = exports.LoadModel = exports.LoadExample = exports.LoadDatabase = void 0;
exports.loadExampleEntry = loadExampleEntry;
exports.loadUrl = loadUrl;
exports.loadPdb = loadPdb;
exports.loadPdbIhm = loadPdbIhm;
exports.ColorLoaderControls = ColorLoaderControls;
exports.openState = openState;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const mmcif_1 = require("../../../mol-model-formats/structure/mmcif");
const trajectory_1 = require("../../../mol-plugin-state/formats/trajectory");
const objects_1 = require("../../../mol-plugin-state/objects");
const common_1 = require("../../../mol-plugin-ui/controls/common");
const icons_1 = require("../../../mol-plugin-ui/controls/icons");
const base_1 = require("../../../mol-plugin-ui/base");
const apply_action_1 = require("../../../mol-plugin-ui/state/apply-action");
const snapshots_1 = require("../../../mol-plugin-ui/state/snapshots");
const commands_1 = require("../../../mol-plugin/commands");
const mol_state_1 = require("../../../mol-state");
const mol_task_1 = require("../../../mol-task");
const color_1 = require("../../../mol-util/color/color");
const file_info_1 = require("../../../mol-util/file-info");
const param_definition_1 = require("../../../mol-util/param-definition");
const preset_1 = require("../data/cellpack/preset");
const preset_2 = require("../data/generic/preset");
const preset_3 = require("../data/mmcif/preset");
const preset_4 = require("../data/petworld/preset");
const state_1 = require("../data/state");
const debug_1 = require("../../../mol-util/debug");
const now_1 = require("../../../mol-util/now");
const data_source_1 = require("../../../mol-util/data-source");
function adjustPluginProps(ctx) {
    var _a;
    const customState = ctx.customState;
    ctx.managers.interactivity.setProps({ granularity: 'chain' });
    (_a = ctx.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps({
        multiSample: { mode: 'off' },
        cameraClipping: { far: false, minNear: 50 },
        sceneRadiusFactor: 2,
        renderer: {
            colorMarker: true,
            highlightColor: (0, color_1.Color)(0xffffff),
            highlightStrength: 0,
            selectColor: (0, color_1.Color)(0xffffff),
            selectStrength: 0,
            dimColor: (0, color_1.Color)(0xffffff),
            dimStrength: 1,
            markerPriority: 2,
            interiorColorFlag: false,
            interiorDarkening: 0.15,
            exposure: 1.1,
            xrayEdgeFalloff: 3,
        },
        marking: {
            enabled: true,
            highlightEdgeColor: (0, color_1.Color)(0x999999),
            selectEdgeColor: (0, color_1.Color)(0xffff00),
            highlightEdgeStrength: 1,
            selectEdgeStrength: 1,
            ghostEdgeStrength: 1,
            innerEdgeFactor: 2.5,
            edgeScale: 2,
        },
        postprocessing: {
            occlusion: {
                name: 'on',
                params: {
                    samples: 32,
                    multiScale: {
                        name: 'on',
                        params: {
                            levels: [
                                { radius: 2, bias: 1.0 },
                                { radius: 5, bias: 1.0 },
                                { radius: 8, bias: 1.0 },
                                { radius: 11, bias: 1.0 },
                            ],
                            nearThreshold: 10,
                            farThreshold: 1500,
                        }
                    },
                    radius: 5,
                    bias: 1,
                    blurKernelSize: 11,
                    blurDepthBias: 0.5,
                    resolutionScale: 1,
                    color: (0, color_1.Color)(0x000000),
                    transparentThreshold: 0.4,
                }
            },
            shadow: {
                name: 'on',
                params: {
                    maxDistance: 80,
                    steps: 3,
                    tolerance: 1.0,
                }
            },
            outline: {
                name: 'on',
                params: {
                    scale: 1,
                    threshold: 0.15,
                    color: (0, color_1.Color)(0x000000),
                    includeTransparent: false,
                }
            },
        },
        illumination: {
            enabled: customState.illumination,
            firstStepSize: 0.1,
            rayDistance: 1024,
        },
    });
    const { graphics } = state_1.MesoscaleState.get(ctx);
    (0, state_1.setGraphicsCanvas3DProps)(ctx, graphics);
}
async function createHierarchy(ctx, ref) {
    var _a, _b;
    const parsed = await trajectory_1.MmcifProvider.parse(ctx, ref);
    const tr = (_b = (_a = mol_state_1.StateObjectRef.resolveAndCheck(ctx.state.data, parsed.trajectory)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
    if (!tr)
        throw new Error('no trajectory');
    if (!mmcif_1.MmcifFormat.is(tr.representative.sourceData)) {
        throw new Error('not mmcif');
    }
    const { frame, db } = tr.representative.sourceData.data;
    let hasCellpackAssemblyMethodDetails = false;
    const { method_details } = db.pdbx_struct_assembly;
    for (let i = 0, il = method_details.rowCount; i < il; ++i) {
        if (method_details.value(i).toUpperCase() === 'CELLPACK') {
            hasCellpackAssemblyMethodDetails = true;
            break;
        }
    }
    if (frame.categories.pdbx_model) {
        await (0, preset_4.createPetworldHierarchy)(ctx, parsed.trajectory);
    }
    else if (frame.header.toUpperCase().includes('CELLPACK') ||
        hasCellpackAssemblyMethodDetails) {
        await (0, preset_1.createCellpackHierarchy)(ctx, parsed.trajectory);
    }
    else {
        await (0, preset_3.createMmcifHierarchy)(ctx, parsed.trajectory);
    }
}
async function reset(ctx) {
    const customState = ctx.customState;
    delete customState.stateRef;
    customState.stateCache = {};
    ctx.managers.asset.clear();
    await commands_1.PluginCommands.State.Snapshots.Clear(ctx);
    await commands_1.PluginCommands.State.RemoveObject(ctx, { state: ctx.state.data, ref: mol_state_1.StateTransform.RootRef });
    await state_1.MesoscaleState.init(ctx);
    adjustPluginProps(ctx);
}
async function loadExampleEntry(ctx, entry) {
    const { url, type } = entry;
    await loadUrl(ctx, url, type);
    state_1.MesoscaleState.set(ctx, {
        description: entry.description || entry.label,
        link: entry.link,
    });
}
async function loadUrl(ctx, url, type) {
    var _a;
    let startTime = 0;
    if (debug_1.isTimingMode) {
        startTime = (0, now_1.now)();
    }
    if (type === 'molx' || type === 'molj') {
        const customState = ctx.customState;
        delete customState.stateRef;
        customState.stateCache = {};
        ctx.managers.asset.clear();
        await commands_1.PluginCommands.State.Snapshots.Clear(ctx);
        await commands_1.PluginCommands.State.Snapshots.OpenUrl(ctx, { url, type });
        const cell = ctx.state.data.selectQ(q => q.ofType(state_1.MesoscaleStateObject))[0];
        if (!cell)
            throw new Error('Missing MesoscaleState');
        customState.stateRef = cell.transform.ref;
        customState.graphicsMode = ((_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data.graphics) || customState.graphicsMode;
    }
    else {
        await reset(ctx);
        const isBinary = type === 'bcif';
        const data = await ctx.builders.data.download({ url, isBinary });
        await createHierarchy(ctx, data.ref);
    }
    if (debug_1.isTimingMode) {
        const endTime = (0, now_1.now)();
        // Calculate the elapsed time
        const timeTaken = endTime - startTime;
        console.log(`Model loaded in ${timeTaken} milliseconds`);
    }
}
async function loadPdb(ctx, id) {
    await reset(ctx);
    const url = `https://models.rcsb.org/${id.toUpperCase()}.bcif`;
    const data = await ctx.builders.data.download({ url, isBinary: true });
    await createHierarchy(ctx, data.ref);
}
async function loadPdbIhm(ctx, id) {
    await reset(ctx);
    let url;
    // 4 character PDB id, TODO: support extended PDB ID
    if (id.match(/^[1-9][A-Z0-9]{3}$/i) !== null) {
        url = `https://pdb-ihm.org/bcif/${id.toLowerCase()}.bcif`;
    }
    else {
        const nId = id.toUpperCase().startsWith('PDBDEV_') ? id : `PDBDEV_${id.padStart(8, '0')}`;
        url = `https://pdb-ihm.org/bcif/${nId.toUpperCase()}.bcif`;
    }
    const data = await ctx.builders.data.download({ url, isBinary: true });
    await createHierarchy(ctx, data.ref);
}
async function loadColors(ctx, file) {
    var _a;
    const data = await ctx.runTask((0, data_source_1.readFromFile)(file, 'string'));
    const colorData = JSON.parse(data);
    const update = ctx.state.data.build();
    const allEntities = (0, state_1.getAllEntities)(ctx);
    for (const entityCell of allEntities) {
        const label = (0, state_1.getEntityLabel)(ctx, entityCell);
        const tags = entityCell.transform.tags;
        const fullname = ((_a = tags === null || tags === void 0 ? void 0 : tags[0].replace('comp:', '')) !== null && _a !== void 0 ? _a : '') + '.' + label;
        // test each tag, siwtch to uniform color
        if (fullname in colorData) {
            const { x, y, z } = colorData[fullname];
            const color = color_1.Color.fromRgb(x, y, z);
            update.to(entityCell).update(old => {
                if (old.type) {
                    old.colorTheme = { name: 'uniform', params: { value: color, lightness: old.colorTheme.params.lightness } };
                    old.type.params.color = color;
                }
                else if (old.coloring) {
                    old.coloring.params.color = color;
                }
            });
        }
    }
    await update.commit();
}
//
exports.LoadDatabase = mol_state_1.StateAction.build({
    display: { name: 'Database', description: 'Load from Database' },
    params: (a, ctx) => {
        return {
            source: param_definition_1.ParamDefinition.Select('pdb', param_definition_1.ParamDefinition.objectToOptions({ pdb: 'PDB', pdbIhm: 'PDB-IHM' })),
            entry: param_definition_1.ParamDefinition.Text(''),
        };
    },
    from: objects_1.PluginStateObject.Root
})(({ params }, ctx) => mol_task_1.Task.create('Loading from database...', async (taskCtx) => {
    if (params.source === 'pdb') {
        await loadPdb(ctx, params.entry);
    }
    else if (params.source === 'pdbIhm') {
        await loadPdbIhm(ctx, params.entry);
    }
}));
exports.LoadExample = mol_state_1.StateAction.build({
    display: { name: 'Load', description: 'Load an example' },
    params: (a, ctx) => {
        const entries = ctx.customState.examples || [];
        return {
            entry: param_definition_1.ParamDefinition.Select(0, entries.map((s, i) => [i, s.label])),
        };
    },
    from: objects_1.PluginStateObject.Root
})(({ params }, ctx) => mol_task_1.Task.create('Loading example...', async (taskCtx) => {
    const entries = ctx.customState.examples || [];
    await loadExampleEntry(ctx, entries[params.entry]);
}));
exports.LoadModel = mol_state_1.StateAction.build({
    display: { name: 'Load', description: 'Load a model' },
    params: {
        files: param_definition_1.ParamDefinition.FileList({ accept: '.cif,.bcif,.cif.gz,.bcif.gz,.zip', multiple: true, description: 'mmCIF or Cellpack- or Petworld-style cif file.', label: 'File(s)' }),
    },
    from: objects_1.PluginStateObject.Root
})(({ params }, ctx) => mol_task_1.Task.create('Loading model...', async (taskCtx) => {
    if (params.files === null || params.files.length === 0) {
        ctx.log.error('No file(s) selected');
        return;
    }
    await reset(ctx);
    const firstFile = params.files[0];
    const firstInfo = (0, file_info_1.getFileNameInfo)(firstFile.file.name);
    if (firstInfo.name.endsWith('zip')) {
        try {
            await (0, preset_2.createGenericHierarchy)(ctx, firstFile);
        }
        catch (e) {
            console.error(e);
            ctx.log.error(`Error opening file '${firstFile.name}'`);
        }
    }
    else {
        for (const file of params.files) {
            try {
                const info = (0, file_info_1.getFileNameInfo)(file.file.name);
                if (!['cif', 'bcif'].includes(info.ext))
                    continue;
                const isBinary = ctx.dataFormats.binaryExtensions.has(info.ext);
                const { data } = await ctx.builders.data.readFile({ file, isBinary });
                await createHierarchy(ctx, data.ref);
            }
            catch (e) {
                console.error(e);
                ctx.log.error(`Error opening file '${file.name}'`);
            }
        }
    }
}));
class DatabaseControls extends base_1.PluginUIComponent {
    componentDidMount() {
    }
    render() {
        return (0, jsx_runtime_1.jsx)("div", { id: 'database', style: { margin: '5px' }, children: (0, jsx_runtime_1.jsx)(apply_action_1.ApplyActionControl, { state: this.plugin.state.data, action: exports.LoadDatabase, nodeRef: this.plugin.state.data.tree.root.ref, applyLabel: 'Load', hideHeader: true }) });
    }
}
exports.DatabaseControls = DatabaseControls;
class LoaderControls extends base_1.PluginUIComponent {
    componentDidMount() {
    }
    render() {
        return (0, jsx_runtime_1.jsx)("div", { id: 'loader', style: { margin: '5px' }, children: (0, jsx_runtime_1.jsx)(apply_action_1.ApplyActionControl, { state: this.plugin.state.data, action: exports.LoadModel, nodeRef: this.plugin.state.data.tree.root.ref, applyLabel: 'Load', hideHeader: true }) });
    }
}
exports.LoaderControls = LoaderControls;
class ExampleControls extends base_1.PluginUIComponent {
    componentDidMount() {
    }
    render() {
        return (0, jsx_runtime_1.jsx)("div", { id: 'example', style: { margin: '5px' }, children: (0, jsx_runtime_1.jsx)(apply_action_1.ApplyActionControl, { state: this.plugin.state.data, action: exports.LoadExample, nodeRef: this.plugin.state.data.tree.root.ref, applyLabel: 'Load', hideHeader: true }) });
    }
}
exports.ExampleControls = ExampleControls;
function ColorLoaderControls({ plugin }) {
    const triggerLoadColors = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const input = e.target;
            if (!input.files || !input.files[0])
                return;
            const file = input.files[0];
            await loadColors(plugin, new File([file], file.name));
        };
        input.click();
    };
    return ((0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.OpenInBrowserSvg, title: "Load Colors", onClick: triggerLoadColors, small: true }));
}
async function openState(ctx, file) {
    var _a;
    const customState = ctx.customState;
    delete customState.stateRef;
    customState.stateCache = {};
    ctx.managers.asset.clear();
    await commands_1.PluginCommands.State.Snapshots.Clear(ctx);
    await commands_1.PluginCommands.State.Snapshots.OpenFile(ctx, { file });
    const cell = ctx.state.data.selectQ(q => q.ofType(state_1.MesoscaleStateObject))[0];
    if (!cell)
        throw new Error('Missing MesoscaleState');
    customState.stateRef = cell.transform.ref;
    customState.graphicsMode = ((_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data.graphics) || customState.graphicsMode;
}
class SessionControls extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.downloadToFileZip = () => {
            commands_1.PluginCommands.State.Snapshots.DownloadToFile(this.plugin, { type: 'zip' });
        };
        this.open = (e) => {
            if (!e.target.files || !e.target.files[0]) {
                this.plugin.log.error('No state file selected');
                return;
            }
            openState(this.plugin, e.target.files[0]);
        };
    }
    render() {
        return (0, jsx_runtime_1.jsx)("div", { id: 'session', style: { margin: '5px' }, children: (0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.GetAppSvg, onClick: this.downloadToFileZip, title: 'Download the state.', children: "Download" }), (0, jsx_runtime_1.jsxs)("div", { className: 'msp-btn msp-btn-block msp-btn-action msp-loader-msp-btn-file', children: [(0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.OpenInBrowserSvg, inline: true }), " Open ", (0, jsx_runtime_1.jsx)("input", { onChange: this.open, type: 'file', multiple: false, accept: '.molx,.molj' })] })] }) });
    }
}
exports.SessionControls = SessionControls;
class SnapshotControls extends base_1.PluginUIComponent {
    render() {
        return (0, jsx_runtime_1.jsxs)("div", { style: { margin: '5px' }, children: [(0, jsx_runtime_1.jsx)("div", { id: 'snaplist', style: { marginBottom: '10px' }, children: (0, jsx_runtime_1.jsx)(snapshots_1.LocalStateSnapshotList, {}) }), (0, jsx_runtime_1.jsx)("div", { id: 'snap', style: { marginBottom: '10px' }, children: (0, jsx_runtime_1.jsx)(snapshots_1.LocalStateSnapshots, {}) }), (0, jsx_runtime_1.jsx)("div", { id: 'snapoption', style: { marginBottom: '10px' }, children: (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: 'Snapshot Options', initiallyExpanded: false, children: (0, jsx_runtime_1.jsx)(snapshots_1.LocalStateSnapshotParams, {}) }) })] });
    }
}
exports.SnapshotControls = SnapshotControls;
class ExplorerInfo extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isDisabled: false,
            showHelp: false
        };
        this.setupDriver = () => {
            // setup the tour of the interface
            const driver = this.plugin.customState.driver;
            if (!driver)
                return;
            driver.setSteps([
                // Left panel
                { element: '#explorerinfo', popover: { title: 'Explorer Header Info', description: 'This section displays the explorer header with version information, documentation access, and tour navigation. Use the right and left arrow keys to navigate the tour.', side: 'left', align: 'start' } },
                { element: '#database', popover: { title: 'Import from PDB', description: 'Load structures directly from PDB and PDB-IHM databases.', side: 'bottom', align: 'start' } },
                { element: '#loader', popover: { title: 'Import from File', description: 'Load local files (.molx, .molj, .zip, .cif, .bcif) using this option.', side: 'bottom', align: 'start' } },
                { element: '#example', popover: { title: 'Example Models and Tours', description: 'Select from a range of example models and tours provided.', side: 'left', align: 'start' } },
                { element: '#session', popover: { title: 'Session Management', description: 'Download the current session in .molx format.', side: 'top', align: 'start' } },
                { element: '#snaplist', popover: { title: 'Snapshot List', description: 'View and manage the list of snapshots. You can reorder them and edit their titles, keys, and descriptions. Snapshot states cannot be edited.', side: 'right', align: 'start' } },
                { element: '#snap', popover: { title: 'Add Snapshot', description: 'Save the current state (e.g., camera position, color, visibility, etc.) in a snapshot with an optional title, key, and description.', side: 'right', align: 'start' } },
                { element: '#snapoption', popover: { title: 'Snapshot Options', description: 'These options are saved in the snapshot. Set them before adding a snapshot to see their effect during animation playback.', side: 'right', align: 'start' } },
                { element: '#exportanimation', popover: { title: 'Export Animation', description: 'Create movies or scenes with rocking, rotating, or snapshots animations.', side: 'right', align: 'start' } },
                { element: '#viewportsettings', popover: { title: 'Viewport Settings', description: 'Advanced settings for the renderer and trackball.', side: 'right', align: 'start' } },
                // Viewport
                { element: '#snapinfo', popover: { title: 'Snapshot Description', description: 'Save the current state (e.g., camera position, color, visibility, etc.) in a snapshot with an optional title, key, and description.', side: 'right', align: 'start' } },
                { element: '#snapinfoctrl', popover: { title: 'Snapshot Description Control', description: 'Control the visibility and text size of the snapshot description widget.', side: 'right', align: 'start' } },
                // Right panel
                { element: '#modelinfo', popover: { title: 'Model Information', description: 'Summary information about the model, if available.', side: 'right', align: 'start' } },
                { element: '#selestyle', popover: { title: 'Selection Style', description: 'Choose the rendering style for entity selection accessed via Shift/Ctrl mouse. Options include: Color & Outline, Color, Outline.', side: 'right', align: 'start' } },
                { element: '#seleinfo', popover: { title: 'Selection List', description: 'View the current list of selected entities.', side: 'right', align: 'start' } },
                { element: '#measurements', popover: { title: 'Measurements', description: 'Use this widget to create labels, measure distances, angles, dihedral orientations, and planes for the selected entities.', side: 'right', align: 'start' } },
                { element: '#quickstyles', popover: { title: 'Quick Styles', description: 'Change between a selection of style presets.', side: 'right', align: 'start' } },
                { element: '#graphicsquality', popover: { title: 'Graphics Quality', description: 'Adjust the overall graphics quality. Lower quality improves performance. Options are: Ultra, Quality (Default), Balanced, Performance, Custom. Custom settings use the Culling & LOD values set in the Tree.', side: 'right', align: 'start' } },
                { element: '#searchtree', popover: { title: 'Search', description: 'Filter the entity tree based on your queries.', side: 'right', align: 'start' } },
                { element: '#grouptree', popover: { title: 'Group By', description: 'Change the grouping of the hierarchy tree, e.g., group by instance or by compartment.', side: 'right', align: 'start' } },
                { element: '#tree', popover: { title: 'Tree Hierarchy', description: 'View the hierarchical tree of entity types in the model.', side: 'right', align: 'start' } },
                { element: '#focusinfo', popover: { title: 'Selection Description', description: 'Detailed information about the current selection, if present in the loaded file.', side: 'right', align: 'start' } },
                { popover: { title: 'Happy Exploring!', description: 'That’s all! Go ahead and start exploring or creating mesoscale tours.' } }
            ]);
            driver.refresh();
        };
        this.openHelp = () => {
            // open a new page with the documentation
            window.open('https://molstar.org/me-docs/', '_blank');
        };
        this.toggleHelp = () => {
            const driver = this.plugin.customState.driver;
            if (!driver || !driver.hasNextStep()) {
                this.setupDriver();
            }
            this.setState({ showHelp: !this.state.showHelp }, () => {
                if (this.state.showHelp && driver) {
                    driver.drive(); // start at 0
                }
            });
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.data.behaviors.isUpdating, v => {
            this.setState({ isDisabled: v });
        });
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (!this.state.isDisabled && state_1.MesoscaleState.has(this.plugin) && state_1.MesoscaleState.ref(this.plugin) === e.ref) {
                this.forceUpdate();
            }
        });
    }
    render() {
        const driver = this.plugin.customState.driver;
        if (!driver)
            return;
        const help = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.HelpOutlineSvg, toggleState: false, small: true, onClick: this.openHelp, title: 'Open the Documentation' });
        const tour = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.TourSvg, toggleState: false, small: true, onClick: this.toggleHelp, title: 'Start the interactive tour' });
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { id: 'explorerinfo', style: { display: 'flex', alignItems: 'center', padding: '4px 0 4px 8px' }, className: 'msp-help-text', children: [(0, jsx_runtime_1.jsx)("h2", { style: { flexGrow: 1 }, children: "Mol* Mesoscale Explorer" }), tour, help] }) });
    }
}
exports.ExplorerInfo = ExplorerInfo;
class MesoQuickStylesControls extends base_1.CollapsableControls {
    defaultState() {
        return {
            isCollapsed: true,
            header: 'Quick Styles',
            brand: { accent: 'gray', svg: icons_1.MagicWandSvg }
        };
    }
    renderControls() {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(MesoQuickStyles, {}) });
    }
}
exports.MesoQuickStylesControls = MesoQuickStylesControls;
class MesoQuickStyles extends base_1.PluginUIComponent {
    async default() {
        if (!this.plugin.canvas3d)
            return;
        const p = this.plugin.canvas3d.props;
        this.plugin.canvas3d.setProps({
            renderer: {
                exposure: 1.1,
            },
            postprocessing: {
                ...p.postprocessing,
                shadow: {
                    name: 'on',
                    params: {
                        maxDistance: 80,
                        steps: 3,
                        tolerance: 1.0,
                    }
                },
                outline: {
                    name: 'on',
                    params: {
                        scale: 1,
                        threshold: 0.15,
                        color: (0, color_1.Color)(0x000000),
                        includeTransparent: false,
                    }
                },
                dof: { name: 'off', params: {} },
            }
        });
        await (0, state_1.updateStyle)(this.plugin, {
            ignoreLight: true,
            material: { metalness: 0, roughness: 1.0, bumpiness: 0 },
            celShaded: false,
            illustrative: false,
        });
    }
    async celshading() {
        if (!this.plugin.canvas3d)
            return;
        const p = this.plugin.canvas3d.props;
        this.plugin.canvas3d.setProps({
            renderer: {
                exposure: 1.5,
            },
            postprocessing: {
                ...p.postprocessing,
                shadow: {
                    name: 'on',
                    params: {
                        maxDistance: 256,
                        steps: 64,
                        tolerance: 1.0,
                    }
                },
                outline: { name: 'off', params: {} },
                dof: { name: 'off', params: {} },
            }
        });
        await (0, state_1.updateStyle)(this.plugin, {
            ignoreLight: false,
            material: { metalness: 0, roughness: 1.0, bumpiness: 0 },
            celShaded: true,
            illustrative: false,
        });
    }
    async shinyDof() {
        if (!this.plugin.canvas3d)
            return;
        const p = this.plugin.canvas3d.props;
        this.plugin.canvas3d.setProps({
            renderer: {
                exposure: 1.1,
            },
            postprocessing: {
                ...p.postprocessing,
                shadow: {
                    name: 'on',
                    params: {
                        maxDistance: 256,
                        steps: 64,
                        tolerance: 1.0,
                    }
                },
                outline: { name: 'off', params: {} },
                dof: {
                    name: 'on',
                    params: {
                        blurSize: 9,
                        blurSpread: 1.0,
                        inFocus: 0.0,
                        PPM: 200.0,
                        center: 'camera-target',
                        mode: 'sphere',
                    }
                }
            }
        });
        await (0, state_1.updateStyle)(this.plugin, {
            ignoreLight: false,
            material: { metalness: 0, roughness: 0.2, bumpiness: 0 },
            celShaded: false,
            illustrative: false,
        });
    }
    async illustrative() {
        if (!this.plugin.canvas3d)
            return;
        const p = this.plugin.canvas3d.props;
        this.plugin.canvas3d.setProps({
            renderer: {
                exposure: 1.5,
            },
            postprocessing: {
                ...p.postprocessing,
                shadow: {
                    name: 'on',
                    params: {
                        maxDistance: 256,
                        steps: 64,
                        tolerance: 1.0,
                    }
                },
                outline: {
                    name: 'on',
                    params: {
                        scale: 1,
                        threshold: 0.15,
                        color: (0, color_1.Color)(0x000000),
                        includeTransparent: false,
                    }
                },
                dof: { name: 'off', params: {} },
            }
        });
        await (0, state_1.updateStyle)(this.plugin, {
            ignoreLight: true,
            material: { metalness: 0, roughness: 1.0, bumpiness: 0 },
            celShaded: false,
            illustrative: true,
        });
    }
    async shiny() {
        if (!this.plugin.canvas3d)
            return;
        const p = this.plugin.canvas3d.props;
        this.plugin.canvas3d.setProps({
            renderer: {
                exposure: 1.5,
            },
            postprocessing: {
                ...p.postprocessing,
                shadow: { name: 'off', params: {} },
                outline: { name: 'off', params: {} },
                dof: { name: 'off', params: {} },
            }
        });
        await (0, state_1.updateStyle)(this.plugin, {
            ignoreLight: false,
            material: { metalness: 0, roughness: 0.2, bumpiness: 0 },
            celShaded: false,
            illustrative: false,
        });
    }
    async stylized() {
        if (!this.plugin.canvas3d)
            return;
        const p = this.plugin.canvas3d.props;
        this.plugin.canvas3d.setProps({
            renderer: {
                exposure: 1.1,
            },
            postprocessing: {
                ...p.postprocessing,
                shadow: {
                    name: 'on',
                    params: {
                        maxDistance: 256,
                        steps: 64,
                        tolerance: 1.0,
                    }
                },
                outline: {
                    name: 'on',
                    params: {
                        scale: 1,
                        threshold: 0.15,
                        color: (0, color_1.Color)(0x000000),
                        includeTransparent: false,
                    }
                },
                dof: { name: 'off', params: {} },
            }
        });
        await (0, state_1.updateStyle)(this.plugin, {
            ignoreLight: false,
            material: { metalness: 0, roughness: 0.2, bumpiness: 0 },
            celShaded: false,
            illustrative: true,
        });
    }
    render() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.Button, { noOverflow: true, title: 'Applies default representation preset and sets outline and occlusion effects to default', onClick: () => this.default(), style: { width: 'auto' }, children: "Default" }), (0, jsx_runtime_1.jsx)(common_1.Button, { noOverflow: true, title: 'Applies celShading', onClick: () => this.celshading(), style: { width: 'auto' }, children: "Cel-shaded" }), (0, jsx_runtime_1.jsx)(common_1.Button, { noOverflow: true, title: 'Applies illustrative colors preset', onClick: () => this.illustrative(), style: { width: 'auto' }, children: "Illustrative" })] }), (0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.Button, { noOverflow: true, title: 'Apply shiny material to default', onClick: () => this.shiny(), style: { width: 'auto' }, children: "Shiny" }), (0, jsx_runtime_1.jsx)(common_1.Button, { noOverflow: true, title: 'Enable shiny material, outline, and illustrative colors', onClick: () => this.stylized(), style: { width: 'auto' }, children: "Shiny-Illustrative" }), (0, jsx_runtime_1.jsx)(common_1.Button, { noOverflow: true, title: 'Enable DOF and shiny material', onClick: () => this.shinyDof(), style: { width: 'auto' }, children: "Shiny-DOF" })] })] });
    }
}
exports.MesoQuickStyles = MesoQuickStyles;
