/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { hashFnv32a } from '../../../mol-data/util';
import { LocationIterator, PositionLocation } from '../../../mol-geo/util/location-iterator';
import { calculateTransformBoundingSphere } from '../../../mol-gl/renderable/util';
import { createNullTexture } from '../../../mol-gl/webgl/texture';
import { Box3D, Sphere3D } from '../../../mol-math/geometry';
import { Mat4, Vec2, Vec3, Vec4 } from '../../../mol-math/linear-algebra';
import { ValueCell } from '../../../mol-util';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Box } from '../../primitive/box';
import { BaseGeometry } from '../base';
import { createColors } from '../color-data';
import { createMarkers } from '../marker-data';
import { createEmptyOverpaint } from '../overpaint-data';
import { createEmptyTransparency } from '../transparency-data';
import { createTransferFunctionTexture, getControlPointsFromVec2Array } from './transfer-function';
import { createEmptyClipping } from '../clipping-data';
import { Grid } from '../../../mol-model/volume';
import { createEmptySubstance } from '../substance-data';
import { createEmptyEmissive } from '../emissive-data';
const VolumeBox = Box();
export var DirectVolume;
(function (DirectVolume) {
    function create(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, dataType, directVolume) {
        return directVolume ?
            update(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, dataType, directVolume) :
            fromData(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, dataType);
    }
    DirectVolume.create = create;
    function hashCode(directVolume) {
        return hashFnv32a([
            directVolume.bboxSize.ref.version, directVolume.gridDimension.ref.version,
            directVolume.gridTexture.ref.version, directVolume.transform.ref.version,
            directVolume.gridStats.ref.version
        ]);
    }
    function fromData(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, dataType) {
        const boundingSphere = Sphere3D();
        let currentHash = -1;
        const width = texture.getWidth();
        const height = texture.getHeight();
        const depth = texture.getDepth();
        const directVolume = {
            kind: 'direct-volume',
            gridDimension: ValueCell.create(gridDimension),
            gridTexture: ValueCell.create(texture),
            gridTextureDim: ValueCell.create(Vec3.create(width, height, depth)),
            gridStats: ValueCell.create(Vec4.create(stats.min, stats.max, stats.mean, stats.sigma)),
            bboxMin: ValueCell.create(bbox.min),
            bboxMax: ValueCell.create(bbox.max),
            bboxSize: ValueCell.create(Vec3.sub(Vec3(), bbox.max, bbox.min)),
            transform: ValueCell.create(transform),
            cellDim: ValueCell.create(cellDim),
            unitToCartn: ValueCell.create(unitToCartn),
            cartnToUnit: ValueCell.create(Mat4.invert(Mat4(), unitToCartn)),
            get boundingSphere() {
                const newHash = hashCode(directVolume);
                if (newHash !== currentHash) {
                    const b = getBoundingSphere(directVolume.gridDimension.ref.value, directVolume.transform.ref.value);
                    Sphere3D.copy(boundingSphere, b);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            packedGroup: ValueCell.create(packedGroup),
            axisOrder: ValueCell.create(axisOrder),
            dataType: ValueCell.create(dataType),
            setBoundingSphere(sphere) {
                Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(directVolume);
            }
        };
        return directVolume;
    }
    function update(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, dataType, directVolume) {
        const width = texture.getWidth();
        const height = texture.getHeight();
        const depth = texture.getDepth();
        ValueCell.update(directVolume.gridDimension, gridDimension);
        ValueCell.update(directVolume.gridTexture, texture);
        ValueCell.update(directVolume.gridTextureDim, Vec3.set(directVolume.gridTextureDim.ref.value, width, height, depth));
        ValueCell.update(directVolume.gridStats, Vec4.set(directVolume.gridStats.ref.value, stats.min, stats.max, stats.mean, stats.sigma));
        ValueCell.update(directVolume.bboxMin, bbox.min);
        ValueCell.update(directVolume.bboxMax, bbox.max);
        ValueCell.update(directVolume.bboxSize, Vec3.sub(directVolume.bboxSize.ref.value, bbox.max, bbox.min));
        ValueCell.update(directVolume.transform, transform);
        ValueCell.update(directVolume.cellDim, cellDim);
        ValueCell.update(directVolume.unitToCartn, unitToCartn);
        ValueCell.update(directVolume.cartnToUnit, Mat4.invert(Mat4(), unitToCartn));
        ValueCell.updateIfChanged(directVolume.packedGroup, packedGroup);
        ValueCell.updateIfChanged(directVolume.axisOrder, Vec3.fromArray(directVolume.axisOrder.ref.value, axisOrder, 0));
        ValueCell.updateIfChanged(directVolume.dataType, dataType);
        return directVolume;
    }
    function createEmpty(directVolume) {
        const bbox = Box3D();
        const gridDimension = Vec3();
        const transform = Mat4.identity();
        const unitToCartn = Mat4.identity();
        const cellDim = Vec3();
        const texture = createNullTexture();
        const stats = Grid.One.stats;
        const packedGroup = false;
        const axisOrder = Vec3.create(0, 1, 2);
        const dataType = 'byte';
        return create(bbox, gridDimension, transform, unitToCartn, cellDim, texture, stats, packedGroup, axisOrder, dataType, directVolume);
    }
    DirectVolume.createEmpty = createEmpty;
    DirectVolume.Params = {
        ...BaseGeometry.Params,
        ignoreLight: PD.Boolean(false, BaseGeometry.ShadingCategory),
        celShaded: PD.Boolean(false, BaseGeometry.ShadingCategory),
        xrayShaded: PD.Select(false, [[false, 'Off'], [true, 'On'], ['inverted', 'Inverted']], BaseGeometry.ShadingCategory),
        controlPoints: PD.LineGraph([
            Vec2.create(0.19, 0.0), Vec2.create(0.2, 0.05), Vec2.create(0.25, 0.05), Vec2.create(0.26, 0.0),
            Vec2.create(0.79, 0.0), Vec2.create(0.8, 0.05), Vec2.create(0.85, 0.05), Vec2.create(0.86, 0.0),
        ], { isEssential: true }),
        stepsPerCell: PD.Numeric(3, { min: 1, max: 10, step: 1 }),
        jumpLength: PD.Numeric(0, { min: 0, max: 20, step: 0.1 }),
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
        const location = PositionLocation();
        const p = location.position;
        const m = transform.aTransform.ref.value;
        const getLocation = (groupIndex, instanceIndex) => {
            const k = Math.floor(groupIndex / z);
            p[0] = Math.floor(k / y);
            p[1] = k % y;
            p[2] = groupIndex % z;
            Vec3.transformMat4(p, p, t);
            if (instanceIndex >= 0) {
                Vec3.transformMat4Offset(p, p, m, 0, 0, instanceIndex * 16);
            }
            return location;
        };
        return LocationIterator(groupCount, instanceCount, 1, getLocation);
    }
    function getMaxSteps(gridDim, stepsPerCell) {
        return Math.ceil(Vec3.magnitude(gridDim) * stepsPerCell);
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
        const color = createColors(locationIt, positionIt, theme.color);
        const marker = props.instanceGranularity
            ? createMarkers(instanceCount, 'instance')
            : createMarkers(instanceCount * groupCount, 'groupInstance');
        const overpaint = createEmptyOverpaint();
        const transparency = createEmptyTransparency();
        const emissive = createEmptyEmissive();
        const material = createEmptySubstance();
        const clipping = createEmptyClipping();
        const [x, y, z] = gridDimension.ref.value;
        const counts = { drawCount: VolumeBox.indices.length, vertexCount: x * y * z, groupCount, instanceCount };
        const invariantBoundingSphere = Sphere3D.clone(directVolume.boundingSphere);
        const boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        const controlPoints = getControlPointsFromVec2Array(props.controlPoints);
        const transferTex = createTransferFunctionTexture(controlPoints);
        return {
            dGeometryType: ValueCell.create('directVolume'),
            ...color,
            ...marker,
            ...overpaint,
            ...transparency,
            ...emissive,
            ...material,
            ...clipping,
            ...transform,
            ...BaseGeometry.createValues(props, counts),
            aPosition: ValueCell.create(VolumeBox.vertices),
            elements: ValueCell.create(VolumeBox.indices),
            boundingSphere: ValueCell.create(boundingSphere),
            invariantBoundingSphere: ValueCell.create(invariantBoundingSphere),
            uInvariantBoundingSphere: ValueCell.create(Vec4.ofSphere(invariantBoundingSphere)),
            uBboxMin: bboxMin,
            uBboxMax: bboxMax,
            uBboxSize: bboxSize,
            uMaxSteps: ValueCell.create(getMaxSteps(gridDimension.ref.value, props.stepsPerCell)),
            uStepScale: ValueCell.create(getStepScale(directVolume.cellDim.ref.value, props.stepsPerCell)),
            uJumpLength: ValueCell.create(props.jumpLength),
            uTransform: gridTransform,
            uGridDim: gridDimension,
            tTransferTex: transferTex,
            uTransferScale: ValueCell.create(getTransferScale(props.stepsPerCell)),
            dGridTexType: ValueCell.create(gridTexture.ref.value.getDepth() > 0 ? '3d' : '2d'),
            uGridTexDim: gridTextureDim,
            tGridTex: gridTexture,
            uGridStats: gridStats,
            uCellDim: directVolume.cellDim,
            uCartnToUnit: directVolume.cartnToUnit,
            uUnitToCartn: directVolume.unitToCartn,
            dPackedGroup: directVolume.packedGroup,
            dAxisOrder: ValueCell.create(directVolume.axisOrder.ref.value.join('')),
            dIgnoreLight: ValueCell.create(props.ignoreLight),
            dCelShaded: ValueCell.create(props.celShaded),
            dXrayShaded: ValueCell.create(props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off'),
        };
    }
    function createValuesSimple(directVolume, props, colorValue, sizeValue, transform) {
        const s = BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...PD.getDefaultValues(DirectVolume.Params), ...props };
        return createValues(directVolume, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        BaseGeometry.updateValues(values, props);
        ValueCell.updateIfChanged(values.dIgnoreLight, props.ignoreLight);
        ValueCell.updateIfChanged(values.dCelShaded, props.celShaded);
        ValueCell.updateIfChanged(values.dXrayShaded, props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off');
        const controlPoints = getControlPointsFromVec2Array(props.controlPoints);
        createTransferFunctionTexture(controlPoints, values.tTransferTex);
        ValueCell.updateIfChanged(values.uMaxSteps, getMaxSteps(values.uGridDim.ref.value, props.stepsPerCell));
        ValueCell.updateIfChanged(values.uStepScale, getStepScale(values.uCellDim.ref.value, props.stepsPerCell));
        ValueCell.updateIfChanged(values.uTransferScale, getTransferScale(props.stepsPerCell));
        ValueCell.updateIfChanged(values.uJumpLength, props.jumpLength);
    }
    function updateBoundingSphere(values, directVolume) {
        const invariantBoundingSphere = Sphere3D.clone(directVolume.boundingSphere);
        const boundingSphere = calculateTransformBoundingSphere(invariantBoundingSphere, values.aTransform.ref.value, values.instanceCount.ref.value, 0);
        if (!Sphere3D.equals(boundingSphere, values.boundingSphere.ref.value)) {
            ValueCell.update(values.boundingSphere, boundingSphere);
        }
        if (!Sphere3D.equals(invariantBoundingSphere, values.invariantBoundingSphere.ref.value)) {
            ValueCell.update(values.invariantBoundingSphere, invariantBoundingSphere);
            ValueCell.update(values.uInvariantBoundingSphere, Vec4.fromSphere(values.uInvariantBoundingSphere.ref.value, invariantBoundingSphere));
        }
    }
    function createRenderableState(props) {
        const state = BaseGeometry.createRenderableState(props);
        state.opaque = false;
        state.writeDepth = false;
        return state;
    }
    function updateRenderableState(state, props) {
        BaseGeometry.updateRenderableState(state, props);
        state.opaque = false;
        state.writeDepth = false;
    }
})(DirectVolume || (DirectVolume = {}));
//
function getBoundingSphere(gridDimension, gridTransform) {
    return Sphere3D.fromDimensionsAndTransform(Sphere3D(), gridDimension, gridTransform);
}
