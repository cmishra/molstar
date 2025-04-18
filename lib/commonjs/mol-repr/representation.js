"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Representation = exports.RepresentationRegistry = exports.EmptyRepresentationProvider = exports.RepresentationProvider = void 0;
const param_definition_1 = require("../mol-util/param-definition");
const theme_1 = require("../mol-theme/theme");
const rxjs_1 = require("rxjs");
const mol_task_1 = require("../mol-task");
const marker_action_1 = require("../mol-util/marker-action");
const loci_1 = require("../mol-model/loci");
const overpaint_1 = require("../mol-theme/overpaint");
const transparency_1 = require("../mol-theme/transparency");
const linear_algebra_1 = require("../mol-math/linear-algebra");
const util_1 = require("./util");
const base_1 = require("../mol-geo/geometry/base");
const visual_1 = require("./visual");
const clipping_1 = require("../mol-theme/clipping");
const set_1 = require("../mol-util/set");
const util_2 = require("../mol-data/util");
const substance_1 = require("../mol-theme/substance");
const emissive_1 = require("../mol-theme/emissive");
var RepresentationProvider;
(function (RepresentationProvider) {
    function getDefaultParams(r, ctx, data) {
        return param_definition_1.ParamDefinition.getDefaultValues(r.getParams(ctx, data));
    }
    RepresentationProvider.getDefaultParams = getDefaultParams;
})(RepresentationProvider || (exports.RepresentationProvider = RepresentationProvider = {}));
exports.EmptyRepresentationProvider = {
    name: '',
    label: '',
    description: '',
    factory: () => Representation.Empty,
    getParams: () => ({}),
    defaultValues: {},
    defaultColorTheme: { name: '' },
    defaultSizeTheme: { name: '' },
    isApplicable: () => true
};
function getTypes(list) {
    return list.map(e => [e.name, e.provider.label]);
}
class RepresentationRegistry {
    get default() { return this._list[0]; }
    get types() { return getTypes(this._list); }
    constructor() {
        this._list = [];
        this._map = new Map();
        this._name = new Map();
    }
    ;
    add(provider) {
        if (this._map.has(provider.name)) {
            throw new Error(`${provider.name} already registered.`);
        }
        this._list.push({ name: provider.name, provider });
        this._map.set(provider.name, provider);
        this._name.set(provider, provider.name);
    }
    getName(provider) {
        if (!this._name.has(provider))
            throw new Error(`'${provider.label}' is not a registered represenatation provider.`);
        return this._name.get(provider);
    }
    remove(provider) {
        const name = provider.name;
        this._list.splice(this._list.findIndex(e => e.name === name), 1);
        const p = this._map.get(name);
        if (p) {
            this._map.delete(name);
            this._name.delete(p);
        }
    }
    get(name) {
        return this._map.get(name) || exports.EmptyRepresentationProvider;
    }
    get list() {
        return this._list;
    }
    getApplicableList(data) {
        return this._list.filter(e => e.provider.isApplicable(data));
    }
    getApplicableTypes(data) {
        return getTypes(this.getApplicableList(data));
    }
    clear() {
        this._list.length = 0;
        this._map.clear();
        this._name.clear();
    }
}
exports.RepresentationRegistry = RepresentationRegistry;
var Representation;
(function (Representation) {
    let Loci;
    (function (Loci) {
        function areEqual(a, b) {
            return a.repr === b.repr && loci_1.Loci.areEqual(a.loci, b.loci);
        }
        Loci.areEqual = areEqual;
        function isEmpty(a) {
            return loci_1.Loci.isEmpty(a.loci);
        }
        Loci.isEmpty = isEmpty;
        Loci.Empty = { loci: loci_1.EmptyLoci };
    })(Loci = Representation.Loci || (Representation.Loci = {}));
    function createState() {
        return {
            visible: true,
            alphaFactor: 1,
            pickable: true,
            colorOnly: false,
            syncManually: false,
            transform: linear_algebra_1.Mat4.identity(),
            overpaint: overpaint_1.Overpaint.Empty,
            transparency: transparency_1.Transparency.Empty,
            emissive: emissive_1.Emissive.Empty,
            substance: substance_1.Substance.Empty,
            clipping: clipping_1.Clipping.Empty,
            themeStrength: { overpaint: 1, transparency: 1, emissive: 1, substance: 1 },
            markerActions: marker_action_1.MarkerActions.All
        };
    }
    Representation.createState = createState;
    function updateState(state, update) {
        if (update.visible !== undefined)
            state.visible = update.visible;
        if (update.alphaFactor !== undefined)
            state.alphaFactor = update.alphaFactor;
        if (update.pickable !== undefined)
            state.pickable = update.pickable;
        if (update.colorOnly !== undefined)
            state.colorOnly = update.colorOnly;
        if (update.overpaint !== undefined)
            state.overpaint = update.overpaint;
        if (update.transparency !== undefined)
            state.transparency = update.transparency;
        if (update.emissive !== undefined)
            state.emissive = update.emissive;
        if (update.substance !== undefined)
            state.substance = update.substance;
        if (update.clipping !== undefined)
            state.clipping = update.clipping;
        if (update.themeStrength !== undefined)
            state.themeStrength = update.themeStrength;
        if (update.syncManually !== undefined)
            state.syncManually = update.syncManually;
        if (update.transform !== undefined)
            linear_algebra_1.Mat4.copy(state.transform, update.transform);
        if (update.markerActions !== undefined)
            state.markerActions = update.markerActions;
    }
    Representation.updateState = updateState;
    Representation.StateBuilder = { create: createState, update: updateState };
    Representation.Empty = {
        label: '', groupCount: 0, renderObjects: [], geometryVersion: -1, props: {}, params: {}, updated: new rxjs_1.Subject(), state: createState(), theme: theme_1.Theme.createEmpty(),
        createOrUpdate: () => mol_task_1.Task.constant('', undefined),
        setState: () => { },
        setTheme: () => { },
        getLoci: () => loci_1.EmptyLoci,
        getAllLoci: () => [],
        eachLocation: () => { },
        mark: () => false,
        destroy: () => { }
    };
    class GeometryState {
        constructor() {
            this.curr = new Set();
            this.next = new Set();
            this._version = -1;
        }
        get version() {
            return this._version;
        }
        add(id, version) {
            this.next.add((0, util_2.cantorPairing)(id, version));
        }
        snapshot() {
            if (!set_1.SetUtils.areEqual(this.curr, this.next)) {
                this._version += 1;
            }
            [this.curr, this.next] = [this.next, this.curr];
            this.next.clear();
        }
    }
    Representation.GeometryState = GeometryState;
    function createMulti(label, ctx, getParams, stateBuilder, reprDefs) {
        let version = 0;
        const updated = new rxjs_1.Subject();
        const geometryState = new GeometryState();
        const currentState = stateBuilder.create();
        let currentTheme = theme_1.Theme.createEmpty();
        let currentParams;
        let currentProps;
        let currentData;
        const reprMap = {};
        const reprList = Object.keys(reprDefs).map((name, i) => {
            reprMap[i] = name;
            const repr = reprDefs[name](ctx, getParams);
            repr.setState(currentState);
            return repr;
        });
        return {
            label,
            updated,
            get groupCount() {
                let groupCount = 0;
                if (currentProps) {
                    const { visuals } = currentProps;
                    for (let i = 0, il = reprList.length; i < il; ++i) {
                        if (!visuals || visuals.includes(reprMap[i])) {
                            groupCount += reprList[i].groupCount;
                        }
                    }
                }
                return groupCount;
            },
            get renderObjects() {
                const renderObjects = [];
                if (currentProps) {
                    const { visuals } = currentProps;
                    for (let i = 0, il = reprList.length; i < il; ++i) {
                        if (!visuals || visuals.includes(reprMap[i])) {
                            renderObjects.push(...reprList[i].renderObjects);
                        }
                    }
                }
                return renderObjects;
            },
            get geometryVersion() { return geometryState.version; },
            get props() { return currentProps; },
            get params() { return currentParams; },
            createOrUpdate: (props = {}, data) => {
                if (data && data !== currentData) {
                    currentParams = getParams(ctx, data);
                    currentData = data;
                    if (!currentProps)
                        currentProps = param_definition_1.ParamDefinition.getDefaultValues(currentParams);
                }
                const qualityProps = (0, util_1.getQualityProps)(Object.assign({}, currentProps, props), currentData);
                Object.assign(currentProps, props, qualityProps);
                const { visuals } = currentProps;
                return mol_task_1.Task.create(`Creating or updating '${label}' representation`, async (runtime) => {
                    for (let i = 0, il = reprList.length; i < il; ++i) {
                        if (!visuals || visuals.includes(reprMap[i])) {
                            await reprList[i].createOrUpdate(currentProps, currentData).runInContext(runtime);
                        }
                        geometryState.add(i, reprList[i].geometryVersion);
                    }
                    geometryState.snapshot();
                    updated.next(version++);
                });
            },
            get state() { return currentState; },
            get theme() { return currentTheme; },
            getLoci: (pickingId) => {
                const { visuals } = currentProps;
                for (let i = 0, il = reprList.length; i < il; ++i) {
                    if (!visuals || visuals.includes(reprMap[i])) {
                        const loci = reprList[i].getLoci(pickingId);
                        if (!(0, loci_1.isEmptyLoci)(loci))
                            return loci;
                    }
                }
                return loci_1.EmptyLoci;
            },
            getAllLoci: () => {
                const loci = [];
                const { visuals } = currentProps;
                for (let i = 0, il = reprList.length; i < il; ++i) {
                    if (!visuals || visuals.includes(reprMap[i])) {
                        loci.push(...reprList[i].getAllLoci());
                    }
                }
                return loci;
            },
            eachLocation: (cb) => {
                const { visuals } = currentProps;
                for (let i = 0, il = reprList.length; i < il; ++i) {
                    if (!visuals || visuals.includes(reprMap[i])) {
                        reprList[i].eachLocation(cb);
                    }
                }
            },
            mark: (loci, action) => {
                let marked = false;
                for (let i = 0, il = reprList.length; i < il; ++i) {
                    marked = reprList[i].mark(loci, action) || marked;
                }
                return marked;
            },
            setState: (state) => {
                stateBuilder.update(currentState, state);
                for (let i = 0, il = reprList.length; i < il; ++i) {
                    reprList[i].setState(state); // only set the new (partial) state
                }
            },
            setTheme: (theme) => {
                currentTheme = theme;
                for (let i = 0, il = reprList.length; i < il; ++i) {
                    reprList[i].setTheme(theme);
                }
            },
            destroy() {
                for (let i = 0, il = reprList.length; i < il; ++i) {
                    reprList[i].destroy();
                }
            }
        };
    }
    Representation.createMulti = createMulti;
    function fromRenderObject(label, renderObject) {
        let version = 0;
        const updated = new rxjs_1.Subject();
        const geometryState = new GeometryState();
        const currentState = Representation.createState();
        const currentTheme = theme_1.Theme.createEmpty();
        const currentParams = param_definition_1.ParamDefinition.clone(base_1.BaseGeometry.Params);
        const currentProps = param_definition_1.ParamDefinition.getDefaultValues(base_1.BaseGeometry.Params);
        return {
            label,
            updated,
            get groupCount() { return renderObject.values.uGroupCount.ref.value; },
            get renderObjects() { return [renderObject]; },
            get geometryVersion() { return geometryState.version; },
            get props() { return currentProps; },
            get params() { return currentParams; },
            createOrUpdate: (props = {}) => {
                const qualityProps = (0, util_1.getQualityProps)(Object.assign({}, currentProps, props));
                Object.assign(currentProps, props, qualityProps);
                return mol_task_1.Task.create(`Updating '${label}' representation`, async (runtime) => {
                    // TODO
                    geometryState.add(0, renderObject.id);
                    geometryState.snapshot();
                    updated.next(version++);
                });
            },
            get state() { return currentState; },
            get theme() { return currentTheme; },
            getLoci: () => {
                // TODO
                return loci_1.EmptyLoci;
            },
            getAllLoci: () => {
                // TODO
                return [];
            },
            eachLocation: () => {
                // TODO
            },
            mark: (loci, action) => {
                // TODO
                return false;
            },
            setState: (state) => {
                if (state.visible !== undefined)
                    visual_1.Visual.setVisibility(renderObject, state.visible);
                if (state.alphaFactor !== undefined)
                    visual_1.Visual.setAlphaFactor(renderObject, state.alphaFactor);
                if (state.pickable !== undefined)
                    visual_1.Visual.setPickable(renderObject, state.pickable);
                if (state.colorOnly !== undefined)
                    visual_1.Visual.setColorOnly(renderObject, state.colorOnly);
                if (state.overpaint !== undefined) {
                    // TODO
                }
                if (state.transparency !== undefined) {
                    // TODO
                }
                if (state.emissive !== undefined) {
                    // TODO
                }
                if (state.substance !== undefined) {
                    // TODO
                }
                if (state.clipping !== undefined) {
                    // TODO
                }
                if (state.themeStrength !== undefined)
                    visual_1.Visual.setThemeStrength(renderObject, state.themeStrength);
                if (state.transform !== undefined)
                    visual_1.Visual.setTransform(renderObject, state.transform);
                Representation.updateState(currentState, state);
            },
            setTheme: () => { },
            destroy() { }
        };
    }
    Representation.fromRenderObject = fromRenderObject;
})(Representation || (exports.Representation = Representation = {}));
