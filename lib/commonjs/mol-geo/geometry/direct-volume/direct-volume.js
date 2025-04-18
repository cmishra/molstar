"use strict";
/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectVolume = void 0;
const util_1 = require("../../../mol-data/util");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const util_2 = require("../../../mol-gl/renderable/util");
const texture_1 = require("../../../mol-gl/webgl/texture");
const geometry_1 = require("../../../mol-math/geometry");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const mol_util_1 = require("../../../mol-util");
const param_definition_1 = require("../../../mol-util/param-definition");
const box_1 = require("../../primitive/box");
const base_1 = require("../base");
const color_data_1 = require("../color-data");
const marker_data_1 = require("../marker-data");
const overpaint_data_1 = require("../overpaint-data");
const transparency_data_1 = require("../transparency-data");
const transfer_function_1 = require("./transfer-function");
const clipping_data_1 = require("../clipping-data");
const volume_1 = require("../../../mol-model/volume");
const substance_data_1 = require("../substance-data");
const emissive_data_1 = require("../emissive-data");
const VolumeBox = (0, box_1.Box)();
var DirectVolume;
(function (DirectVolume) {
    function create(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, dataType, directVolume) {
        return directVolume ?
            update(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, dataType, directVolume) :
            fromData(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, dataType);
    }
    DirectVolume.create = create;
    function hashCode(directVolume) {
        return (0, util_1.hashFnv32a)([
            directVolume.bboxSize.ref.version, directVolume.gridDimension.ref.version,
            directVolume.gridTexture.ref.version, directVolume.transform.ref.version,
            directVolume.gridStats.ref.version
        ]);
    }
    function fromData(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, dataType) {
        const boundingSphere = (0, geometry_1.Sphere3D)();
        let currentHash = -1;
        const width = texture.getWidth();
        const height = texture.getHeight();
        const depth = texture.getDepth();
        const directVolume = {
            kind: 'direct-volume',
            gridDimension: mol_util_1.ValueCell.create(gridDimension),
            gridTexture: mol_util_1.ValueCell.create(texture),
            gridTextureDim: mol_util_1.ValueCell.create(linear_algebra_1.Vec3.create(width, height, depth)),
            gridStats: mol_util_1.ValueCell.create(linear_algebra_1.Vec4.create(stats.min, stats.max, stats.mean, stats.sigma)),
            bboxMin: mol_util_1.ValueCell.create(bbox.min),
            bboxMax: mol_util_1.ValueCell.create(bbox.max),
            bboxSize: mol_util_1.ValueCell.create(linear_algebra_1.Vec3.sub((0, linear_algebra_1.Vec3)(), bbox.max, bbox.min)),
            transform: mol_util_1.ValueCell.create(transform),
            cellDim: mol_util_1.ValueCell.create(cellDim),
            unitToCartn: mol_util_1.ValueCell.create(unitToCartn),
            cartnToUnit: mol_util_1.ValueCell.create(linear_algebra_1.Mat4.invert((0, linear_algebra_1.Mat4)(), unitToCartn)),
            get boundingSphere() {
                const newHash = hashCode(directVolume);
                if (newHash !== currentHash) {
                    const b = getBoundingSphere(directVolume.gridDimension.ref.value, directVolume.transform.ref.value);
                    geometry_1.Sphere3D.copy(boundingSphere, b);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            packedGroup: mol_util_1.ValueCell.create(packedGroup),
            axisOrder: mol_util_1.ValueCell.create(axisOrder),
            dataType: mol_util_1.ValueCell.create(dataType),
            setBoundingSphere(sphere) {
                geometry_1.Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(directVolume);
            }
        };
        return directVolume;
    }
    function update(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, dataType, directVolume) {
        const width = texture.getWidth();
        const height = texture.getHeight();
        const depth = texture.getDepth();
        mol_util_1.ValueCell.update(directVolume.gridDimension, gridDimension);
        mol_util_1.ValueCell.update(directVolume.gridTexture, texture);
        mol_util_1.ValueCell.update(directVolume.gridTextureDim, linear_algebra_1.Vec3.set(directVolume.gridTextureDim.ref.value, width, height, depth));
        mol_util_1.ValueCell.update(directVolume.gridStats, linear_algebra_1.Vec4.set(directVolume.gridStats.ref.value, stats.min, stats.max, stats.mean, stats.sigma));
        mol_util_1.ValueCell.update(directVolume.bboxMin, bbox.min);
        mol_util_1.ValueCell.update(directVolume.bboxMax, bbox.max);
        mol_util_1.ValueCell.update(directVolume.bboxSize, linear_algebra_1.Vec3.sub(directVolume.bboxSize.ref.value, bbox.max, bbox.min));
        mol_util_1.ValueCell.update(directVolume.transform, transform);
        mol_util_1.ValueCell.update(directVolume.cellDim, cellDim);
        mol_util_1.ValueCell.update(directVolume.unitToCartn, unitToCartn);
        mol_util_1.ValueCell.update(directVolume.cartnToUnit, linear_algebra_1.Mat4.invert((0, linear_algebra_1.Mat4)(), unitToCartn));
        mol_util_1.ValueCell.updateIfChanged(directVolume.packedGroup, packedGroup);
        mol_util_1.ValueCell.updateIfChanged(directVolume.axisOrder, linear_algebra_1.Vec3.fromArray(directVolume.axisOrder.ref.value, axisOrder, 0));
        mol_util_1.ValueCell.updateIfChanged(directVolume.dataType, dataType);
        return directVolume;
    }
    function createEmpty(directVolume) {
        const bbox = (0, geometry_1.Box3D)();
        const gridDimension = (0, linear_algebra_1.Vec3)();
        const transform = linear_algebra_1.Mat4.identity();
        const unitToCartn = linear_algebra_1.Mat4.identity();
        const cellDim = (0, linear_algebra_1.Vec3)();
        const texture = (0, texture_1.createNullTexture)();
        const stats = volume_1.Grid.One.stats;
        const packedGroup = false;
        const axisOrder = linear_algebra_1.Vec3.create(0, 1, 2);
        const dataType = 'byte';
        return create(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, dataType, directVolume);
    }
    DirectVolume.createEmpty = createEmpty;
    DirectVolume.Params = {
        ...base_1.BaseGeometry.Params,
        ignoreLight: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        celShaded: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        xrayShaded: param_definition_1.ParamDefinition.Select(false, [[false, 'Off'], [true, 'On'], ['inverted', 'Inverted']], base_1.BaseGeometry.ShadingCategory),
        controlPoints: param_definition_1.ParamDefinition.LineGraph([
            linear_algebra_1.Vec2.create(0.19, 0.0), linear_algebra_1.Vec2.create(0.2, 0.05), linear_algebra_1.Vec2.create(0.25, 0.05), linear_algebra_1.Vec2.create(0.26, 0.0),
            linear_algebra_1.Vec2.create(0.79, 0.0), linear_algebra_1.Vec2.create(0.8, 0.05), linear_algebra_1.Vec2.create(0.85, 0.05), linear_algebra_1.Vec2.create(0.86, 0.0),
        ], { isEssential: true }),
        stepsPerCell: param_definition_1.ParamDefinition.Numeric(3, { min: 1, max: 10, step: 1 }),
        jumpLength: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 20, step: 0.1 }),
    };
    DirectVolume.Utils = {
        Params: DirectVolume.Params,
        createEmpty,
        createValues,
        createValuesSimple,
        updateValues,
        updateBoundingSphere,
        createRenderableState,
        updateRenderableState,
        createPositionIterator
    };
    function createPositionIterator(directVolume, transform) {
        const t = directVolume.transform.ref.value;
        const [x, y, z] = directVolume.gridDimension.ref.value;
        const groupCount = x * y * z;
        const instanceCount = transform.instanceCount.ref.value;
        const location = (0, location_iterator_1.PositionLocation)();
        const p = location.position;
        const m = transform.aTransform.ref.value;
        const getLocation = (groupIndex, instanceIndex) => {
            const k = Math.floor(groupIndex / z);
            p[0] = Math.floor(k / y);
            p[1] = k % y;
            p[2] = groupIndex % z;
            linear_algebra_1.Vec3.transformMat4(p, p, t);
            if (instanceIndex >= 0) {
                linear_algebra_1.Vec3.transformMat4Offset(p, p, m, 0, 0, instanceIndex * 16);
            }
            return location;
        };
        return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation);
    }
    function getMaxSteps(gridDim, stepsPerCell) {
        return Math.ceil(linear_algebra_1.Vec3.magnitude(gridDim) * stepsPerCell);
    }
    function getStepScale(cellDim, stepsPerCell) {
        return Math.min(...cellDim) * (1 / stepsPerCell);
    }
    function getTransferScale(stepsPerCell) {
        return (1 / stepsPerCell);
    }
    function createValues(directVolume, transform, locationIt, theme, props) {
        const { gridTexture, gridTextureDim, gridStats } = directVolume;
        const { bboxSize, bboxMin, bboxMax, gridDimension, transform: gridTransform } = directVolume;
        const { instanceCount, groupCount } = locationIt;
        const positionIt = createPositionIterator(directVolume, transform);
        const color = (0, color_data_1.createColors)(locationIt, positionIt, theme.color);
        const marker = props.instanceGranularity
            ? (0, marker_data_1.createMarkers)(instanceCount, 'instance')
            : (0, marker_data_1.createMarkers)(instanceCount * groupCount, 'groupInstance');
        const overpaint = (0, overpaint_data_1.createEmptyOverpaint)();
        const transparency = (0, transparency_data_1.createEmptyTransparency)();
        const emissive = (0, emissive_data_1.createEmptyEmissive)();
        const material = (0, substance_data_1.createEmptySubstance)();
        const clipping = (0, clipping_data_1.createEmptyClipping)();
        const [x, y, z] = gridDimension.ref.value;
        const counts = { drawCount: VolumeBox.indices.length, vertexCount: x * y * z, groupCount, instanceCount };
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(directVolume.boundingSphere);
        const boundingSphere = (0, util_2.calculateTransformBoundingSphere)(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        const controlPoints = (0, transfer_function_1.getControlPointsFromVec2Array)(props.controlPoints);
        const transferTex = (0, transfer_function_1.createTransferFunctionTexture)(controlPoints);
        return {
            dGeometryType: mol_util_1.ValueCell.create('directVolume'),
            ...color,
            ...marker,
            ...overpaint,
            ...transparency,
            ...emissive,
            ...material,
            ...clipping,
            ...transform,
            ...base_1.BaseGeometry.createValues(props, counts),
            aPosition: mol_util_1.ValueCell.create(VolumeBox.vertices),
            elements: mol_util_1.ValueCell.create(VolumeBox.indices),
            boundingSphere: mol_util_1.ValueCell.create(boundingSphere),
            invariantBoundingSphere: mol_util_1.ValueCell.create(invariantBoundingSphere),
            uInvariantBoundingSphere: mol_util_1.ValueCell.create(linear_algebra_1.Vec4.ofSphere(invariantBoundingSphere)),
            uBboxMin: bboxMin,
            uBboxMax: bboxMax,
            uBboxSize: bboxSize,
            uMaxSteps: mol_util_1.ValueCell.create(getMaxSteps(gridDimension.ref.value, props.stepsPerCell)),
            uStepScale: mol_util_1.ValueCell.create(getStepScale(directVolume.cellDim.ref.value, props.stepsPerCell)),
            uJumpLength: mol_util_1.ValueCell.create(props.jumpLength),
            uTransform: gridTransform,
            uGridDim: gridDimension,
            tTransferTex: transferTex,
            uTransferScale: mol_util_1.ValueCell.create(getTransferScale(props.stepsPerCell)),
            dGridTexType: mol_util_1.ValueCell.create(gridTexture.ref.value.getDepth() > 0 ? '3d' : '2d'),
            uGridTexDim: gridTextureDim,
            tGridTex: gridTexture,
            uGridStats: gridStats,
            uCellDim: directVolume.cellDim,
            uCartnToUnit: directVolume.cartnToUnit,
            uUnitToCartn: directVolume.unitToCartn,
            dPackedGroup: directVolume.packedGroup,
            dAxisOrder: mol_util_1.ValueCell.create(directVolume.axisOrder.ref.value.join('')),
            dIgnoreLight: mol_util_1.ValueCell.create(props.ignoreLight),
            dCelShaded: mol_util_1.ValueCell.create(props.celShaded),
            dXrayShaded: mol_util_1.ValueCell.create(props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off'),
        };
    }
    function createValuesSimple(directVolume, props, colorValue, sizeValue, transform) {
        const s = base_1.BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(DirectVolume.Params), ...props };
        return createValues(directVolume, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        base_1.BaseGeometry.updateValues(values, props);
        mol_util_1.ValueCell.updateIfChanged(values.dIgnoreLight, props.ignoreLight);
        mol_util_1.ValueCell.updateIfChanged(values.dCelShaded, props.celShaded);
        mol_util_1.ValueCell.updateIfChanged(values.dXrayShaded, props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off');
        const controlPoints = (0, transfer_function_1.getControlPointsFromVec2Array)(props.controlPoints);
        (0, transfer_function_1.createTransferFunctionTexture)(controlPoints, values.tTransferTex);
        mol_util_1.ValueCell.updateIfChanged(values.uMaxSteps, getMaxSteps(values.uGridDim.ref.value, props.stepsPerCell));
        mol_util_1.ValueCell.updateIfChanged(values.uStepScale, getStepScale(values.uCellDim.ref.value, props.stepsPerCell));
        mol_util_1.ValueCell.updateIfChanged(values.uTransferScale, getTransferScale(props.stepsPerCell));
        mol_util_1.ValueCell.updateIfChanged(values.uJumpLength, props.jumpLength);
    }
    function updateBoundingSphere(values, directVolume) {
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(directVolume.boundingSphere);
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
        state.writeDepth = false;
        return state;
    }
    function updateRenderableState(state, props) {
        base_1.BaseGeometry.updateRenderableState(state, props);
        state.opaque = false;
        state.writeDepth = false;
    }
})(DirectVolume || (exports.DirectVolume = DirectVolume = {}));
//
function getBoundingSphere(gridDimension, gridTransform) {
    return geometry_1.Sphere3D.fromDimensionsAndTransform((0, geometry_1.Sphere3D)(), gridDimension, gridTransform);
}
