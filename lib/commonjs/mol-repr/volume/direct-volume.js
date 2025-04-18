"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectVolumeRepresentationProvider = exports.DirectVolumeParams = void 0;
exports.createDirectVolume2d = createDirectVolume2d;
exports.createDirectVolume3d = createDirectVolume3d;
exports.createDirectVolume = createDirectVolume;
exports.getDirectVolumeLoci = getDirectVolumeLoci;
exports.eachDirectVolume = eachDirectVolume;
exports.getDirectVolumeParams = getDirectVolumeParams;
exports.DirectVolumeVisual = DirectVolumeVisual;
exports.DirectVolumeRepresentation = DirectVolumeRepresentation;
const param_definition_1 = require("../../mol-util/param-definition");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const geometry_1 = require("../../mol-math/geometry");
const volume_1 = require("../../mol-model/volume");
const direct_volume_1 = require("../../mol-geo/geometry/direct-volume/direct-volume");
const representation_1 = require("./representation");
const location_iterator_1 = require("../../mol-geo/util/location-iterator");
const location_1 = require("../../mol-model/location");
const int_1 = require("../../mol-data/int");
const loci_1 = require("../../mol-model/loci");
const util_1 = require("./util");
function getBoundingBox(gridDimension, transform) {
    const bbox = (0, geometry_1.Box3D)();
    geometry_1.Box3D.add(bbox, gridDimension);
    geometry_1.Box3D.transform(bbox, bbox, transform);
    return bbox;
}
// 2d volume texture
function createDirectVolume2d(ctx, webgl, volume, props, directVolume) {
    const gridDimension = volume.grid.cells.space.dimensions;
    const { width, height } = (0, util_1.getVolumeTexture2dLayout)(gridDimension);
    if (Math.max(width, height) > webgl.maxTextureSize / 2) {
        throw new Error('volume too large for direct-volume rendering');
    }
    const dataType = props.dataType === 'halfFloat' && !webgl.extensions.textureHalfFloat ? 'float' : props.dataType;
    const textureImage = (0, util_1.createVolumeTexture2d)(volume, 'normals', 0, dataType);
    // debugTexture(createImageData(textureImage.array, textureImage.width, textureImage.height), 1/3)
    const transform = volume_1.Grid.getGridToCartesianTransform(volume.grid);
    const bbox = getBoundingBox(gridDimension, transform);
    let texture;
    if (directVolume && directVolume.dataType.ref.value === dataType) {
        texture = directVolume.gridTexture.ref.value;
    }
    else {
        texture = dataType === 'byte'
            ? webgl.resources.texture('image-uint8', 'rgba', 'ubyte', 'linear')
            : dataType === 'halfFloat'
                ? webgl.resources.texture('image-float16', 'rgba', 'fp16', 'linear')
                : webgl.resources.texture('image-float32', 'rgba', 'float', 'linear');
    }
    texture.load(textureImage);
    const { unitToCartn, cellDim } = getUnitToCartn(volume.grid);
    const axisOrder = volume.grid.cells.space.axisOrderSlowToFast;
    return direct_volume_1.DirectVolume.create(bbox, gridDimension, transform, unitToCartn, cellDim, texture, volume.grid.stats, false, axisOrder, dataType, directVolume);
}
// 3d volume texture
function getUnitToCartn(grid) {
    if (grid.transform.kind === 'matrix') {
        return {
            unitToCartn: linear_algebra_1.Mat4.mul((0, linear_algebra_1.Mat4)(), grid.transform.matrix, linear_algebra_1.Mat4.fromScaling((0, linear_algebra_1.Mat4)(), grid.cells.space.dimensions)),
            cellDim: linear_algebra_1.Mat4.getScaling((0, linear_algebra_1.Vec3)(), grid.transform.matrix)
        };
    }
    const box = grid.transform.fractionalBox;
    const size = geometry_1.Box3D.size((0, linear_algebra_1.Vec3)(), box);
    return {
        unitToCartn: linear_algebra_1.Mat4.mul3((0, linear_algebra_1.Mat4)(), grid.transform.cell.fromFractional, linear_algebra_1.Mat4.fromTranslation((0, linear_algebra_1.Mat4)(), box.min), linear_algebra_1.Mat4.fromScaling((0, linear_algebra_1.Mat4)(), size)),
        cellDim: linear_algebra_1.Vec3.div((0, linear_algebra_1.Vec3)(), grid.transform.cell.size, grid.cells.space.dimensions)
    };
}
function createDirectVolume3d(ctx, webgl, volume, props, directVolume) {
    const gridDimension = volume.grid.cells.space.dimensions;
    if (Math.max(...gridDimension) > webgl.max3dTextureSize / 2) {
        throw new Error('volume too large for direct-volume rendering');
    }
    const dataType = props.dataType === 'halfFloat' && !webgl.extensions.textureHalfFloat ? 'float' : props.dataType;
    const textureVolume = (0, util_1.createVolumeTexture3d)(volume, dataType);
    const transform = volume_1.Grid.getGridToCartesianTransform(volume.grid);
    const bbox = getBoundingBox(gridDimension, transform);
    let texture;
    if (directVolume && directVolume.dataType.ref.value === dataType) {
        texture = directVolume.gridTexture.ref.value;
    }
    else {
        texture = dataType === 'byte'
            ? webgl.resources.texture('volume-uint8', 'rgba', 'ubyte', 'linear')
            : dataType === 'halfFloat'
                ? webgl.resources.texture('volume-float16', 'rgba', 'fp16', 'linear')
                : webgl.resources.texture('volume-float32', 'rgba', 'float', 'linear');
    }
    texture.load(textureVolume);
    const { unitToCartn, cellDim } = getUnitToCartn(volume.grid);
    const axisOrder = volume.grid.cells.space.axisOrderSlowToFast;
    return direct_volume_1.DirectVolume.create(bbox, gridDimension, transform, unitToCartn, cellDim, texture, volume.grid.stats, false, axisOrder, dataType, directVolume);
}
//
async function createDirectVolume(ctx, volume, key, theme, props, directVolume) {
    const { runtime, webgl } = ctx;
    if (webgl === undefined)
        throw new Error('DirectVolumeVisual requires `webgl` in VisualContext');
    return webgl.isWebGL2 ?
        createDirectVolume3d(runtime, webgl, volume, props, directVolume) :
        createDirectVolume2d(runtime, webgl, volume, props, directVolume);
}
function getLoci(volume, props) {
    return volume_1.Volume.Loci(volume);
}
function getDirectVolumeLoci(pickingId, volume, key, props, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        return volume_1.Volume.Cell.Loci(volume, int_1.Interval.ofSingleton(groupId));
    }
    return loci_1.EmptyLoci;
}
function eachDirectVolume(loci, volume, key, props, apply) {
    return (0, util_1.eachVolumeLoci)(loci, volume, undefined, apply);
}
//
exports.DirectVolumeParams = {
    ...direct_volume_1.DirectVolume.Params,
    quality: { ...direct_volume_1.DirectVolume.Params.quality, isEssential: false },
    dataType: param_definition_1.ParamDefinition.Select('byte', param_definition_1.ParamDefinition.arrayToOptions(['byte', 'float', 'halfFloat'])),
};
function getDirectVolumeParams(ctx, volume) {
    const params = param_definition_1.ParamDefinition.clone(exports.DirectVolumeParams);
    params.controlPoints.getVolume = () => volume;
    return params;
}
function DirectVolumeVisual(materialId) {
    return (0, representation_1.VolumeVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.DirectVolumeParams),
        createGeometry: createDirectVolume,
        createLocationIterator: (volume) => (0, location_iterator_1.LocationIterator)(volume.grid.cells.data.length, 1, 1, () => location_1.NullLocation),
        getLoci: getDirectVolumeLoci,
        eachLocation: eachDirectVolume,
        setUpdateState: (state, volume, newProps, currentProps) => {
            state.createGeometry = newProps.dataType !== currentProps.dataType;
        },
        geometryUtils: direct_volume_1.DirectVolume.Utils,
        dispose: (geometry) => {
            geometry.gridTexture.ref.value.destroy();
        },
    }, materialId);
}
function DirectVolumeRepresentation(ctx, getParams) {
    return (0, representation_1.VolumeRepresentation)('Direct Volume', ctx, getParams, DirectVolumeVisual, getLoci);
}
exports.DirectVolumeRepresentationProvider = (0, representation_1.VolumeRepresentationProvider)({
    name: 'direct-volume',
    label: 'Direct Volume',
    description: 'Direct rendering of volumetric data.',
    factory: DirectVolumeRepresentation,
    getParams: getDirectVolumeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.DirectVolumeParams),
    defaultColorTheme: { name: 'volume-value' },
    defaultSizeTheme: { name: 'uniform' },
    locationKinds: ['position-location', 'direct-location'],
    isApplicable: (volume) => !volume_1.Volume.isEmpty(volume) && !volume_1.Volume.Segmentation.get(volume)
});
