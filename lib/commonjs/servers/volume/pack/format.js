"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignSliceBuffer = assignSliceBuffer;
exports.compareHeaders = compareHeaders;
exports.getProviderFromType = getProviderFromType;
exports.open = open;
const ccp4_1 = require("./format/ccp4");
const typed_array_1 = require("../../../mol-io/common/typed-array");
const dsn6_1 = require("./format/dsn6");
const file_handle_1 = require("../../common/file-handle");
function assignSliceBuffer(data, blockSizeInMB) {
    const { extent, valueType } = data.header;
    const maxBlockBytes = blockSizeInMB * 1024 * 1024;
    const sliceSize = extent[0] * extent[1] * (0, typed_array_1.getElementByteSize)(valueType);
    const sliceCapacity = Math.max(1, Math.floor(Math.min(maxBlockBytes, sliceSize * extent[2]) / sliceSize));
    const buffer = (0, typed_array_1.createTypedArrayBufferContext)(sliceCapacity * extent[0] * extent[1], valueType);
    data.slices = {
        buffer,
        maxBlockBytes,
        sliceCapacity,
        slicesRead: 0,
        values: buffer.values,
        sliceCount: 0,
        isFinished: false
    };
}
function compareProp(a, b) {
    if (a instanceof Array && b instanceof Array) {
        if (a.length !== b.length)
            return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i])
                return false;
        }
        return true;
    }
    return a === b;
}
function compareHeaders(a, b) {
    for (const p of ['grid', 'axisOrder', 'extent', 'origin', 'spacegroupNumber', 'cellSize', 'cellAngles', 'mode']) {
        if (!compareProp(a[p], b[p]))
            return false;
    }
    return true;
}
function getProviderFromType(type) {
    switch (type) {
        case 'ccp4': return ccp4_1.Ccp4Provider;
        case 'dsn6': return dsn6_1.Dsn6Provider;
    }
}
async function open(name, filename, type) {
    const provider = getProviderFromType(type);
    const file = await (0, file_handle_1.fileHandleFromPathOrUrl)(filename, filename);
    const header = await provider.readHeader(name, file);
    const data = { header, file, slices: void 0 };
    return { data, provider };
}
