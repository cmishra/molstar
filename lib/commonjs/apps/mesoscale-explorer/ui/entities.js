"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityNode = exports.GroupNode = exports.EntityControls = exports.FocusInfo = exports.SelectionInfo = exports.ModelInfo = void 0;
exports.MesoMarkdownAnchor = MesoMarkdownAnchor;
exports.MesoViewportSnapshotDescription = MesoViewportSnapshotDescription;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const base_1 = require("../../../mol-plugin-ui/base");
const common_1 = require("../../../mol-plugin-ui/controls/common");
const icons_1 = require("../../../mol-plugin-ui/controls/icons");
const commands_1 = require("../../../mol-plugin/commands");
const mol_state_1 = require("../../../mol-state");
const parameters_1 = require("../../../mol-plugin-ui/controls/parameters");
const param_definition_1 = require("../../../mol-util/param-definition");
const clip_1 = require("../../../mol-util/clip");
const color_1 = require("../../../mol-util/color");
const color_2 = require("../../../mol-plugin-ui/controls/color");
const marker_action_1 = require("../../../mol-util/marker-action");
const loci_1 = require("../../../mol-model/loci");
const mol_util_1 = require("../../../mol-util");
const state_1 = require("../data/state");
const react_1 = tslib_1.__importStar(require("react"));
const element_1 = require("../../../mol-model/structure/structure/element");
const structure_1 = require("../../../mol-model/structure");
const geometry_1 = require("../../../mol-math/geometry");
const camera_1 = require("../behavior/camera");
const react_markdown_1 = tslib_1.__importDefault(require("react-markdown"));
const rxjs_1 = require("rxjs");
const states_1 = require("./states");
function centerLoci(plugin, loci, durationMs = 250) {
    const { canvas3d } = plugin;
    if (!canvas3d)
        return;
    const sphere = loci_1.Loci.getBoundingSphere(loci) || (0, geometry_1.Sphere3D)();
    const snapshot = canvas3d.camera.getCenter(sphere.center);
    canvas3d.requestCameraReset({ durationMs, snapshot });
}
class ModelInfo extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isDisabled: false,
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
    get info() {
        if (!state_1.MesoscaleState.has(this.plugin))
            return;
        const state = state_1.MesoscaleState.get(this.plugin);
        if (!state.description && !state.link)
            return;
        return {
            selectionDescription: state.focusInfo,
            description: state.description,
            link: state.link,
        };
    }
    render() {
        const info = this.info;
        return info && (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { id: 'modelinfo', className: 'msp-help-text', children: [(0, jsx_runtime_1.jsx)("div", { children: info.description }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("a", { href: info.link, target: '_blank', children: "Source" }) })] }) });
    }
}
exports.ModelInfo = ModelInfo;
const SelectionStyleParam = param_definition_1.ParamDefinition.Select('color+outline', param_definition_1.ParamDefinition.objectToOptions({
    'color+outline': 'Color & Outline',
    'color': 'Color',
    'outline': 'Outline'
}));
class SelectionInfo extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isDisabled: false,
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.data.behaviors.isUpdating, v => {
            this.setState({ isDisabled: v });
        });
        this.subscribe(this.plugin.managers.structure.selection.events.changed, e => {
            if (!this.state.isDisabled) {
                this.forceUpdate();
            }
        });
    }
    get info() {
        const infos = [];
        this.plugin.managers.structure.selection.entries.forEach((e, k) => {
            var _a;
            if (element_1.StructureElement.Loci.is(e.selection) && !element_1.StructureElement.Loci.isEmpty(e.selection)) {
                const cell = this.plugin.helpers.substructureParent.get(e.selection.structure);
                const { entities } = e.selection.structure.model;
                const description = entities.data.pdbx_description.value(0)[0] || 'model';
                infos.push({
                    description: description,
                    label: ((_a = cell === null || cell === void 0 ? void 0 : cell.obj) === null || _a === void 0 ? void 0 : _a.label) || 'Unknown',
                    key: k,
                });
            }
        });
        return infos;
    }
    find(label) {
        state_1.MesoscaleState.set(this.plugin, { filter: `"${label}"` });
        if (label)
            (0, state_1.expandAllGroups)(this.plugin);
    }
    ;
    remove(key) {
        const e = this.plugin.managers.structure.selection.entries.get(key);
        if (!e)
            return;
        const loci = structure_1.Structure.toStructureElementLoci(e.selection.structure);
        this.plugin.managers.interactivity.lociSelects.deselect({ loci }, false);
    }
    center(key) {
        const e = this.plugin.managers.structure.selection.entries.get(key);
        if (!e)
            return;
        const loci = structure_1.Structure.toStructureElementLoci(e.selection.structure);
        centerLoci(this.plugin, loci);
        const cell = this.plugin.helpers.substructureParent.get(loci.structure);
        const d = (0, state_1.getCellDescription)(cell); // '### ' + cell?.obj?.label + '\n\n' + cell?.obj?.description;
        state_1.MesoscaleState.set(this.plugin, { focusInfo: `${d}` });
    }
    get selection() {
        const info = this.info;
        const help_selection = (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { children: ["Use ", (0, jsx_runtime_1.jsx)("i", { children: "ctrl+left" }), " to select entities, either on the 3D canvas or in the tree below"] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Use ", (0, jsx_runtime_1.jsx)("i", { children: "shift+left" }), " to select individual chain on the 3D canvas"] })] });
        if (!info.length)
            return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("div", { id: 'seleinfo', className: 'msp-help-text', children: help_selection }) });
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { id: 'seleinfo', children: [info.map((entry, index) => {
                        const label = (0, jsx_runtime_1.jsx)(common_1.Button, { className: `msp-btn-tree-label`, noOverflow: true, disabled: this.state.isDisabled, onClick: () => this.center(entry.key), children: (0, jsx_runtime_1.jsx)("span", { title: entry.label, children: entry.label }) });
                        const find = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.SearchSvg, toggleState: false, disabled: this.state.isDisabled, small: true, onClick: () => this.find(entry.label) });
                        const remove = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.CloseSvg, toggleState: false, disabled: this.state.isDisabled, onClick: () => this.remove(entry.key) });
                        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: `msp-flex-row`, style: { margin: `1px 5px 1px ${1 * 10 + 5}px` }, children: [label, find, remove] }, index) });
                    }), ";"] }) });
    }
    get style() {
        var _a;
        const p = (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.props;
        if (!p)
            return;
        if (p.renderer.dimStrength === 1 && p.marking.enabled)
            return 'color+outline';
        if (p.renderer.dimStrength === 1)
            return 'color';
        if (p.marking.enabled)
            return 'outline';
    }
    setStyle(value) {
        var _a, _b, _c, _d;
        if (value.includes('color') && value.includes('outline')) {
            (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps({
                renderer: {
                    dimStrength: 1,
                },
                marking: {
                    enabled: true
                }
            });
        }
        else if (value.includes('color')) {
            (_b = this.plugin.canvas3d) === null || _b === void 0 ? void 0 : _b.setProps({
                renderer: {
                    dimStrength: 1,
                },
                marking: {
                    enabled: false
                }
            });
        }
        else if (value.includes('outline')) {
            (_c = this.plugin.canvas3d) === null || _c === void 0 ? void 0 : _c.setProps({
                renderer: {
                    dimStrength: 0,
                    selectStrength: 0.3,
                },
                marking: {
                    enabled: true
                }
            });
        }
        else {
            (_d = this.plugin.canvas3d) === null || _d === void 0 ? void 0 : _d.setProps({
                renderer: {
                    dimStrength: 0,
                    selectStrength: 0,
                },
                marking: {
                    enabled: false
                }
            });
        }
        this.forceUpdate();
    }
    renderStyle() {
        const style = this.style || '';
        return (0, jsx_runtime_1.jsx)("div", { id: 'selestyle', style: { margin: '5px', marginBottom: '10px' }, children: (0, jsx_runtime_1.jsx)(parameters_1.SelectControl, { name: 'Style', param: SelectionStyleParam, value: style, onChange: (e) => { this.setStyle(e.value); } }) });
    }
    render() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [this.renderStyle(), this.selection] });
    }
}
exports.SelectionInfo = SelectionInfo;
function MesoMarkdownAnchor({ href, children, element }) {
    const plugin = react_1.default.useContext(base_1.PluginReactContext);
    if (!href)
        return element;
    // Decode the href to handle encoded spaces and other characters
    const decodedHref = href ? decodeURIComponent(href) : '';
    const handleHover = (e) => {
        var _a, _b, _c, _d, _e, _f;
        e.preventDefault();
        if (decodedHref.startsWith('i')) {
            (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.mark({ loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.RemoveHighlight);
            const query_names = decodedHref.substring(1).split(',');
            for (const query_name of query_names) {
                const entities = (0, state_1.getEveryEntity)(plugin, query_name);
                for (const r of entities) {
                    const repr = (_b = r.obj) === null || _b === void 0 ? void 0 : _b.data.repr;
                    if (repr) {
                        (_c = plugin.canvas3d) === null || _c === void 0 ? void 0 : _c.mark({ repr, loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.Highlight);
                    }
                }
            }
        }
        else if (decodedHref.startsWith('g')) {
            (_d = plugin.canvas3d) === null || _d === void 0 ? void 0 : _d.mark({ loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.RemoveHighlight);
            const qindex = decodedHref.indexOf('.');
            const query = decodedHref.substring(1, qindex) + ':';
            const query_names = decodedHref.substring(qindex + 1).split(',');
            for (const query_name of query_names) {
                const e = (0, state_1.getAllEntities)(plugin, query + query_name);
                for (const r of e) {
                    const repr = (_e = r.obj) === null || _e === void 0 ? void 0 : _e.data.repr;
                    if (repr) {
                        (_f = plugin.canvas3d) === null || _f === void 0 ? void 0 : _f.mark({ repr, loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.Highlight);
                    }
                }
            }
        }
    };
    const handleLeave = (e) => {
        var _a;
        // Implement your hover off logic here
        // Example: Perform an action if the href starts with 'h'
        if (decodedHref.startsWith('i') || decodedHref.startsWith('g')) {
            // Example hover off action
            e.preventDefault();
            (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.mark({ loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.RemoveHighlight);
        }
    };
    const handleClick = (e) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        e.preventDefault();
        if (href.startsWith('#')) {
            plugin.managers.snapshot.applyKey(decodedHref.substring(1));
        }
        else if (decodedHref.startsWith('i')) {
            plugin.managers.interactivity.lociSelects.deselectAll();
            (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.mark({ loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.RemoveHighlight);
            const query_names = decodedHref.substring(1).split(',');
            for (const query_name of query_names) {
                const entities = (0, state_1.getFilteredEntities)(plugin, '', query_name);
                for (const r of entities) {
                    const repr = (_b = r.obj) === null || _b === void 0 ? void 0 : _b.data.repr;
                    if (repr) {
                        (_c = plugin.canvas3d) === null || _c === void 0 ? void 0 : _c.mark({ repr, loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.Highlight);
                    }
                    const cell = r;
                    if (!(((_d = cell === null || cell === void 0 ? void 0 : cell.obj) === null || _d === void 0 ? void 0 : _d.data.sourceData) instanceof structure_1.Structure)) {
                        return;
                    }
                    const loci = structure_1.Structure.toStructureElementLoci(cell.obj.data.sourceData);
                    plugin.managers.interactivity.lociSelects.toggle({ loci }, false);
                }
            }
        }
        else if (decodedHref.startsWith('g')) {
            plugin.managers.interactivity.lociSelects.deselectAll();
            (_e = plugin.canvas3d) === null || _e === void 0 ? void 0 : _e.mark({ loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.RemoveHighlight);
            const qindex = decodedHref.indexOf('.');
            const query = decodedHref.substring(1, qindex) + ':';
            const query_names = decodedHref.substring(qindex + 1).split(',');
            for (const query_name of query_names) {
                const entities = (0, state_1.getAllEntities)(plugin, query + query_name);
                for (const r of entities) {
                    const repr = (_f = r.obj) === null || _f === void 0 ? void 0 : _f.data.repr;
                    if (repr) {
                        (_g = plugin.canvas3d) === null || _g === void 0 ? void 0 : _g.mark({ repr, loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.Highlight);
                    }
                    const cell = r;
                    if (!(((_h = cell === null || cell === void 0 ? void 0 : cell.obj) === null || _h === void 0 ? void 0 : _h.data.sourceData) instanceof structure_1.Structure))
                        return;
                    const loci = structure_1.Structure.toStructureElementLoci(cell.obj.data.sourceData);
                    plugin.managers.interactivity.lociSelects.toggle({ loci }, false);
                }
            }
        }
        else {
            // open the link in a new tab
            window.open(decodedHref, '_blank');
        }
    };
    if (decodedHref[0] === '#') {
        return (0, jsx_runtime_1.jsx)("a", { href: decodedHref[0], onMouseOver: handleHover, onClick: handleClick, children: children });
    }
    if (decodedHref[0] === 'i' || decodedHref[0] === 'g') {
        return (0, jsx_runtime_1.jsx)("a", { href: decodedHref[0], onMouseLeave: handleLeave, onMouseOver: handleHover, onClick: handleClick, children: children });
    }
    if (decodedHref[0] === 'h') {
        return (0, jsx_runtime_1.jsx)("a", { href: decodedHref[0], onClick: handleClick, rel: 'noopener noreferrer', children: children });
    }
    return element;
}
function MesoViewportSnapshotDescription() {
    var _a;
    let tSize = 14;
    const plugin = react_1.default.useContext(base_1.PluginReactContext);
    if (state_1.MesoscaleState.has(plugin)) {
        const state = state_1.MesoscaleState.get(plugin);
        tSize = state.textSizeDescription;
    }
    const [_, setV] = react_1.default.useState(0);
    const [isShown, setIsShown] = (0, react_1.useState)(true);
    const [textSize, setTextSize] = (0, react_1.useState)(tSize);
    const toggleVisibility = () => {
        setIsShown(!isShown);
    };
    const increaseTextSize = () => {
        setTextSize(prevSize => Math.min(prevSize + 2, 50)); // Increase the text size by 2px, but not above 50px
    };
    const decreaseTextSize = () => {
        setTextSize(prevSize => Math.max(prevSize - 2, 2)); // Decrease the text size by 2px, but not below 2px
    };
    react_1.default.useEffect(() => {
        const sub = plugin.managers.snapshot.events.changed.subscribe(() => setV(v => v + 1));
        return () => sub.unsubscribe();
    }, [plugin]);
    const current = plugin.managers.snapshot.state.current;
    if (!current)
        return null;
    const e = plugin.managers.snapshot.getEntry(current);
    if (!((_a = e === null || e === void 0 ? void 0 : e.description) === null || _a === void 0 ? void 0 : _a.trim()))
        return null;
    if (state_1.MesoscaleState.has(plugin)) {
        state_1.MesoscaleState.set(plugin, { textSizeDescription: textSize });
    }
    const showInfo = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: isShown ? icons_1.TooltipTextSvg : icons_1.TooltipTextOutlineSvg, flex: '20px', onClick: toggleVisibility, title: isShown ? 'Hide Description' : 'Show Description' });
    const increasePoliceSize = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.PlusBoxSvg, flex: '20px', onClick: increaseTextSize, title: 'Bigger Text' });
    const decreasePoliceSize = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.MinusBoxSvg, flex: '20px', onClick: decreaseTextSize, title: 'Smaller Text' });
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { id: 'snapinfoctrl', className: "msp-state-snapshot-viewport-controls", style: { marginRight: '30px' }, children: [showInfo, increasePoliceSize, decreasePoliceSize] }), (0, jsx_runtime_1.jsx)("div", { id: 'snapinfo', className: `msp-snapshot-description-me ${isShown ? 'shown' : 'hidden'}`, style: { fontSize: `${textSize}px` }, children: e.descriptionFormat === 'plaintext'
                    && e.description
                    || (0, jsx_runtime_1.jsx)(react_markdown_1.default, { skipHtml: false, components: { a: MesoMarkdownAnchor }, children: e.description }) })] }));
}
class FocusInfo extends base_1.PluginUIComponent {
    componentDidMount() {
        this.subscribe((0, rxjs_1.combineLatest)([
            this.plugin.state.data.behaviors.isUpdating,
            this.plugin.managers.structure.selection.events.changed
        ]), ([isUpdating]) => {
            if (!isUpdating)
                this.forceUpdate();
        });
    }
    get info() {
        let focusInfo = '';
        if (state_1.MesoscaleState.has(this.plugin)) {
            const state = state_1.MesoscaleState.get(this.plugin);
            if (state.focusInfo)
                focusInfo = state.focusInfo;
        }
        return focusInfo;
    }
    render() {
        const focusInfo = this.info;
        const description = (focusInfo !== '') ? (0, jsx_runtime_1.jsx)(react_markdown_1.default, { skipHtml: true, components: { a: MesoMarkdownAnchor }, children: focusInfo }) : '';
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("div", { id: 'focusinfo', className: 'msp-help-text', children: description }) });
    }
}
exports.FocusInfo = FocusInfo;
class EntityControls extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.filterRef = react_1.default.createRef();
        this.prevFilter = '';
        this.filterFocus = false;
        this.state = {
            isDisabled: false,
        };
        this.setGroupBy = (value) => {
            this.roots.forEach((c, i) => {
                if (c.state.isHidden && value === i || !c.state.isHidden && value !== i) {
                    commands_1.PluginCommands.State.ToggleVisibility(this.plugin, { state: c.parent, ref: c.transform.ref });
                }
            });
        };
        this.setFilter = (value) => {
            this.filterFocus = true;
            const filter = value.trim().replace(/\s+/gi, ' ');
            state_1.MesoscaleState.set(this.plugin, { filter });
            if (filter)
                (0, state_1.expandAllGroups)(this.plugin);
        };
        this.setGraphics = (graphics) => {
            state_1.MesoscaleState.set(this.plugin, { graphics });
            this.plugin.customState.graphicsMode = graphics;
            if (graphics === 'custom')
                return;
            const update = this.plugin.state.data.build();
            const { lodLevels, approximate, alphaThickness } = (0, state_1.getGraphicsModeProps)(graphics);
            for (const r of (0, state_1.getAllEntities)(this.plugin)) {
                update.to(r).update(old => {
                    if (old.type) {
                        old.type.params.lodLevels = lodLevels;
                        old.type.params.approximate = approximate;
                        old.type.params.alphaThickness = alphaThickness;
                    }
                });
            }
            for (const g of (0, state_1.getAllGroups)(this.plugin)) {
                update.to(g).update(old => {
                    old.lod.lodLevels = lodLevels;
                    old.lod.approximate = approximate;
                });
            }
            update.commit();
            (0, state_1.setGraphicsCanvas3DProps)(this.plugin, graphics);
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.events.object.created, e => {
            this.forceUpdate();
        });
        this.subscribe(this.plugin.state.events.object.removed, e => {
            this.forceUpdate();
        });
        this.subscribe(this.plugin.state.data.behaviors.isUpdating, v => {
            this.setState({ isDisabled: v });
        });
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (!this.state.isDisabled && this.roots.some(r => e.cell === r) || (state_1.MesoscaleState.has(this.plugin) && state_1.MesoscaleState.ref(this.plugin) === e.ref)) {
                this.forceUpdate();
            }
        });
    }
    componentDidUpdate() {
        var _a;
        const filter = this.filter;
        if (this.filterFocus) {
            (_a = this.filterRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            this.prevFilter = filter;
        }
    }
    get roots() {
        return (0, state_1.getRoots)(this.plugin);
    }
    get groupBy() {
        const roots = this.roots;
        for (let i = 0, il = roots.length; i < il; ++i) {
            if (!roots[i].state.isHidden)
                return i;
        }
        return 0;
    }
    get filter() {
        return state_1.MesoscaleState.has(this.plugin) ? state_1.MesoscaleState.get(this.plugin).filter : '';
    }
    get graphics() {
        const customState = this.plugin.customState;
        return state_1.MesoscaleState.has(this.plugin) ? state_1.MesoscaleState.get(this.plugin).graphics : customState.graphicsMode;
    }
    renderGraphics() {
        const graphics = this.graphics;
        return (0, jsx_runtime_1.jsx)("div", { id: 'graphicsquality', style: { margin: '5px', marginBottom: '10px' }, children: (0, jsx_runtime_1.jsx)(parameters_1.SelectControl, { name: 'Graphics', param: state_1.MesoscaleStateParams.graphics, value: `${graphics}`, onChange: (e) => { this.setGraphics(e.value); } }) });
    }
    render() {
        const roots = this.roots;
        if (roots.length === 0 || !state_1.MesoscaleState.has(this.plugin)) {
            return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: this.renderGraphics() });
        }
        const disabled = this.state.isDisabled;
        const groupBy = this.groupBy;
        const options = [];
        roots.forEach((c, i) => {
            options.push([`${i}`, c.obj.label]);
        });
        const groupParam = param_definition_1.ParamDefinition.Select(options[0][0], options);
        const root = roots.length === 1 ? roots[0] : roots[groupBy];
        const filter = this.filter;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [this.renderGraphics(), (0, jsx_runtime_1.jsxs)("div", { id: 'searchtree', className: `msp-flex-row msp-control-row`, style: { margin: '5px', marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("input", { type: 'text', ref: this.filterRef, value: filter, placeholder: 'Search', onChange: e => this.setFilter(e.target.value), disabled: disabled, onBlur: () => this.filterFocus = false }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.CloseSvg, toggleState: false, disabled: disabled, onClick: () => this.setFilter('') })] }), options.length > 1 && (0, jsx_runtime_1.jsx)("div", { id: 'grouptree', style: { margin: '5px', marginBottom: '10px' }, children: (0, jsx_runtime_1.jsx)(parameters_1.SelectControl, { name: 'Group By', param: groupParam, value: `${groupBy}`, onChange: (e) => { this.setGroupBy(parseInt(e.value)); } }) }), (0, jsx_runtime_1.jsx)("div", { id: 'tree', style: { position: 'relative', overflowY: 'auto', borderBottom: '1px  solid #000', maxHeight: '600px' }, children: (0, jsx_runtime_1.jsx)(GroupNode, { filter: filter, cell: root, depth: 0 }) })] });
    }
}
exports.EntityControls = EntityControls;
class Node extends base_1.PluginUIComponent {
    is(e) {
        return e.ref === this.ref && e.state === this.props.cell.parent;
    }
    get ref() {
        return this.props.cell.transform.ref;
    }
    get cell() {
        return this.props.cell;
    }
    get roots() {
        return (0, state_1.getRoots)(this.plugin);
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.data.behaviors.isUpdating, v => {
            this.setState({ isDisabled: v });
        });
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (!this.state.isDisabled && this.is(e)) {
                this.forceUpdate();
            }
        });
    }
}
class GroupNode extends Node {
    constructor() {
        super(...arguments);
        this.state = {
            isCollapsed: !!this.props.cell.state.isCollapsed,
            action: undefined,
            isDisabled: false,
        };
        this.toggleExpanded = (e) => {
            commands_1.PluginCommands.State.ToggleExpanded(this.plugin, { state: this.cell.parent, ref: this.ref });
        };
        this.toggleColor = (e) => {
            this.setState({ action: this.state.action === 'color' ? undefined : 'color' });
        };
        this.toggleClip = () => {
            this.setState({ action: this.state.action === 'clip' ? undefined : 'clip' });
        };
        this.toggleRoot = () => {
            this.setState({ action: this.state.action === 'root' ? undefined : 'root' });
        };
        this.showInfo = (e) => {
            e.preventDefault();
            const d = (0, state_1.getCellDescription)(this.cell); // '### ' + this.cell?.obj?.label + '\n\n' + this.cell?.obj?.description;
            state_1.MesoscaleState.set(this.plugin, { focusInfo: `${d}` });
        };
        this.highlight = (e) => {
            var _a, _b, _c;
            e.preventDefault();
            (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.mark({ loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.RemoveHighlight);
            for (const r of this.allFilteredEntities) {
                const repr = (_b = r.obj) === null || _b === void 0 ? void 0 : _b.data.repr;
                if (repr) {
                    (_c = this.plugin.canvas3d) === null || _c === void 0 ? void 0 : _c.mark({ repr, loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.Highlight);
                }
            }
        };
        this.clearHighlight = (e) => {
            var _a;
            e.preventDefault();
            (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.mark({ loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.RemoveHighlight);
            e.currentTarget.blur();
        };
        this.toggleVisible = (e) => {
            commands_1.PluginCommands.State.ToggleVisibility(this.plugin, { state: this.cell.parent, ref: this.ref });
            const isHidden = this.cell.state.isHidden;
            for (const r of this.allFilteredEntities) {
                this.plugin.state.data.updateCellState(r.transform.ref, { isHidden });
            }
            this.plugin.build().to(this.ref).update(old => {
                old.hidden = isHidden;
            }).commit();
        };
        this.updateColor = (values) => {
            const update = this.plugin.state.data.build();
            const { value, illustrative, type, lightness, alpha, emissive } = values;
            const entities = this.filteredEntities;
            let groupColors = [];
            if (type === 'generate') {
                groupColors = (0, state_1.getDistinctGroupColors)(entities.length, value, values.variability, values.shift);
            }
            for (let i = 0; i < entities.length; ++i) {
                const c = type === 'generate' ? groupColors[i] : value;
                update.to(entities[i]).update(old => {
                    if (old.type) {
                        if (illustrative) {
                            old.colorTheme = { name: 'illustrative', params: { style: { name: 'uniform', params: { value: c, lightness } } } };
                        }
                        else {
                            old.colorTheme = { name: 'uniform', params: { value: c, lightness } };
                        }
                        old.type.params.alpha = alpha;
                        old.type.params.xrayShaded = alpha < 1 ? 'inverted' : false;
                        old.type.params.emissive = emissive;
                    }
                    else {
                        old.coloring.params.color = c;
                        old.coloring.params.lightness = lightness;
                        old.alpha = alpha;
                        old.xrayShaded = alpha < 1 ? true : false;
                        old.emissive = emissive;
                    }
                });
            }
            update.to(this.ref).update(old => {
                old.color = values;
            });
            for (const r of this.roots) {
                update.to(r).update(old => {
                    old.color.type = 'custom';
                });
            }
            update.commit();
        };
        this.updateRoot = async (values) => {
            var _a, _b;
            await (0, state_1.updateColors)(this.plugin, values, (_a = this.cell.params) === null || _a === void 0 ? void 0 : _a.values.tag, this.props.filter);
            const update = this.plugin.state.data.build();
            for (const r of this.roots) {
                if (r !== this.cell) {
                    update.to(r).update(old => {
                        old.color.type = 'custom';
                    });
                    const others = (0, state_1.getAllLeafGroups)(this.plugin, (_b = r.params) === null || _b === void 0 ? void 0 : _b.values.tag);
                    for (const o of others) {
                        update.to(o).update(old => {
                            old.color.type = 'custom';
                        });
                    }
                }
            }
            update.to(this.ref).update(old => {
                old.color = values;
            });
            update.commit();
        };
        this.updateClip = (values) => {
            const update = this.plugin.state.data.build();
            const clipObjects = (0, state_1.getClipObjects)(values, this.plugin.canvas3d.boundingSphere);
            for (const r of this.allFilteredEntities) {
                update.to(r).update(old => {
                    if (old.type) {
                        old.type.params.clip.objects = clipObjects;
                    }
                    else {
                        old.clip.objects = clipObjects;
                    }
                });
            }
            for (const g of this.allGroups) {
                update.to(g).update(old => {
                    old.clip = values;
                });
            }
            update.commit();
        };
        this.updateLod = (values) => {
            state_1.MesoscaleState.set(this.plugin, { graphics: 'custom' });
            this.plugin.customState.graphicsMode = 'custom';
            const update = this.plugin.state.data.build();
            for (const r of this.allFilteredEntities) {
                update.to(r).update(old => {
                    if (old.type) {
                        old.type.params.lodLevels = values.lodLevels;
                        old.type.params.cellSize = values.cellSize;
                        old.type.params.batchSize = values.batchSize;
                        old.type.params.approximate = values.approximate;
                    }
                });
            }
            for (const g of this.allGroups) {
                update.to(g).update(old => {
                    old.lod = values;
                });
            }
            update.commit();
        };
        this.update = (props) => {
            this.plugin.state.data.build().to(this.ref).update(props);
        };
    }
    get groups() {
        var _a;
        return (0, state_1.getGroups)(this.plugin, (_a = this.cell.params) === null || _a === void 0 ? void 0 : _a.values.tag);
    }
    get allGroups() {
        var _a;
        const allGroups = (0, state_1.getAllGroups)(this.plugin, (_a = this.cell.params) === null || _a === void 0 ? void 0 : _a.values.tag);
        allGroups.push(this.cell);
        return allGroups;
    }
    get entities() {
        var _a;
        return (0, state_1.getEntities)(this.plugin, (_a = this.cell.params) === null || _a === void 0 ? void 0 : _a.values.tag);
    }
    get filteredEntities() {
        var _a;
        return (0, state_1.getFilteredEntities)(this.plugin, (_a = this.cell.params) === null || _a === void 0 ? void 0 : _a.values.tag, this.props.filter);
    }
    get allEntities() {
        var _a;
        return (0, state_1.getAllEntities)(this.plugin, (_a = this.cell.params) === null || _a === void 0 ? void 0 : _a.values.tag);
    }
    get allFilteredEntities() {
        var _a;
        return (0, state_1.getAllFilteredEntities)(this.plugin, (_a = this.cell.params) === null || _a === void 0 ? void 0 : _a.values.tag, this.props.filter);
    }
    renderColor() {
        var _a, _b, _c;
        const color = (_a = this.cell.params) === null || _a === void 0 ? void 0 : _a.values.color;
        if (((_b = this.cell.params) === null || _b === void 0 ? void 0 : _b.values.color.type) === 'uniform') {
            const style = {
                backgroundColor: color_1.Color.toStyle(color.value),
                minWidth: 32,
                width: 32,
                borderRight: `6px solid ${color_1.Color.toStyle(color_1.Color.lighten(color.value, color.lightness))}`
            };
            return (0, jsx_runtime_1.jsx)(common_1.Button, { style: style, onClick: this.toggleColor });
        }
        else if (((_c = this.cell.params) === null || _c === void 0 ? void 0 : _c.values.color.type) === 'generate') {
            const style = {
                minWidth: 32,
                width: 32,
                borderRight: `6px solid ${color_1.Color.toStyle(color_1.Color.lighten(color.value, color.lightness))}`
            };
            return (0, jsx_runtime_1.jsx)(common_1.IconButton, { style: style, svg: icons_1.BrushSvg, toggleState: false, small: true, onClick: this.toggleColor });
        }
        else {
            return (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.BrushSvg, toggleState: false, small: true, onClick: this.toggleColor });
        }
    }
    render() {
        var _a, _b, _c, _d, _e;
        if (this.allFilteredEntities.length === 0)
            return;
        const state = this.cell.state;
        const disabled = false;
        const groupLabel = this.cell.obj.label;
        const depth = this.props.depth;
        const colorValue = (_a = this.cell.params) === null || _a === void 0 ? void 0 : _a.values.color;
        const rootValue = (_b = this.cell.params) === null || _b === void 0 ? void 0 : _b.values.color;
        const clipValue = (_c = this.cell.params) === null || _c === void 0 ? void 0 : _c.values.clip;
        const lodValue = (_d = this.cell.params) === null || _d === void 0 ? void 0 : _d.values.lod;
        const isRoot = (_e = this.cell.params) === null || _e === void 0 ? void 0 : _e.values.root;
        const groups = this.groups;
        const entities = this.entities;
        const label = (0, jsx_runtime_1.jsx)(common_1.Button, { className: `msp-btn-tree-label`, noOverflow: true, disabled: disabled, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, onClick: this.showInfo, children: (0, jsx_runtime_1.jsx)("span", { title: groupLabel, children: groupLabel }) });
        const expand = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: state.isCollapsed ? icons_1.ArrowRightSvg : icons_1.ArrowDropDownSvg, flex: '20px', disabled: disabled, onClick: this.toggleExpanded, transparent: true, className: 'msp-no-hover-outline', style: { visibility: groups.length > 0 || entities.length > 0 ? 'visible' : 'hidden' } });
        const color = (entities.length > 0 && !isRoot) && this.renderColor();
        const root = (isRoot && this.allGroups.length > 1) && (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.BrushSvg, toggleState: false, disabled: disabled, small: true, onClick: this.toggleRoot });
        const clip = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.ContentCutSvg, toggleState: false, disabled: disabled, small: true, onClick: this.toggleClip });
        const visibility = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: state.isHidden ? icons_1.VisibilityOffOutlinedSvg : icons_1.VisibilityOutlinedSvg, toggleState: false, disabled: disabled, small: true, onClick: this.toggleVisible });
        const loadColorButton = (depth === 0) && (0, jsx_runtime_1.jsx)(states_1.ColorLoaderControls, { plugin: this.plugin });
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: `msp-flex-row`, style: { margin: `1px 5px 1px ${depth * 10 + 5}px` }, children: [expand, label, root || color, loadColorButton, clip, visibility] }), this.state.action === 'color' && (0, jsx_runtime_1.jsx)("div", { style: { marginRight: 5 }, className: 'msp-accent-offset', children: (0, jsx_runtime_1.jsx)(common_1.ControlGroup, { header: 'Color', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleColor, topRightIcon: icons_1.CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: state_1.ColorParams, values: colorValue, onChangeValues: this.updateColor }) }) }), this.state.action === 'clip' && (0, jsx_runtime_1.jsx)("div", { style: { marginRight: 5 }, className: 'msp-accent-offset', children: (0, jsx_runtime_1.jsxs)(common_1.ControlGroup, { header: 'Clip', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleClip, topRightIcon: icons_1.CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: state_1.SimpleClipParams, values: clipValue, onChangeValues: this.updateClip }), (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: state_1.LodParams, values: lodValue, onChangeValues: this.updateLod })] }) }), this.state.action === 'root' && (0, jsx_runtime_1.jsx)("div", { style: { marginRight: 5 }, className: 'msp-accent-offset', children: (0, jsx_runtime_1.jsx)(common_1.ControlGroup, { header: 'Color', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleRoot, topRightIcon: icons_1.CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: state_1.RootParams, values: rootValue, onChangeValues: this.updateRoot }) }) }), (!state.isCollapsed) && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [groups.map(c => {
                            return (0, jsx_runtime_1.jsx)(GroupNode, { filter: this.props.filter, cell: c, depth: depth + 1 }, c.transform.ref);
                        }), this.filteredEntities.map(c => {
                            return (0, jsx_runtime_1.jsx)(EntityNode, { cell: c, depth: depth + 1 }, c.transform.ref);
                        })] })] });
    }
}
exports.GroupNode = GroupNode;
class EntityNode extends Node {
    constructor() {
        super(...arguments);
        this.state = {
            action: undefined,
            isDisabled: false,
        };
        this.clipMapping = (0, state_1.createClipMapping)(this);
        this.toggleVisible = (e) => {
            e.preventDefault();
            commands_1.PluginCommands.State.ToggleVisibility(this.plugin, { state: this.props.cell.parent, ref: this.ref });
            e.currentTarget.blur();
        };
        this.toggleColor = (e) => {
            var _a;
            if (e === null || e === void 0 ? void 0 : e.ctrlKey) {
                this.updateLightness({ lightness: ((_a = this.lightnessValue) === null || _a === void 0 ? void 0 : _a.lightness) ? 0 : state_1.DimLightness });
                e.preventDefault();
            }
            else {
                this.setState({ action: this.state.action === 'color' ? undefined : 'color' });
            }
        };
        this.toggleClip = () => {
            this.setState({ action: this.state.action === 'clip' ? undefined : 'clip' });
        };
        this.highlight = (e) => {
            var _a, _b, _c, _d;
            e.preventDefault();
            (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.mark({ loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.RemoveHighlight);
            const repr = (_c = (_b = this.cell) === null || _b === void 0 ? void 0 : _b.obj) === null || _c === void 0 ? void 0 : _c.data.repr;
            if (repr) {
                (_d = this.plugin.canvas3d) === null || _d === void 0 ? void 0 : _d.mark({ repr, loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.Highlight);
            }
            e.currentTarget.blur();
        };
        this.clearHighlight = (e) => {
            var _a;
            e.preventDefault();
            (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.mark({ loci: loci_1.EveryLoci }, marker_action_1.MarkerAction.RemoveHighlight);
            e.currentTarget.blur();
        };
        this.toggleSelect = (e) => {
            var _a;
            e.preventDefault();
            const cell = this.cell;
            if (!(((_a = cell === null || cell === void 0 ? void 0 : cell.obj) === null || _a === void 0 ? void 0 : _a.data.sourceData) instanceof structure_1.Structure))
                return;
            const loci = structure_1.Structure.toStructureElementLoci(cell.obj.data.sourceData);
            this.plugin.managers.interactivity.lociSelects.toggle({ loci }, false);
        };
        this.center = (e) => {
            var _a;
            e.preventDefault();
            const cell = this.cell;
            if (!(((_a = cell === null || cell === void 0 ? void 0 : cell.obj) === null || _a === void 0 ? void 0 : _a.data.sourceData) instanceof structure_1.Structure))
                return;
            const loci = structure_1.Structure.toStructureElementLoci(cell.obj.data.sourceData);
            centerLoci(this.plugin, loci);
        };
        this.handleClick = (e) => {
            var _a, _b, _c, _d, _e, _f, _g;
            if (e.ctrlKey) {
                this.toggleSelect(e);
            }
            else {
                const d = (0, state_1.getEntityDescription)(this.plugin, this.cell);
                if (((_b = (_a = this.cell) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data.sourceData.state.models.length) !== 0) {
                    const repr = (_d = (_c = this.cell) === null || _c === void 0 ? void 0 : _c.obj) === null || _d === void 0 ? void 0 : _d.data.repr;
                    if (repr) {
                        // for fiber need to think how to handle.
                        const aloci = repr.getAllLoci()[0];
                        const locis = loci_1.Loci.normalize(aloci, 'chainInstances');
                        const nChain = aloci.structure.state.unitSymmetryGroups.length;
                        let index = state_1.MesoscaleState.get(this.plugin).index + 1;
                        if (index * nChain >= locis.elements.length)
                            index = 0;
                        const elems = locis.elements.slice(index * nChain, ((index + 1) * nChain)); // end index is not included
                        const loci = element_1.StructureElement.Loci(aloci.structure, elems);
                        const sphere = loci_1.Loci.getBoundingSphere(loci) || (0, geometry_1.Sphere3D)();
                        const state = this.plugin.state.behaviors;
                        const selections = state.select(mol_state_1.StateSelection.Generators.ofTransformer(camera_1.MesoFocusLoci));
                        const params = selections.length === 1 ? (_e = selections[0].obj) === null || _e === void 0 ? void 0 : _e.data.params : undefined;
                        if (!params.centerOnly) {
                            this.plugin.managers.camera.focusSphere(sphere, params);
                        }
                        else {
                            const snapshot = (_f = this.plugin.canvas3d) === null || _f === void 0 ? void 0 : _f.camera.getCenter(sphere.center);
                            (_g = this.plugin.canvas3d) === null || _g === void 0 ? void 0 : _g.requestCameraReset({ durationMs: params.durationMs, snapshot });
                        }
                        state_1.MesoscaleState.set(this.plugin, { index: index, focusInfo: `${d}` });
                    }
                }
                else {
                    this.center(e);
                    state_1.MesoscaleState.set(this.plugin, { focusInfo: `${d}` });
                }
            }
        };
        this.updateColor = ({ value }) => {
            const update = this.plugin.state.data.build();
            for (const g of this.groups) {
                update.to(g.transform.ref).update(old => {
                    old.color.type = 'custom';
                });
            }
            for (const r of this.roots) {
                update.to(r).update(old => {
                    old.color.type = 'custom';
                });
            }
            update.to(this.ref).update(old => {
                if (old.colorTheme) {
                    if (old.colorTheme.name === 'illustrative') {
                        old.colorTheme.params.style.params.value = value;
                    }
                    else {
                        old.colorTheme.params.value = value;
                    }
                }
                else if (old.coloring) {
                    old.coloring.params.color = value;
                }
            });
            update.commit();
        };
        this.updateIllustrative = (values) => {
            return this.plugin.build().to(this.ref).update(old => {
                if (old.colorTheme) {
                    if (old.colorTheme.name !== 'illustrative' && values.illustrative) {
                        old.colorTheme = { name: 'illustrative', params: { style: { name: 'uniform', params: { value: old.colorTheme.params.value, lightness: old.colorTheme.params.lightness } } } };
                    }
                    else if (old.colorTheme.name === 'illustrative' && !values.illustrative) {
                        old.colorTheme = { name: 'uniform', params: { value: old.colorTheme.params.style.params.value, lightness: old.colorTheme.params.style.params.lightness } };
                    }
                }
            }).commit();
        };
        this.updateLightness = (values) => {
            return this.plugin.build().to(this.ref).update(old => {
                if (old.colorTheme) {
                    if (old.colorTheme.name === 'illustrative') {
                        old.colorTheme.params.style.params.lightness = values.lightness;
                    }
                    else {
                        old.colorTheme.params.lightness = values.lightness;
                    }
                }
                else if (old.coloring) {
                    old.coloring.params.lightness = values.lightness;
                }
            }).commit();
        };
        this.updateOpacity = (values) => {
            return this.plugin.build().to(this.ref).update(old => {
                if (old.type) {
                    old.type.params.alpha = values.alpha;
                    old.type.params.xrayShaded = values.alpha < 1 ? 'inverted' : false;
                }
                else {
                    old.alpha = values.alpha;
                    old.xrayShaded = values.alpha < 1 ? true : false;
                }
            }).commit();
        };
        this.updateEmissive = (values) => {
            return this.plugin.build().to(this.ref).update(old => {
                if (old.type) {
                    old.type.params.emissive = values.emissive;
                }
                else {
                    old.emissive = values.emissive;
                }
            }).commit();
        };
        this.updateClip = (props) => {
            const params = this.cell.transform.params;
            const clip = params.type ? params.type.params.clip : params.clip;
            if (!param_definition_1.ParamDefinition.areEqual(clip_1.Clip.Params, clip, props)) {
                this.plugin.build().to(this.ref).update(old => {
                    if (old.type) {
                        old.type.params.clip = props;
                    }
                    else {
                        old.clip = props;
                    }
                }).commit();
            }
        };
        this.updateLod = (values) => {
            const params = this.cell.transform.params;
            if (!params.type)
                return;
            state_1.MesoscaleState.set(this.plugin, { graphics: 'custom' });
            this.plugin.customState.graphicsMode = 'custom';
            if (!(0, mol_util_1.deepEqual)(params.type.params.lodLevels, values.lodLevels) || params.type.params.cellSize !== values.cellSize || params.type.params.batchSize !== values.batchSize || params.type.params.approximate !== values.approximate) {
                this.plugin.build().to(this.ref).update(old => {
                    old.type.params.lodLevels = values.lodLevels;
                    old.type.params.cellSize = values.cellSize;
                    old.type.params.batchSize = values.batchSize;
                    old.type.params.approximate = values.approximate;
                }).commit();
            }
        };
        this.updatePattern = (values) => {
            return this.plugin.build().to(this.ref).update(old => {
                if (!old.type) {
                    old.bumpAmplitude = values.amplitude;
                    old.bumpFrequency = values.frequency / 10;
                }
            }).commit();
        };
    }
    get groups() {
        return this.plugin.state.data.select(mol_state_1.StateSelection.Generators.ofTransformer(state_1.MesoscaleGroup)
            .filter(c => { var _a, _b; return !!((_a = this.cell.transform.tags) === null || _a === void 0 ? void 0 : _a.includes((_b = c.params) === null || _b === void 0 ? void 0 : _b.values.tag)); }));
    }
    get colorValue() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        if ((_b = (_a = this.cell.transform.params) === null || _a === void 0 ? void 0 : _a.colorTheme) === null || _b === void 0 ? void 0 : _b.params.value) {
            return (_d = (_c = this.cell.transform.params) === null || _c === void 0 ? void 0 : _c.colorTheme) === null || _d === void 0 ? void 0 : _d.params.value;
        }
        else if (((_f = (_e = this.cell.transform.params) === null || _e === void 0 ? void 0 : _e.colorTheme) === null || _f === void 0 ? void 0 : _f.name) === 'illustrative') {
            return (_h = (_g = this.cell.transform.params) === null || _g === void 0 ? void 0 : _g.colorTheme) === null || _h === void 0 ? void 0 : _h.params.style.params.value;
        }
        else {
            return (_l = (_k = (_j = this.cell.transform.params) === null || _j === void 0 ? void 0 : _j.colorTheme) === null || _k === void 0 ? void 0 : _k.params.value) !== null && _l !== void 0 ? _l : (_o = (_m = this.cell.transform.params) === null || _m === void 0 ? void 0 : _m.coloring) === null || _o === void 0 ? void 0 : _o.params.color;
        }
    }
    get illustrativeValue() {
        var _a, _b;
        return {
            illustrative: (((_b = (_a = this.cell.transform.params) === null || _a === void 0 ? void 0 : _a.colorTheme) === null || _b === void 0 ? void 0 : _b.name) === 'illustrative')
        };
    }
    get lightnessValue() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        if (((_b = (_a = this.cell.transform.params) === null || _a === void 0 ? void 0 : _a.colorTheme) === null || _b === void 0 ? void 0 : _b.name) === 'illustrative') {
            return {
                lightness: (_e = (_d = (_c = this.cell.transform.params) === null || _c === void 0 ? void 0 : _c.colorTheme) === null || _d === void 0 ? void 0 : _d.params.style.params.lightness) !== null && _e !== void 0 ? _e : 0
            };
        }
        else {
            return {
                lightness: (_l = (_h = (_g = (_f = this.cell.transform.params) === null || _f === void 0 ? void 0 : _f.colorTheme) === null || _g === void 0 ? void 0 : _g.params.lightness) !== null && _h !== void 0 ? _h : (_k = (_j = this.cell.transform.params) === null || _j === void 0 ? void 0 : _j.coloring) === null || _k === void 0 ? void 0 : _k.params.lightness) !== null && _l !== void 0 ? _l : 0
            };
        }
    }
    get opacityValue() {
        var _a, _b, _c, _d, _e;
        return {
            alpha: (_e = (_c = (_b = (_a = this.cell.transform.params) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.params.alpha) !== null && _c !== void 0 ? _c : (_d = this.cell.transform.params) === null || _d === void 0 ? void 0 : _d.alpha) !== null && _e !== void 0 ? _e : 1
        };
    }
    get emissiveValue() {
        var _a, _b, _c, _d, _e;
        return {
            emissive: (_e = (_c = (_b = (_a = this.cell.transform.params) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.params.emissive) !== null && _c !== void 0 ? _c : (_d = this.cell.transform.params) === null || _d === void 0 ? void 0 : _d.emissive) !== null && _e !== void 0 ? _e : 0
        };
    }
    get clipValue() {
        var _a, _b;
        return (_b = (_a = this.cell.transform.params.type) === null || _a === void 0 ? void 0 : _a.params.clip) !== null && _b !== void 0 ? _b : this.cell.transform.params.clip;
    }
    get lodValue() {
        var _a, _b;
        const p = (_b = (_a = this.cell.transform.params) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.params;
        if (!p)
            return;
        return {
            lodLevels: p.lodLevels,
            cellSize: p.cellSize,
            batchSize: p.batchSize,
            approximate: p.approximate,
        };
    }
    get patternValue() {
        const p = this.cell.transform.params;
        if (p.type)
            return;
        return {
            amplitude: p.bumpAmplitude,
            frequency: p.bumpFrequency * 10,
        };
    }
    render() {
        const cellState = this.cell.state;
        const disabled = this.cell.status !== 'error' && this.cell.status !== 'ok';
        const depth = this.props.depth;
        const colorValue = this.colorValue;
        const lightnessValue = this.lightnessValue;
        const illustrativeValue = this.illustrativeValue;
        const opacityValue = this.opacityValue;
        const emissiveValue = this.emissiveValue;
        const lodValue = this.lodValue;
        const patternValue = this.patternValue;
        const l = (0, state_1.getEntityLabel)(this.plugin, this.cell);
        const label = (0, jsx_runtime_1.jsx)(common_1.Button, { className: `msp-btn-tree-label msp-type-class-${this.cell.obj.type.typeClass}`, noOverflow: true, disabled: disabled, onClick: this.handleClick, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, children: (0, jsx_runtime_1.jsx)("span", { title: l, children: l }) });
        const color = colorValue !== undefined && (0, jsx_runtime_1.jsx)(common_1.Button, { style: { backgroundColor: color_1.Color.toStyle(colorValue), minWidth: 32, width: 32, borderRight: `6px solid ${color_1.Color.toStyle(color_1.Color.lighten(colorValue, (lightnessValue === null || lightnessValue === void 0 ? void 0 : lightnessValue.lightness) || 0))}` }, onClick: this.toggleColor });
        const clip = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.ContentCutSvg, toggleState: false, disabled: disabled, small: true, onClick: this.toggleClip });
        const visibility = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: cellState.isHidden ? icons_1.VisibilityOffOutlinedSvg : icons_1.VisibilityOutlinedSvg, toggleState: false, disabled: disabled, small: true, onClick: this.toggleVisible });
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: `msp-flex-row`, style: { margin: `1px 5px 1px ${depth * 10 + 5}px` }, children: [label, color, clip, visibility] }), this.state.action === 'color' && colorValue !== void 0 && (0, jsx_runtime_1.jsx)("div", { style: { marginRight: 5 }, className: 'msp-accent-offset', children: (0, jsx_runtime_1.jsxs)(common_1.ControlGroup, { header: 'Color', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleColor, topRightIcon: icons_1.CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: [(0, jsx_runtime_1.jsx)(color_2.CombinedColorControl, { param: state_1.ColorValueParam, value: colorValue !== null && colorValue !== void 0 ? colorValue : (0, color_1.Color)(0xFFFFFF), onChange: this.updateColor, name: 'color', hideNameRow: true }), (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: state_1.IllustrativeParams, values: illustrativeValue, onChangeValues: this.updateIllustrative }), (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: state_1.LightnessParams, values: lightnessValue, onChangeValues: this.updateLightness }), (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: state_1.OpacityParams, values: opacityValue, onChangeValues: this.updateOpacity }), (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: state_1.EmissiveParams, values: emissiveValue, onChangeValues: this.updateEmissive }), patternValue && (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: state_1.PatternParams, values: patternValue, onChangeValues: this.updatePattern })] }) }), this.state.action === 'clip' && (0, jsx_runtime_1.jsx)("div", { style: { marginRight: 5 }, className: 'msp-accent-offset', children: (0, jsx_runtime_1.jsxs)(common_1.ControlGroup, { header: 'Clip', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleClip, topRightIcon: icons_1.CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterMappingControl, { mapping: this.clipMapping }), lodValue && (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: state_1.LodParams, values: lodValue, onChangeValues: this.updateLod })] }) })] });
    }
}
exports.EntityNode = EntityNode;
