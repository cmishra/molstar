"use strict";
/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseGeometry = exports.ColorSmoothingParams = exports.VisualQualityOptions = exports.VisualQualityNames = exports.VisualQualityInfo = void 0;
exports.hasColorSmoothingProp = hasColorSmoothingProp;
exports.getColorSmoothingProps = getColorSmoothingProps;
const mol_util_1 = require("../../mol-util");
const location_iterator_1 = require("../util/location-iterator");
const param_definition_1 = require("../../mol-util/param-definition");
const transform_data_1 = require("./transform-data");
const names_1 = require("../../mol-util/color/names");
const location_1 = require("../../mol-model/location");
const uniform_1 = require("../../mol-theme/color/uniform");
const uniform_2 = require("../../mol-theme/size/uniform");
const interpolate_1 = require("../../mol-math/interpolate");
const material_1 = require("../../mol-util/material");
const clip_1 = require("../../mol-util/clip");
const vec3_1 = require("../../mol-math/linear-algebra/3d/vec3");
const vec4_1 = require("../../mol-math/linear-algebra/3d/vec4");
exports.VisualQualityInfo = {
    'custom': {},
    'auto': {},
    'highest': {},
    'higher': {},
    'high': {},
    'medium': {},
    'low': {},
    'lower': {},
    'lowest': {},
};
exports.VisualQualityNames = Object.keys(exports.VisualQualityInfo);
exports.VisualQualityOptions = param_definition_1.ParamDefinition.arrayToOptions(exports.VisualQualityNames);
//
exports.ColorSmoothingParams = {
    smoothColors: param_definition_1.ParamDefinition.MappedStatic('auto', {
        auto: param_definition_1.ParamDefinition.Group({}),
        on: param_definition_1.ParamDefinition.Group({
            resolutionFactor: param_definition_1.ParamDefinition.Numeric(2, { min: 0.5, max: 6, step: 0.1 }),
            sampleStride: param_definition_1.ParamDefinition.Numeric(3, { min: 1, max: 12, step: 1 }),
        }),
        off: param_definition_1.ParamDefinition.Group({})
    }),
};
function hasColorSmoothingProp(props) {
    return !!props.smoothColors;
}
function getColorSmoothingProps(smoothColors, preferSmoothing, resolution) {
    if ((smoothColors.name === 'on' || (smoothColors.name === 'auto' && preferSmoothing)) && resolution && resolution < 3) {
        let stride = 3;
        if (smoothColors.name === 'on') {
            resolution *= smoothColors.params.resolutionFactor;
            stride = smoothColors.params.sampleStride;
        }
        else {
            // https://graphtoy.com/?f1(x,t)=(2-smoothstep(0,1.1,x))*x&coords=0.7,0.6,1.8
            resolution *= 2 - (0, interpolate_1.smoothstep)(0, 1.1, resolution);
            resolution = Math.max(0.5, resolution);
            if (resolution > 1.2)
                stride = 2;
        }
        return { resolution, stride };
    }
    ;
}
//
var BaseGeometry;
(function (BaseGeometry) {
    BaseGeometry.MaterialCategory = { category: 'Material' };
    BaseGeometry.ShadingCategory = { category: 'Shading' };
    BaseGeometry.CullingLodCategory = { category: 'Culling & LOD' };
    BaseGeometry.CustomQualityParamInfo = {
        category: 'Custom Quality',
        hideIf: (params) => typeof params.quality !== 'undefined' && params.quality !== 'custom'
    };
    BaseGeometry.Params = {
        alpha: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }, { label: 'Opacity', isEssential: true, description: 'How opaque/transparent the representation is rendered.' }),
        quality: param_definition_1.ParamDefinition.Select('auto', exports.VisualQualityOptions, { isEssential: true, description: 'Visual/rendering quality of the representation.' }),
        material: material_1.Material.getParam(),
        clip: param_definition_1.ParamDefinition.Group(clip_1.Clip.Params),
        emissive: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 1, step: 0.01 }),
        density: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 1, step: 0.01 }, { description: 'Density value to estimate object thickness.' }),
        instanceGranularity: param_definition_1.ParamDefinition.Boolean(false, { description: 'Use instance granularity for marker, transparency, clipping, overpaint, substance data to save memory.' }),
        lod: param_definition_1.ParamDefinition.Vec3((0, vec3_1.Vec3)(), undefined, { ...BaseGeometry.CullingLodCategory, description: 'Level of detail.', fieldLabels: { x: 'Min Distance', y: 'Max Distance', z: 'Overlap (Shader)' } }),
        cellSize: param_definition_1.ParamDefinition.Numeric(200, { min: 0, max: 5000, step: 100 }, { ...BaseGeometry.CullingLodCategory, description: 'Instance grid cell size.' }),
        batchSize: param_definition_1.ParamDefinition.Numeric(2000, { min: 0, max: 50000, step: 500 }, { ...BaseGeometry.CullingLodCategory, description: 'Instance grid batch size.' }),
    };
    function createSimple(colorValue = names_1.ColorNames.grey, sizeValue = 1, transform) {
        if (!transform)
            transform = (0, transform_data_1.createIdentityTransform)();
        const locationIterator = (0, location_iterator_1.LocationIterator)(1, transform.instanceCount.ref.value, 1, () => location_1.NullLocation, false, () => false);
        const theme = {
            color: (0, uniform_1.UniformColorTheme)({}, { value: colorValue, lightness: 0, saturation: 0 }),
            size: (0, uniform_2.UniformSizeTheme)({}, { value: sizeValue })
        };
        return { transform, locationIterator, theme };
    }
    BaseGeometry.createSimple = createSimple;
    function createValues(props, counts) {
        const clip = clip_1.Clip.getClip(props.clip);
        return {
            alpha: mol_util_1.ValueCell.create(props.alpha),
            uAlpha: mol_util_1.ValueCell.create(props.alpha),
            uVertexCount: mol_util_1.ValueCell.create(counts.vertexCount),
            uGroupCount: mol_util_1.ValueCell.create(counts.groupCount),
            drawCount: mol_util_1.ValueCell.create(counts.drawCount),
            uMetalness: mol_util_1.ValueCell.create(props.material.metalness),
            uRoughness: mol_util_1.ValueCell.create(props.material.roughness),
            uBumpiness: mol_util_1.ValueCell.create(props.material.bumpiness),
            uEmissive: mol_util_1.ValueCell.create(props.emissive),
            uDensity: mol_util_1.ValueCell.create(props.density),
            dLightCount: mol_util_1.ValueCell.create(1),
            dColorMarker: mol_util_1.ValueCell.create(true),
            dClipObjectCount: mol_util_1.ValueCell.create(clip.objects.count),
            dClipVariant: mol_util_1.ValueCell.create(clip.variant),
            uClipObjectType: mol_util_1.ValueCell.create(clip.objects.type),
            uClipObjectInvert: mol_util_1.ValueCell.create(clip.objects.invert),
            uClipObjectPosition: mol_util_1.ValueCell.create(clip.objects.position),
            uClipObjectRotation: mol_util_1.ValueCell.create(clip.objects.rotation),
            uClipObjectScale: mol_util_1.ValueCell.create(clip.objects.scale),
            uClipObjectTransform: mol_util_1.ValueCell.create(clip.objects.transform),
            instanceGranularity: mol_util_1.ValueCell.create(props.instanceGranularity),
            uLod: mol_util_1.ValueCell.create(vec4_1.Vec4.create(props.lod[0], props.lod[1], props.lod[2], 0)),
        };
    }
    BaseGeometry.createValues = createValues;
    function updateValues(values, props) {
        mol_util_1.ValueCell.updateIfChanged(values.alpha, props.alpha); // `uAlpha` is set in renderable.render
        mol_util_1.ValueCell.updateIfChanged(values.uMetalness, props.material.metalness);
        mol_util_1.ValueCell.updateIfChanged(values.uRoughness, props.material.roughness);
        mol_util_1.ValueCell.updateIfChanged(values.uBumpiness, props.material.bumpiness);
        mol_util_1.ValueCell.updateIfChanged(values.uEmissive, props.emissive);
        mol_util_1.ValueCell.updateIfChanged(values.uDensity, props.density);
        const clip = clip_1.Clip.getClip(props.clip);
        mol_util_1.ValueCell.updateIfChanged(values.dClipObjectCount, clip.objects.count);
        mol_util_1.ValueCell.updateIfChanged(values.dClipVariant, clip.variant);
        mol_util_1.ValueCell.update(values.uClipObjectType, clip.objects.type);
        mol_util_1.ValueCell.update(values.uClipObjectInvert, clip.objects.invert);
        mol_util_1.ValueCell.update(values.uClipObjectPosition, clip.objects.position);
        mol_util_1.ValueCell.update(values.uClipObjectRotation, clip.objects.rotation);
        mol_util_1.ValueCell.update(values.uClipObjectScale, clip.objects.scale);
        mol_util_1.ValueCell.update(values.uClipObjectTransform, clip.objects.transform);
        mol_util_1.ValueCell.updateIfChanged(values.instanceGranularity, props.instanceGranularity);
        mol_util_1.ValueCell.update(values.uLod, vec4_1.Vec4.set(values.uLod.ref.value, props.lod[0], props.lod[1], props.lod[2], 0));
    }
    BaseGeometry.updateValues = updateValues;
    function createRenderableState(props = {}) {
        const opaque = props.alpha === undefined ? true : props.alpha === 1;
        return {
            disposed: false,
            visible: true,
            alphaFactor: 1,
            pickable: true,
            colorOnly: false,
            opaque,
            writeDepth: opaque,
        };
    }
    BaseGeometry.createRenderableState = createRenderableState;
    function updateRenderableState(state, props) {
        state.opaque = props.alpha * state.alphaFactor >= 1;
        state.writeDepth = state.opaque;
    }
    BaseGeometry.updateRenderableState = updateRenderableState;
})(BaseGeometry || (exports.BaseGeometry = BaseGeometry = {}));
