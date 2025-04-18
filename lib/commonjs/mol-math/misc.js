"use strict";
/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PiDiv180 = exports.halfPI = void 0;
exports.degToRad = degToRad;
exports.radToDeg = radToDeg;
exports.isPowerOfTwo = isPowerOfTwo;
exports.absMax = absMax;
exports.arcLength = arcLength;
exports.spiral2d = spiral2d;
exports.halfPI = Math.PI / 2;
exports.PiDiv180 = Math.PI / 180;
function degToRad(deg) {
    return deg * exports.PiDiv180; // deg * Math.PI / 180
}
function radToDeg(rad) {
    return rad / exports.PiDiv180; // rad * 180 / Math.PI
}
function isPowerOfTwo(x) {
    return (x !== 0) && (x & (x - 1)) === 0;
}
/** return the value that has the largest absolute value */
function absMax(...values) {
    let max = 0;
    let absMax = 0;
    for (let i = 0, il = values.length; i < il; ++i) {
        const value = values[i];
        const abs = Math.abs(value);
        if (abs > absMax) {
            max = value;
            absMax = abs;
        }
    }
    return max;
}
/** Length of an arc with angle in radians */
function arcLength(angle, radius) {
    return angle * radius;
}
/** Create an outward spiral of given `radius` on a 2d grid */
function spiral2d(radius) {
    let x = 0;
    let y = 0;
    let deltaX = 0;
    let deltaY = -1;
    const size = radius * 2 + 1;
    const halfSize = size / 2;
    const out = [];
    for (let i = Math.pow(size, 2); i > 0; --i) {
        if ((-halfSize < x && x <= halfSize) && (-halfSize < y && y <= halfSize)) {
            out.push([x, y]);
        }
        if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
            // change direction
            const prevDeltaX = deltaX;
            const prevDeltaY = deltaY;
            deltaX = -prevDeltaY;
            deltaY = prevDeltaX;
        }
        x += deltaX;
        y += deltaY;
    }
    return out;
}
