"use strict";
/**
 * Copyright (c) 2020-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.eachVolumeLoci = eachVolumeLoci;
exports.createVolumeCellLocationIterator = createVolumeCellLocationIterator;
exports.getVolumeTexture2dLayout = getVolumeTexture2dLayout;
exports.createVolumeTexture2d = createVolumeTexture2d;
exports.createVolumeTexture3d = createVolumeTexture3d;
exports.createSegmentTexture2d = createSegmentTexture2d;
const volume_1 = require("../../mol-model/volume");
const int_1 = require("../../mol-data/int");
const common_1 = require("../../mol-math/linear-algebra/3d/common");
const vec3_1 = require("../../mol-math/linear-algebra/3d/vec3");
const number_packing_1 = require("../../mol-util/number-packing");
const set_1 = require("../../mol-util/set");
const geometry_1 = require("../../mol-math/geometry");
const number_conversion_1 = require("../../mol-util/number-conversion");
const interpolate_1 = require("../../mol-math/interpolate");
const location_iterator_1 = require("../../mol-geo/util/location-iterator");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3set = vec3_1.Vec3.set;
const v3normalize = vec3_1.Vec3.normalize;
const v3sub = vec3_1.Vec3.sub;
const v3addScalar = vec3_1.Vec3.addScalar;
const v3scale = vec3_1.Vec3.scale;
const v3toArray = vec3_1.Vec3.toArray;
function eachVolumeLoci(loci, volume, props, apply) {
    let changed = false;
    if (volume_1.Volume.isLoci(loci)) {
        if (!volume_1.Volume.areEquivalent(loci.volume, volume))
            return false;
        if (apply(int_1.Interval.ofLength(volume.grid.cells.data.length)))
            changed = true;
    }
    else if (volume_1.Volume.Isosurface.isLoci(loci)) {
        if (!volume_1.Volume.areEquivalent(loci.volume, volume))
            return false;
        if (props === null || props === void 0 ? void 0 : props.isoValue) {
            if (!volume_1.Volume.IsoValue.areSame(loci.isoValue, props.isoValue, volume.grid.stats))
                return false;
            if (apply(int_1.Interval.ofLength(volume.grid.cells.data.length)))
                changed = true;
        }
        else {
            const { stats, cells: { data } } = volume.grid;
            const eps = stats.sigma;
            const v = volume_1.Volume.IsoValue.toAbsolute(loci.isoValue, stats).absoluteValue;
            for (let i = 0, il = data.length; i < il; ++i) {
                if ((0, common_1.equalEps)(v, data[i], eps)) {
                    if (apply(int_1.Interval.ofSingleton(i)))
                        changed = true;
                }
            }
        }
    }
    else if (volume_1.Volume.Cell.isLoci(loci)) {
        if (!volume_1.Volume.areEquivalent(loci.volume, volume))
            return false;
        if (int_1.Interval.is(loci.indices)) {
            if (apply(loci.indices))
                changed = true;
        }
        else {
            int_1.OrderedSet.forEach(loci.indices, v => {
                if (apply(int_1.Interval.ofSingleton(v)))
                    changed = true;
            });
        }
    }
    else if (volume_1.Volume.Segment.isLoci(loci)) {
        if (!volume_1.Volume.areEquivalent(loci.volume, volume))
            return false;
        if (props === null || props === void 0 ? void 0 : props.segments) {
            if (!int_1.SortedArray.areIntersecting(loci.segments, props.segments))
                return false;
            if (apply(int_1.Interval.ofLength(volume.grid.cells.data.length)))
                changed = true;
        }
        else {
            const segmentation = volume_1.Volume.Segmentation.get(volume);
            if (segmentation) {
                const set = new Set();
                for (let i = 0, il = loci.segments.length; i < il; ++i) {
                    set_1.SetUtils.add(set, segmentation.segments.get(loci.segments[i]));
                }
                const s = Array.from(set.values());
                const d = volume.grid.cells.data;
                for (let i = 0, il = d.length; i < il; ++i) {
                    if (s.includes(d[i])) {
                        if (apply(int_1.Interval.ofSingleton(i)))
                            changed = true;
                    }
                }
            }
        }
    }
    return changed;
}
function createVolumeCellLocationIterator(volume) {
    const [xn, yn, zn] = volume.grid.cells.space.dimensions;
    const groupCount = xn * yn * zn;
    const instanceCount = 1;
    const location = volume_1.Volume.Cell.Location(volume);
    const getLocation = (groupIndex, _instanceIndex) => {
        location.cell = groupIndex;
        return location;
    };
    return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation);
}
//
function getVolumeTexture2dLayout(dim, padding = 0) {
    const area = dim[0] * dim[1] * dim[2];
    const squareDim = Math.sqrt(area);
    const powerOfTwoSize = Math.pow(2, Math.ceil(Math.log(squareDim) / Math.log(2)));
    let width = dim[0] + padding;
    let height = dim[1] + padding;
    let rows = 1;
    let columns = width;
    if (powerOfTwoSize < width * dim[2]) {
        columns = Math.floor(powerOfTwoSize / width);
        rows = Math.ceil(dim[2] / columns);
        width *= columns;
        height *= rows;
    }
    else {
        width *= dim[2];
    }
    return { width, height, columns, rows, powerOfTwoSize: height < powerOfTwoSize ? powerOfTwoSize : powerOfTwoSize * 2 };
}
function createVolumeTexture2d(volume, variant, padding = 0, type = 'byte') {
    const { cells: { space, data }, stats: { max, min } } = volume.grid;
    const dim = space.dimensions;
    const { dataOffset: o } = space;
    const { width, height } = getVolumeTexture2dLayout(dim, padding);
    const itemSize = variant === 'data' ? 1 : 4;
    const array = type === 'byte'
        ? new Uint8Array(width * height * itemSize)
        : type === 'halfFloat'
            ? new Uint16Array(width * height * itemSize)
            : new Float32Array(width * height * itemSize);
    const textureImage = { array, width, height };
    const diff = max - min;
    const [xn, yn, zn] = dim;
    const xnp = xn + padding;
    const ynp = yn + padding;
    const n0 = (0, vec3_1.Vec3)();
    const n1 = (0, vec3_1.Vec3)();
    const xn1 = xn - 1;
    const yn1 = yn - 1;
    const zn1 = zn - 1;
    for (let z = 0; z < zn; ++z) {
        for (let y = 0; y < yn; ++y) {
            for (let x = 0; x < xn; ++x) {
                const column = Math.floor(((z * xnp) % width) / xnp);
                const row = Math.floor((z * xnp) / width);
                const px = column * xnp + x;
                const index = itemSize * ((row * ynp * width) + (y * width) + px);
                const offset = o(x, y, z);
                let value;
                if (type === 'byte') {
                    value = Math.round(((data[offset] - min) / diff) * 255);
                }
                else if (type === 'halfFloat') {
                    value = (0, number_conversion_1.toHalfFloat)((data[offset] - min) / diff);
                }
                else {
                    value = (data[offset] - min) / diff;
                }
                if (variant === 'data') {
                    array[index] = value;
                }
                else {
                    if (variant === 'groups') {
                        if (type === 'halfFloat') {
                            let group = (0, interpolate_1.clamp)(Math.round(offset), 0, 16777216 - 1) + 1;
                            array[index + 2] = (0, number_conversion_1.toHalfFloat)(group % 256);
                            group = Math.floor(group / 256);
                            array[index + 1] = (0, number_conversion_1.toHalfFloat)(group % 256);
                            group = Math.floor(group / 256);
                            array[index] = (0, number_conversion_1.toHalfFloat)(group % 256);
                        }
                        else {
                            (0, number_packing_1.packIntToRGBArray)(offset, array, index);
                        }
                    }
                    else {
                        v3set(n0, data[o(Math.max(0, x - 1), y, z)], data[o(x, Math.max(0, y - 1), z)], data[o(x, y, Math.max(0, z - 1))]);
                        v3set(n1, data[o(Math.min(xn1, x + 1), y, z)], data[o(x, Math.min(yn1, y + 1), z)], data[o(x, y, Math.min(zn1, z + 1))]);
                        v3normalize(n0, v3sub(n0, n0, n1));
                        v3addScalar(n0, v3scale(n0, n0, 0.5), 0.5);
                        if (type === 'byte') {
                            v3toArray(v3scale(n0, n0, 255), array, index);
                        }
                        else if (type === 'halfFloat') {
                            array[index] = (0, number_conversion_1.toHalfFloat)(n0[0]);
                            array[index + 1] = (0, number_conversion_1.toHalfFloat)(n0[1]);
                            array[index + 2] = (0, number_conversion_1.toHalfFloat)(n0[2]);
                        }
                        else {
                            v3toArray(n0, array, index);
                        }
                    }
                    array[index + 3] = value;
                }
            }
        }
    }
    return textureImage;
}
function createVolumeTexture3d(volume, type = 'byte') {
    const { cells: { space, data }, stats: { max, min } } = volume.grid;
    const [width, height, depth] = space.dimensions;
    const { dataOffset: o } = space;
    const array = type === 'byte'
        ? new Uint8Array(width * height * depth * 4)
        : type === 'halfFloat'
            ? new Uint16Array(width * height * depth * 4)
            : new Float32Array(width * height * depth * 4);
    const textureVolume = { array, width, height, depth };
    const diff = max - min;
    const n0 = (0, vec3_1.Vec3)();
    const n1 = (0, vec3_1.Vec3)();
    const width1 = width - 1;
    const height1 = height - 1;
    const depth1 = depth - 1;
    let i = 0;
    for (let z = 0; z < depth; ++z) {
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const offset = o(x, y, z);
                v3set(n0, data[o(Math.max(0, x - 1), y, z)], data[o(x, Math.max(0, y - 1), z)], data[o(x, y, Math.max(0, z - 1))]);
                v3set(n1, data[o(Math.min(width1, x + 1), y, z)], data[o(x, Math.min(height1, y + 1), z)], data[o(x, y, Math.min(depth1, z + 1))]);
                v3normalize(n0, v3sub(n0, n0, n1));
                v3addScalar(n0, v3scale(n0, n0, 0.5), 0.5);
                if (type === 'byte') {
                    v3toArray(v3scale(n0, n0, 255), array, i);
                    array[i + 3] = Math.round(((data[offset] - min) / diff) * 255);
                }
                else if (type === 'halfFloat') {
                    array[i] = (0, number_conversion_1.toHalfFloat)(n0[0]);
                    array[i + 1] = (0, number_conversion_1.toHalfFloat)(n0[1]);
                    array[i + 2] = (0, number_conversion_1.toHalfFloat)(n0[2]);
                    array[i + 3] = (0, number_conversion_1.toHalfFloat)((data[offset] - min) / diff);
                }
                else {
                    v3toArray(n0, array, i);
                    array[i + 3] = (data[offset] - min) / diff;
                }
                i += 4;
            }
        }
    }
    return textureVolume;
}
function createSegmentTexture2d(volume, set, bbox, padding = 0) {
    const data = volume.grid.cells.data;
    const dim = geometry_1.Box3D.size((0, vec3_1.Vec3)(), bbox);
    const o = volume.grid.cells.space.dataOffset;
    const { width, height } = getVolumeTexture2dLayout(dim, padding);
    const itemSize = 1;
    const array = new Uint8Array(width * height * itemSize);
    const textureImage = { array, width, height };
    const [xn, yn, zn] = dim;
    const xn1 = xn - 1;
    const yn1 = yn - 1;
    const zn1 = zn - 1;
    const xnp = xn + padding;
    const ynp = yn + padding;
    const [minx, miny, minz] = bbox.min;
    const [maxx, maxy, maxz] = bbox.max;
    for (let z = 0; z < zn; ++z) {
        for (let y = 0; y < yn; ++y) {
            for (let x = 0; x < xn; ++x) {
                const column = Math.floor(((z * xnp) % width) / xnp);
                const row = Math.floor((z * xnp) / width);
                const px = column * xnp + x;
                const index = itemSize * ((row * ynp * width) + (y * width) + px);
                const v0 = set.includes(data[o(x + minx, y + miny, z + minz)]) ? 255 : 0;
                const xp = set.includes(data[o(Math.min(xn1 + maxx, x + 1 + minx), y + miny, z + minz)]) ? 255 : 0;
                const xn = set.includes(data[o(Math.max(0, x - 1 + minx), y + miny, z + minz)]) ? 255 : 0;
                const yp = set.includes(data[o(x + minx, Math.min(yn1 + maxy, y + 1 + miny), z + minz)]) ? 255 : 0;
                const yn = set.includes(data[o(x + minx, Math.max(0, y - 1 + miny), z + minz)]) ? 255 : 0;
                const zp = set.includes(data[o(x + minx, y + miny, Math.min(zn1 + maxz, z + 1 + minz))]) ? 255 : 0;
                const zn = set.includes(data[o(x + minx, y + miny, Math.max(0, z - 1 + minz))]) ? 255 : 0;
                array[index] = Math.round((v0 + v0 + xp + xn + yp + yn + zp + zn) / 8);
            }
        }
    }
    return textureImage;
}
