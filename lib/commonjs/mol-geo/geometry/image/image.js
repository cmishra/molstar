"use strict";
/**
 * Copyright (c) 2020-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = exports.InterpolationTypeNames = exports.InterpolationTypes = void 0;
const util_1 = require("../../../mol-data/util");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const util_2 = require("../../../mol-gl/renderable/util");
const geometry_1 = require("../../../mol-math/geometry");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const mol_util_1 = require("../../../mol-util");
const param_definition_1 = require("../../../mol-util/param-definition");
const base_1 = require("../base");
const color_data_1 = require("../color-data");
const marker_data_1 = require("../marker-data");
const overpaint_data_1 = require("../overpaint-data");
const transparency_data_1 = require("../transparency-data");
const array_1 = require("../../../mol-util/array");
const clipping_data_1 = require("../clipping-data");
const location_1 = require("../../../mol-model/location");
const util_3 = require("../../../mol-gl/compute/util");
const substance_data_1 = require("../substance-data");
const emissive_data_1 = require("../emissive-data");
const QuadIndices = new Uint32Array([
    0, 1, 2,
    1, 3, 2
]);
const QuadUvs = new Float32Array([
    0, 1,
    0, 0,
    1, 1,
    1, 0
]);
exports.InterpolationTypes = {
    'nearest': 'Nearest',
    'catmulrom': 'Catmulrom (Cubic)',
    'mitchell': 'Mitchell (Cubic)',
    'bspline': 'B-Spline (Cubic)'
};
exports.InterpolationTypeNames = Object.keys(exports.InterpolationTypes);
var Image;
(function (Image) {
    function createEmptyTrim() {
        return { type: 0, center: (0, linear_algebra_1.Vec3)(), rotation: (0, linear_algebra_1.Quat)(), scale: (0, linear_algebra_1.Vec3)(), transform: (0, linear_algebra_1.Mat4)() };
    }
    Image.createEmptyTrim = createEmptyTrim;
    function create(imageTexture, corners, groupTexture, valueTexture, trim, isoLevel, image) {
        return image ?
            update(imageTexture, corners, groupTexture, valueTexture, trim, isoLevel, image) :
            fromData(imageTexture, corners, groupTexture, valueTexture, trim, isoLevel);
    }
    Image.create = create;
    function hashCode(image) {
        return (0, util_1.hashFnv32a)([
            image.cornerBuffer.ref.version
        ]);
    }
    function fromData(imageTexture, corners, groupTexture, valueTexture, trim, isoLevel) {
        const boundingSphere = (0, geometry_1.Sphere3D)();
        let currentHash = -1;
        const width = imageTexture.width;
        const height = imageTexture.height;
        const image = {
            kind: 'image',
            imageTexture: mol_util_1.ValueCell.create(imageTexture),
            imageTextureDim: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(width, height)),
            cornerBuffer: mol_util_1.ValueCell.create(corners),
            groupTexture: mol_util_1.ValueCell.create(groupTexture),
            valueTexture: mol_util_1.ValueCell.create(valueTexture),
            trimType: mol_util_1.ValueCell.create(trim.type),
            trimCenter: mol_util_1.ValueCell.create(trim.center),
            trimRotation: mol_util_1.ValueCell.create(trim.rotation),
            trimScale: mol_util_1.ValueCell.create(trim.scale),
            trimTransform: mol_util_1.ValueCell.create(trim.transform),
            isoLevel: mol_util_1.ValueCell.create(isoLevel),
            get boundingSphere() {
                const newHash = hashCode(image);
                if (newHash !== currentHash) {
                    const b = getBoundingSphere(image.cornerBuffer.ref.value);
                    geometry_1.Sphere3D.copy(boundingSphere, b);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
        };
        return image;
    }
    function update(imageTexture, corners, groupTexture, valueTexture, trim, isoLevel, image) {
        const width = imageTexture.width;
        const height = imageTexture.height;
        mol_util_1.ValueCell.update(image.imageTexture, imageTexture);
        mol_util_1.ValueCell.update(image.imageTextureDim, linear_algebra_1.Vec2.set(image.imageTextureDim.ref.value, width, height));
        mol_util_1.ValueCell.update(image.cornerBuffer, corners);
        mol_util_1.ValueCell.update(image.groupTexture, groupTexture);
        mol_util_1.ValueCell.update(image.valueTexture, valueTexture);
        mol_util_1.ValueCell.updateIfChanged(image.trimType, trim.type);
        mol_util_1.ValueCell.update(image.trimCenter, linear_algebra_1.Vec3.copy(image.trimCenter.ref.value, trim.center));
        mol_util_1.ValueCell.update(image.trimRotation, linear_algebra_1.Quat.copy(image.trimRotation.ref.value, trim.rotation));
        mol_util_1.ValueCell.update(image.trimScale, linear_algebra_1.Vec3.copy(image.trimScale.ref.value, trim.scale));
        mol_util_1.ValueCell.update(image.trimTransform, linear_algebra_1.Mat4.copy(image.trimTransform.ref.value, trim.transform));
        mol_util_1.ValueCell.updateIfChanged(image.isoLevel, isoLevel);
        return image;
    }
    function createEmpty(image) {
        const imageTexture = (0, util_2.createTextureImage)(0, 4, Uint8Array);
        const corners = image ? image.cornerBuffer.ref.value : new Float32Array(8 * 3);
        const groupTexture = (0, util_2.createTextureImage)(0, 4, Uint8Array);
        const valueTexture = (0, util_2.createTextureImage)(0, 1, Float32Array);
        const trim = createEmptyTrim();
        return create(imageTexture, corners, groupTexture, valueTexture, trim, -1, image);
    }
    Image.createEmpty = createEmpty;
    Image.Params = {
        ...base_1.BaseGeometry.Params,
        interpolation: param_definition_1.ParamDefinition.Select('bspline', param_definition_1.ParamDefinition.objectToOptions(exports.InterpolationTypes)),
    };
    Image.Utils = {
        Params: Image.Params,
        createEmpty,
        createValues,
        createValuesSimple,
        updateValues,
        updateBoundingSphere,
        createRenderableState,
        updateRenderableState,
        createPositionIterator
    };
    function createPositionIterator(_image, _transform) {
        return (0, location_iterator_1.LocationIterator)(1, 1, 1, () => location_1.NullLocation);
    }
    function createValues(image, transform, locationIt, theme, props) {
        const { instanceCount, groupCount } = locationIt;
        const positionIt = createPositionIterator(image, transform);
        const color = (0, color_data_1.createColors)(locationIt, positionIt, theme.color);
        const marker = props.instanceGranularity
            ? (0, marker_data_1.createMarkers)(instanceCount, 'instance')
            : (0, marker_data_1.createMarkers)(instanceCount * groupCount, 'groupInstance');
        const overpaint = (0, overpaint_data_1.createEmptyOverpaint)();
        const transparency = (0, transparency_data_1.createEmptyTransparency)();
        const emissive = (0, emissive_data_1.createEmptyEmissive)();
        const material = (0, substance_data_1.createEmptySubstance)();
        const clipping = (0, clipping_data_1.createEmptyClipping)();
        const counts = { drawCount: QuadIndices.length, vertexCount: util_3.QuadPositions.length / 3, groupCount, instanceCount };
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(image.boundingSphere);
        const boundingSphere = (0, util_2.calculateTransformBoundingSphere)(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        return {
            dGeometryType: mol_util_1.ValueCell.create('image'),
            ...color,
            ...marker,
            ...overpaint,
            ...transparency,
            ...emissive,
            ...material,
            ...clipping,
            ...transform,
            ...base_1.BaseGeometry.createValues(props, counts),
            aPosition: image.cornerBuffer,
            aUv: mol_util_1.ValueCell.create(QuadUvs),
            elements: mol_util_1.ValueCell.create(QuadIndices),
            // aGroup is used as a vertex index here, group id is in tGroupTex
            aGroup: mol_util_1.ValueCell.create((0, array_1.fillSerial)(new Float32Array(4))),
            boundingSphere: mol_util_1.ValueCell.create(boundingSphere),
            invariantBoundingSphere: mol_util_1.ValueCell.create(invariantBoundingSphere),
            uInvariantBoundingSphere: mol_util_1.ValueCell.create(linear_algebra_1.Vec4.ofSphere(invariantBoundingSphere)),
            dInterpolation: mol_util_1.ValueCell.create(props.interpolation),
            uImageTexDim: image.imageTextureDim,
            tImageTex: image.imageTexture,
            tGroupTex: image.groupTexture,
            tValueTex: image.valueTexture,
            uTrimType: image.trimType,
            uTrimCenter: image.trimCenter,
            uTrimRotation: image.trimRotation,
            uTrimScale: image.trimScale,
            uTrimTransform: image.trimTransform,
            uIsoLevel: image.isoLevel,
        };
    }
    function createValuesSimple(image, props, colorValue, sizeValue, transform) {
        const s = base_1.BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(Image.Params), ...props };
        return createValues(image, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        base_1.BaseGeometry.updateValues(values, props);
        mol_util_1.ValueCell.updateIfChanged(values.dInterpolation, props.interpolation);
    }
    function updateBoundingSphere(values, image) {
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(image.boundingSphere);
        const boundingSphere = (0, util_2.calculateTransformBoundingSphere)(invariantBoundingSphere, values.aTransform.ref.value, values.instanceCount.ref.value, 0);
        if (!geometry_1.Sphere3D.equals(boundingSphere, values.boundingSphere.ref.value)) {
            mol_util_1.ValueCell.update(values.boundingSphere, boundingSphere);
        }
        if (!geometry_1.Sphere3D.equals(invariantBoundingSphere, values.invariantBoundingSphere.ref.value)) {
            mol_util_1.ValueCell.update(values.invariantBoundingSphere, invariantBoundingSphere);
            mol_util_1.ValueCell.update(values.uInvariantBoundingSphere, linear_algebra_1.Vec4.fromSphere(values.uInvariantBoundingSphere.ref.value, invariantBoundingSphere));
        }
    }
    function createRenderableState(props) {
        const state = base_1.BaseGeometry.createRenderableState(props);
        state.opaque = false;
        return state;
    }
    function updateRenderableState(state, props) {
        base_1.BaseGeometry.updateRenderableState(state, props);
        state.opaque = false;
    }
})(Image || (exports.Image = Image = {}));
//
function getBoundingSphere(corners) {
    const center = (0, linear_algebra_1.Vec3)();
    const extrema = [];
    for (let i = 0, il = corners.length; i < il; i += 3) {
        const e = linear_algebra_1.Vec3.fromArray((0, linear_algebra_1.Vec3)(), corners, i);
        extrema.push(e);
        linear_algebra_1.Vec3.add(center, center, e);
    }
    linear_algebra_1.Vec3.scale(center, center, 1 / (corners.length / 3));
    let radius = 0;
    for (const e of extrema) {
        const d = linear_algebra_1.Vec3.distance(center, e);
        if (d > radius)
            radius = d;
    }
    const sphere = geometry_1.Sphere3D.create(center, radius);
    geometry_1.Sphere3D.setExtrema(sphere, extrema);
    return sphere;
}
