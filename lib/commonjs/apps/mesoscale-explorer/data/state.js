"use strict";
/**
 * Copyright (c) 2023-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MesoscaleState = exports.MesoscaleStateObject = exports.MesoscaleStateParams = exports.MesoscaleGroup = exports.MesoscaleGroupObject = exports.MesoscaleGroupParams = exports.SimpleClipParams = exports.LodParams = exports.StyleParams = exports.PatternParams = exports.celShaded = exports.EmissiveParams = exports.OpacityParams = exports.IllustrativeParams = exports.DimLightness = exports.LightnessParams = exports.RootParams = exports.ColorValueParam = exports.ColorParams = void 0;
exports.getDistinctGroupColors = getDistinctGroupColors;
exports.getDistinctBaseColors = getDistinctBaseColors;
exports.getClipObjects = getClipObjects;
exports.createClipMapping = createClipMapping;
exports.getMesoscaleGroupParams = getMesoscaleGroupParams;
exports.getLodLevels = getLodLevels;
exports.getGraphicsModeProps = getGraphicsModeProps;
exports.setGraphicsCanvas3DProps = setGraphicsCanvas3DProps;
exports.getRoots = getRoots;
exports.getGroups = getGroups;
exports.getAllGroups = getAllGroups;
exports.getAllLeafGroups = getAllLeafGroups;
exports.getEntities = getEntities;
exports.getFilteredEntities = getFilteredEntities;
exports.getAllEntities = getAllEntities;
exports.getAllFilteredEntities = getAllFilteredEntities;
exports.getEveryEntity = getEveryEntity;
exports.getEntityLabel = getEntityLabel;
exports.getCellDescription = getCellDescription;
exports.getEntityDescription = getEntityDescription;
exports.updateStyle = updateStyle;
exports.updateColors = updateColors;
exports.expandAllGroups = expandAllGroups;
const objects_1 = require("../../../mol-plugin-state/objects");
const param_definition_1 = require("../../../mol-util/param-definition");
const mol_task_1 = require("../../../mol-task");
const color_1 = require("../../../mol-util/color");
const spheres_1 = require("../../../mol-geo/geometry/spheres/spheres");
const clip_1 = require("../../../mol-util/clip");
const string_1 = require("../../../mol-util/string");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const param_mapping_1 = require("../../../mol-util/param-mapping");
const distinct_1 = require("../../../mol-util/color/distinct");
const hcl_1 = require("../../../mol-util/color/spaces/hcl");
const mol_state_1 = require("../../../mol-state");
const representation_1 = require("../../../mol-plugin-state/transforms/representation");
const type_helpers_1 = require("../../../mol-util/type-helpers");
const interpolate_1 = require("../../../mol-math/interpolate");
const material_1 = require("../../../mol-util/material");
function getHueRange(hue, variability) {
    let min = hue - variability;
    const minOverflow = (min < 0 ? -min : 0);
    let max = hue + variability;
    if (max > 360)
        min -= max - 360;
    max += minOverflow;
    return [Math.max(0, min), Math.min(360, max)];
}
function getGrayscaleColors(count, luminance, variability) {
    const out = [];
    for (let i = 0; i < count; ++i) {
        const l = (0, interpolate_1.saturate)(luminance / 100);
        const v = (0, interpolate_1.saturate)(variability / 180) * Math.random();
        const s = Math.random() > 0.5 ? 1 : -1;
        const d = Math.abs(l + s * v) % 1;
        out[i] = color_1.Color.fromNormalizedRgb(d, d, d);
    }
    return out;
}
function getDistinctGroupColors(count, color, variability, shift, props) {
    const hcl = hcl_1.Hcl.fromColor((0, hcl_1.Hcl)(), color);
    if (isNaN(hcl[0])) {
        return getGrayscaleColors(count, hcl[2], variability);
    }
    if (count === 1) {
        hcl[1] = 65;
        hcl[2] = 55;
        return [hcl_1.Hcl.toColor(hcl)];
    }
    const colors = (0, distinct_1.distinctColors)(count, {
        hue: getHueRange(hcl[0], variability),
        chroma: [30, 100],
        luminance: [50, 100],
        clusteringStepCount: 0,
        minSampleCount: 1000,
        sampleCountFactor: 100,
        sort: 'none',
        ...props,
    });
    if (shift !== 0) {
        const offset = Math.floor(shift / 100 * count);
        return [...colors.slice(offset), ...colors.slice(0, offset)];
    }
    else {
        return colors;
    }
}
const Colors = [0x377eb8, 0xe41a1c, 0x4daf4a, 0x984ea3, 0xff7f00, 0xffff33, 0xa65628, 0xf781bf];
function getDistinctBaseColors(count, shift, props) {
    let colors;
    if (count <= Colors.length) {
        colors = Colors.slice(0, count).map(e => Array.isArray(e) ? e[0] : e);
    }
    else {
        colors = (0, distinct_1.distinctColors)(count, {
            hue: [1, 360],
            chroma: [25, 100],
            luminance: [30, 100],
            clusteringStepCount: 0,
            minSampleCount: 1000,
            sampleCountFactor: 100,
            sort: 'none',
            ...props,
        });
    }
    if (shift !== 0) {
        const offset = Math.floor(shift / 100 * count);
        return [...colors.slice(offset), ...colors.slice(0, offset)];
    }
    else {
        return colors;
    }
}
exports.ColorParams = {
    type: param_definition_1.ParamDefinition.Select('generate', param_definition_1.ParamDefinition.arrayToOptions(['generate', 'uniform', 'custom'])),
    illustrative: param_definition_1.ParamDefinition.Boolean(false, { description: 'Illustrative style', hideIf: p => p.type === 'custom' }),
    value: param_definition_1.ParamDefinition.Color((0, color_1.Color)(0xFFFFFF), { hideIf: p => p.type === 'custom' }),
    variability: param_definition_1.ParamDefinition.Numeric(20, { min: 1, max: 180, step: 1 }, { hideIf: p => p.type !== 'generate' }),
    shift: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 100, step: 1 }, { hideIf: p => !p.type.includes('generate') }),
    lightness: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }, { hideIf: p => p.type === 'custom' }),
    alpha: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }, { hideIf: p => p.type === 'custom' }),
    emissive: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 1, step: 0.01 }, { hideIf: p => p.type === 'custom' }),
};
exports.ColorValueParam = param_definition_1.ParamDefinition.Color((0, color_1.Color)(0xFFFFFF));
exports.RootParams = {
    type: param_definition_1.ParamDefinition.Select('custom', param_definition_1.ParamDefinition.arrayToOptions(['group-generate', 'group-uniform', 'generate', 'uniform', 'custom'])),
    illustrative: param_definition_1.ParamDefinition.Boolean(false, { description: 'Illustrative style', hideIf: p => p.type === 'custom' }),
    value: param_definition_1.ParamDefinition.Color((0, color_1.Color)(0xFFFFFF), { hideIf: p => p.type !== 'uniform' }),
    variability: param_definition_1.ParamDefinition.Numeric(20, { min: 1, max: 180, step: 1 }, { hideIf: p => p.type !== 'group-generate' }),
    shift: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 100, step: 1 }, { hideIf: p => !p.type.includes('generate') }),
    lightness: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }, { hideIf: p => p.type === 'custom' }),
    alpha: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }, { hideIf: p => p.type === 'custom' }),
    emissive: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 1, step: 0.01 }, { hideIf: p => p.type === 'custom' }),
};
exports.LightnessParams = {
    lightness: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }),
};
exports.DimLightness = 6;
exports.IllustrativeParams = {
    illustrative: param_definition_1.ParamDefinition.Boolean(false, { description: 'Illustrative style' }),
};
exports.OpacityParams = {
    alpha: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }),
};
exports.EmissiveParams = {
    emissive: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 1, step: 0.01 }),
};
exports.celShaded = {
    celShaded: param_definition_1.ParamDefinition.Boolean(false, { description: 'Cel Shading light for stylized rendering of representations' })
};
exports.PatternParams = {
    frequency: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }),
    amplitude: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }),
};
exports.StyleParams = {
    ignoreLight: param_definition_1.ParamDefinition.Boolean(false, { description: 'Ignore light for stylized rendering of representations' }),
    materialStyle: material_1.Material.getParam(),
    celShaded: param_definition_1.ParamDefinition.Boolean(false, { description: 'Cel Shading light for stylized rendering of representations' }),
};
exports.LodParams = {
    lodLevels: spheres_1.Spheres.Params.lodLevels,
    cellSize: spheres_1.Spheres.Params.cellSize,
    batchSize: spheres_1.Spheres.Params.batchSize,
    approximate: spheres_1.Spheres.Params.approximate,
};
exports.SimpleClipParams = {
    type: param_definition_1.ParamDefinition.Select('none', param_definition_1.ParamDefinition.objectToOptions(clip_1.Clip.Type, t => (0, string_1.stringToWords)(t))),
    invert: param_definition_1.ParamDefinition.Boolean(false),
    position: param_definition_1.ParamDefinition.Group({
        x: param_definition_1.ParamDefinition.Numeric(0, { min: -100, max: 100, step: 1 }, { immediateUpdate: true }),
        y: param_definition_1.ParamDefinition.Numeric(0, { min: -100, max: 100, step: 1 }, { immediateUpdate: true }),
        z: param_definition_1.ParamDefinition.Numeric(0, { min: -100, max: 100, step: 1 }, { immediateUpdate: true }),
    }, { hideIf: g => g.type === 'none', isExpanded: true }),
    rotation: param_definition_1.ParamDefinition.Group({
        axis: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(1, 0, 0)),
        angle: param_definition_1.ParamDefinition.Numeric(0, { min: -180, max: 180, step: 1 }, { immediateUpdate: true }),
    }, { hideIf: g => g.type === 'none', isExpanded: true }),
    scale: param_definition_1.ParamDefinition.Group({
        x: param_definition_1.ParamDefinition.Numeric(100, { min: 0, max: 100, step: 1 }, { immediateUpdate: true }),
        y: param_definition_1.ParamDefinition.Numeric(100, { min: 0, max: 100, step: 1 }, { immediateUpdate: true }),
        z: param_definition_1.ParamDefinition.Numeric(100, { min: 0, max: 100, step: 1 }, { immediateUpdate: true }),
    }, { hideIf: g => ['none', 'plane'].includes(g.type), isExpanded: true }),
};
function getClipObjects(values, boundingSphere) {
    const { center, radius } = boundingSphere;
    const position = linear_algebra_1.Vec3.clone(center);
    linear_algebra_1.Vec3.add(position, position, linear_algebra_1.Vec3.create(radius * values.position.x / 100, radius * values.position.y / 100, radius * values.position.z / 100));
    const scale = linear_algebra_1.Vec3.create(values.scale.x, values.scale.y, values.scale.z);
    linear_algebra_1.Vec3.scale(scale, scale, 2 * radius / 100);
    return [{
            type: values.type,
            invert: values.invert,
            position,
            scale,
            rotation: values.rotation,
            transform: linear_algebra_1.Mat4.identity(),
        }];
}
function createClipMapping(node) {
    return (0, param_mapping_1.ParamMapping)({
        params: exports.SimpleClipParams,
        target: (ctx) => {
            return node.clipValue;
        }
    })({
        values(props, ctx) {
            if (!props || props.objects.length === 0) {
                return {
                    type: 'none',
                    invert: false,
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { axis: linear_algebra_1.Vec3.create(1, 0, 0), angle: 0 },
                    scale: { x: 100, y: 100, z: 100 },
                };
            }
            const { center, radius } = node.plugin.canvas3d.boundingSphere;
            const { invert, position, scale, rotation, type } = props.objects[0];
            const p = linear_algebra_1.Vec3.clone(position);
            linear_algebra_1.Vec3.sub(p, p, center);
            linear_algebra_1.Vec3.scale(p, p, 100 / radius);
            linear_algebra_1.Vec3.round(p, p);
            const s = linear_algebra_1.Vec3.clone(scale);
            linear_algebra_1.Vec3.scale(s, s, 100 / radius / 2);
            linear_algebra_1.Vec3.round(s, s);
            return {
                type,
                invert,
                position: { x: p[0], y: p[1], z: p[2] },
                rotation,
                scale: { x: s[0], y: s[1], z: s[2] },
            };
        },
        update: (s, props) => {
            if (!props)
                return;
            const clipObjects = getClipObjects(s, node.plugin.canvas3d.boundingSphere);
            props.objects = clipObjects;
        },
        apply: async (props, ctx) => {
            if (props)
                node.updateClip(props);
        }
    });
}
exports.MesoscaleGroupParams = {
    root: param_definition_1.ParamDefinition.Value(false, { isHidden: true }),
    index: param_definition_1.ParamDefinition.Value(-1, { isHidden: true }),
    tag: param_definition_1.ParamDefinition.Value('', { isHidden: true }),
    label: param_definition_1.ParamDefinition.Value('', { isHidden: true }),
    description: param_definition_1.ParamDefinition.Value('', { isHidden: true }),
    hidden: param_definition_1.ParamDefinition.Boolean(false),
    color: param_definition_1.ParamDefinition.Group(exports.RootParams),
    lightness: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }),
    alpha: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }),
    emissive: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 1, step: 0.01 }),
    lod: param_definition_1.ParamDefinition.Group(exports.LodParams),
    clip: param_definition_1.ParamDefinition.Group(exports.SimpleClipParams),
};
class MesoscaleGroupObject extends objects_1.PluginStateObject.Create({ name: 'Mesoscale Group', typeClass: 'Object' }) {
}
exports.MesoscaleGroupObject = MesoscaleGroupObject;
exports.MesoscaleGroup = objects_1.PluginStateTransform.BuiltIn({
    name: 'mesoscale-group',
    display: { name: 'Mesoscale Group' },
    from: [objects_1.PluginStateObject.Root, MesoscaleGroupObject],
    to: MesoscaleGroupObject,
    params: exports.MesoscaleGroupParams,
})({
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Apply Mesoscale Group', async () => {
            return new MesoscaleGroupObject({}, { label: params.label, description: params.description });
        });
    },
});
function getMesoscaleGroupParams(graphicsMode) {
    const groupParams = param_definition_1.ParamDefinition.getDefaultValues(exports.MesoscaleGroupParams);
    if (graphicsMode === 'custom')
        return groupParams;
    return {
        ...groupParams,
        lod: {
            ...groupParams.lod,
            ...getGraphicsModeProps(graphicsMode),
        }
    };
}
function getLodLevels(graphicsMode) {
    switch (graphicsMode) {
        case 'performance':
            return [
                { minDistance: 1, maxDistance: 300, overlap: 0, stride: 1, scaleBias: 1 },
                { minDistance: 300, maxDistance: 2000, overlap: 0, stride: 40, scaleBias: 3 },
                { minDistance: 2000, maxDistance: 6000, overlap: 0, stride: 150, scaleBias: 3 },
                { minDistance: 6000, maxDistance: 10000000, overlap: 0, stride: 300, scaleBias: 2.5 },
            ];
        case 'balanced':
            return [
                { minDistance: 1, maxDistance: 500, overlap: 0, stride: 1, scaleBias: 1 },
                { minDistance: 500, maxDistance: 2000, overlap: 0, stride: 15, scaleBias: 3 },
                { minDistance: 2000, maxDistance: 6000, overlap: 0, stride: 70, scaleBias: 2.7 },
                { minDistance: 6000, maxDistance: 10000000, overlap: 0, stride: 200, scaleBias: 2.5 },
            ];
        case 'quality':
            return [
                { minDistance: 1, maxDistance: 1000, overlap: 0, stride: 1, scaleBias: 1 },
                { minDistance: 1000, maxDistance: 4000, overlap: 0, stride: 10, scaleBias: 3 },
                { minDistance: 4000, maxDistance: 10000, overlap: 0, stride: 50, scaleBias: 2.7 },
                { minDistance: 10000, maxDistance: 10000000, overlap: 0, stride: 200, scaleBias: 2.3 },
            ];
        case 'ultra':
            return [
                { minDistance: 1, maxDistance: 5000, overlap: 0, stride: 1, scaleBias: 1 },
                { minDistance: 5000, maxDistance: 10000, overlap: 0, stride: 10, scaleBias: 3 },
                { minDistance: 10000, maxDistance: 30000, overlap: 0, stride: 50, scaleBias: 2.5 },
                { minDistance: 30000, maxDistance: 10000000, overlap: 0, stride: 200, scaleBias: 2 },
            ];
        default:
            (0, type_helpers_1.assertUnreachable)(graphicsMode);
    }
}
function getGraphicsModeProps(graphicsMode) {
    return {
        lodLevels: getLodLevels(graphicsMode),
        approximate: graphicsMode !== 'quality' && graphicsMode !== 'ultra',
        alphaThickness: graphicsMode === 'performance' ? 15 : 12,
    };
}
function setGraphicsCanvas3DProps(ctx, graphics) {
    var _a, _b;
    const pixelScale = graphics === 'balanced' ? 0.75
        : graphics === 'performance' ? 0.5 : 1;
    (_a = ctx.canvas3dContext) === null || _a === void 0 ? void 0 : _a.setProps({ pixelScale });
    (_b = ctx.canvas3d) === null || _b === void 0 ? void 0 : _b.setProps({
        postprocessing: {
            sharpening: pixelScale < 1 ? {
                name: 'on',
                params: { sharpness: 0.5, denoise: true }
            } : { name: 'off', params: {} }
        }
    });
}
//
exports.MesoscaleStateParams = {
    filter: param_definition_1.ParamDefinition.Value('', { isHidden: true }),
    graphics: param_definition_1.ParamDefinition.Select('quality', param_definition_1.ParamDefinition.arrayToOptions(['ultra', 'quality', 'balanced', 'performance', 'custom'])),
    description: param_definition_1.ParamDefinition.Value('', { isHidden: true }),
    focusInfo: param_definition_1.ParamDefinition.Value('', { isHidden: true }),
    link: param_definition_1.ParamDefinition.Value('', { isHidden: true }),
    textSizeDescription: param_definition_1.ParamDefinition.Numeric(14, { min: 1, max: 100, step: 1 }, { isHidden: true }),
    index: param_definition_1.ParamDefinition.Value(-1, { isHidden: true })
};
class MesoscaleStateObject extends objects_1.PluginStateObject.Create({ name: 'Mesoscale State', typeClass: 'Object' }) {
}
exports.MesoscaleStateObject = MesoscaleStateObject;
const MesoscaleStateTransform = objects_1.PluginStateTransform.BuiltIn({
    name: 'mesoscale-state',
    display: { name: 'Mesoscale State' },
    from: objects_1.PluginStateObject.Root,
    to: MesoscaleStateObject,
    params: exports.MesoscaleStateParams,
})({
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Apply Mesoscale State', async () => {
            return new MesoscaleStateObject(params);
        });
    },
});
const MesoscaleState = {
    async init(ctx) {
        const cell = ctx.state.data.selectQ(q => q.ofType(MesoscaleStateObject))[0];
        if (cell)
            throw new Error('MesoscaleState already initialized');
        const customState = ctx.customState;
        const state = await ctx.state.data.build().toRoot().apply(MesoscaleStateTransform, {
            filter: '',
            graphics: customState.graphicsMode,
        }).commit();
        customState.stateRef = state.ref;
    },
    get(ctx) {
        const ref = this.ref(ctx);
        return ctx.state.data.tryGetCellData(ref);
    },
    async set(ctx, props) {
        const ref = this.ref(ctx);
        await ctx.state.data.build().to(ref).update(MesoscaleStateTransform, old => Object.assign(old, props)).commit();
    },
    ref(ctx) {
        const ref = ctx.customState.stateRef;
        if (!ref)
            throw new Error('MesoscaleState not initialized');
        return ref;
    },
    has(ctx) {
        const ref = ctx.customState.stateRef || '';
        return ctx.state.data.cells.has(ref) ? true : false;
    },
};
exports.MesoscaleState = MesoscaleState;
//
function getRoots(plugin) {
    const s = plugin.customState;
    if (!s.stateCache.roots) {
        s.stateCache.roots = plugin.state.data.select(mol_state_1.StateSelection.Generators.rootsOfType(MesoscaleGroupObject));
    }
    return s.stateCache.roots;
}
function getGroups(plugin, tag) {
    const s = plugin.customState;
    const k = `groups-${tag || ''}`;
    if (!s.stateCache[k]) {
        const selector = tag !== undefined
            ? mol_state_1.StateSelection.Generators.ofTransformer(exports.MesoscaleGroup).withTag(tag)
            : mol_state_1.StateSelection.Generators.ofTransformer(exports.MesoscaleGroup);
        s.stateCache[k] = plugin.state.data.select(selector);
    }
    return s.stateCache[k];
}
function _getAllGroups(plugin, tag, list) {
    var _a;
    const groups = getGroups(plugin, tag);
    list.push(...groups);
    for (const g of groups) {
        _getAllGroups(plugin, (_a = g.params) === null || _a === void 0 ? void 0 : _a.values.tag, list);
    }
    return list;
}
function getAllGroups(plugin, tag) {
    return _getAllGroups(plugin, tag, []);
}
function getAllLeafGroups(plugin, tag) {
    const allGroups = getAllGroups(plugin, tag);
    allGroups.sort((a, b) => { var _a, _b; return ((_a = a.params) === null || _a === void 0 ? void 0 : _a.values.index) - ((_b = b.params) === null || _b === void 0 ? void 0 : _b.values.index); });
    return allGroups.filter(g => {
        var _a;
        return getEntities(plugin, (_a = g.params) === null || _a === void 0 ? void 0 : _a.values.tag).length > 0;
    });
}
function getEntities(plugin, tag) {
    const s = plugin.customState;
    const k = `entities-${tag || ''}`;
    if (!s.stateCache[k]) {
        const structureSelector = tag !== undefined
            ? mol_state_1.StateSelection.Generators.ofTransformer(representation_1.StructureRepresentation3D).withTag(tag)
            : mol_state_1.StateSelection.Generators.ofTransformer(representation_1.StructureRepresentation3D);
        const shapeSelector = tag !== undefined
            ? mol_state_1.StateSelection.Generators.ofTransformer(representation_1.ShapeRepresentation3D).withTag(tag)
            : mol_state_1.StateSelection.Generators.ofTransformer(representation_1.ShapeRepresentation3D);
        s.stateCache[k] = [
            ...plugin.state.data.select(structureSelector).filter(c => c.obj.data.sourceData.elementCount > 0),
            ...plugin.state.data.select(shapeSelector),
        ];
    }
    return s.stateCache[k];
}
function getFilterMatcher(filter) {
    return filter.startsWith('"') && filter.endsWith('"')
        ? new RegExp(`^${(0, string_1.escapeRegExp)(filter.substring(1, filter.length - 1))}$`, 'g')
        : new RegExp((0, string_1.escapeRegExp)(filter), 'gi');
}
function getFilteredEntities(plugin, tag, filter) {
    if (!filter)
        return getEntities(plugin, tag);
    const matcher = getFilterMatcher(filter);
    return getEntities(plugin, tag).filter(c => getEntityLabel(plugin, c).match(matcher) !== null);
}
function _getAllEntities(plugin, tag, list) {
    var _a;
    list.push(...getEntities(plugin, tag));
    for (const g of getGroups(plugin, tag)) {
        _getAllEntities(plugin, (_a = g.params) === null || _a === void 0 ? void 0 : _a.values.tag, list);
    }
    return list;
}
function getAllEntities(plugin, tag) {
    return _getAllEntities(plugin, tag, []);
}
function getAllFilteredEntities(plugin, tag, filter) {
    if (!filter)
        return getAllEntities(plugin, tag);
    const matcher = getFilterMatcher(filter);
    return getAllEntities(plugin, tag).filter(c => getEntityLabel(plugin, c).match(matcher) !== null);
}
function getEveryEntity(plugin, filter, tag) {
    if (filter) {
        const matcher = getFilterMatcher(filter);
        return getAllEntities(plugin, tag).filter(c => getEntityLabel(plugin, c).match(matcher) !== null);
    }
    else {
        return getAllEntities(plugin, tag);
    }
}
function getEntityLabel(plugin, cell) {
    var _a, _b;
    return ((_b = (_a = mol_state_1.StateObjectRef.resolve(plugin.state.data, cell.transform.parent)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.label) || 'Entity';
}
function getCellDescription(cell) {
    var _a, _b;
    // markdown style for description
    return '**' + ((_a = cell === null || cell === void 0 ? void 0 : cell.obj) === null || _a === void 0 ? void 0 : _a.label) + '**\n\n' + ((_b = cell === null || cell === void 0 ? void 0 : cell.obj) === null || _b === void 0 ? void 0 : _b.description);
}
function getEntityDescription(plugin, cell) {
    const s = mol_state_1.StateObjectRef.resolve(plugin.state.data, cell.transform.parent);
    const d = getCellDescription(s);
    return d;
}
async function updateStyle(plugin, options) {
    const update = plugin.state.data.build();
    const { ignoreLight, material, celShaded, illustrative } = options;
    const entities = getAllEntities(plugin);
    for (let j = 0; j < entities.length; ++j) {
        update.to(entities[j]).update(old => {
            if (old.type) {
                const value = old.colorTheme.name === 'illustrative'
                    ? old.colorTheme.params.style.params.value
                    : old.colorTheme.params.value;
                const lightness = old.colorTheme.name === 'illustrative'
                    ? old.colorTheme.params.style.params.lightness
                    : old.colorTheme.params.lightness;
                if (illustrative) {
                    old.colorTheme = { name: 'illustrative', params: { style: { name: 'uniform', params: { value, lightness } } } };
                }
                else {
                    old.colorTheme = { name: 'uniform', params: { value, lightness } };
                }
                old.type.params.ignoreLight = ignoreLight;
                old.type.params.material = material;
                old.type.params.celShaded = celShaded;
            }
        });
    }
    await update.commit();
}
;
async function updateColors(plugin, values, tag, filter) {
    var _a, _b;
    const update = plugin.state.data.build();
    const { type, illustrative, value, shift, lightness, alpha, emissive } = values;
    if (type === 'group-generate' || type === 'group-uniform') {
        const leafGroups = getAllLeafGroups(plugin, tag);
        const rootLeafGroups = getRoots(plugin).filter(g => { var _a, _b; return ((_a = g.params) === null || _a === void 0 ? void 0 : _a.values.tag) === tag && getEntities(plugin, (_b = g.params) === null || _b === void 0 ? void 0 : _b.values.tag).length > 0; });
        const groups = [...leafGroups, ...rootLeafGroups];
        const baseColors = getDistinctBaseColors(groups.length, shift);
        for (let i = 0; i < groups.length; ++i) {
            const g = groups[i];
            const entities = getFilteredEntities(plugin, (_a = g.params) === null || _a === void 0 ? void 0 : _a.values.tag, filter);
            let groupColors = [];
            if (type === 'group-generate') {
                const c = (_b = g.params) === null || _b === void 0 ? void 0 : _b.values.color;
                groupColors = getDistinctGroupColors(entities.length, baseColors[i], c.variability, c.shift);
            }
            for (let j = 0; j < entities.length; ++j) {
                const c = type === 'group-generate' ? groupColors[j] : baseColors[i];
                update.to(entities[j]).update(old => {
                    if (old.type) {
                        if (illustrative) {
                            old.colorTheme = { name: 'illustrative', params: { style: { name: 'uniform', params: { value: c, lightness: lightness } } } };
                        }
                        else {
                            old.colorTheme = { name: 'uniform', params: { value: c, lightness: lightness } };
                        }
                        old.type.params.alpha = alpha;
                        old.type.params.xrayShaded = alpha < 1 ? 'inverted' : false;
                        old.type.params.emissive = emissive;
                    }
                    else if (old.coloring) {
                        old.coloring.params.color = c;
                        old.coloring.params.lightness = lightness;
                        old.alpha = alpha;
                        old.xrayShaded = alpha < 1 ? true : false;
                        old.emissive = emissive;
                    }
                });
            }
            update.to(g.transform.ref).update(old => {
                old.color.type = type === 'group-generate' ? 'generate' : 'uniform';
                old.color.illustrative = illustrative;
                old.color.value = baseColors[i];
                old.color.lightness = lightness;
                old.color.alpha = alpha;
                old.color.emissive = emissive;
            });
        }
    }
    else if (type === 'generate' || type === 'uniform') {
        const entities = getAllFilteredEntities(plugin, tag, filter);
        let groupColors = [];
        if (type === 'generate') {
            groupColors = getDistinctBaseColors(entities.length, shift);
        }
        for (let j = 0; j < entities.length; ++j) {
            const c = type === 'generate' ? groupColors[j] : value;
            update.to(entities[j]).update(old => {
                if (old.type) {
                    if (illustrative) {
                        old.colorTheme = { name: 'illustrative', params: { style: { name: 'uniform', params: { value: c, lightness: lightness } } } };
                    }
                    else {
                        old.colorTheme = { name: 'uniform', params: { value: c, lightness: lightness } };
                    }
                    old.type.params.alpha = alpha;
                    old.type.params.xrayShaded = alpha < 1 ? 'inverted' : false;
                    old.type.params.emissive = emissive;
                }
                else if (old.coloring) {
                    old.coloring.params.color = c;
                    old.coloring.params.lightness = lightness;
                    old.alpha = alpha;
                    old.xrayShaded = alpha < 1 ? true : false;
                    old.emissive = emissive;
                }
            });
        }
        const others = getAllLeafGroups(plugin, tag);
        for (const o of others) {
            update.to(o).update(old => {
                old.color.type = type === 'generate' ? 'custom' : 'uniform';
                old.color.illustrative = illustrative;
                old.color.value = value;
                old.color.lightness = lightness;
                old.color.alpha = alpha;
                old.color.emissive = emissive;
            });
        }
    }
    await update.commit();
}
;
function expandAllGroups(plugin) {
    for (const g of getAllGroups(plugin)) {
        if (g.state.isCollapsed) {
            plugin.state.data.updateCellState(g.transform.ref, { isCollapsed: false });
        }
    }
}
;
