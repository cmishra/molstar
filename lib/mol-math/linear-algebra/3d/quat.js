/**
 * Copyright (c) 2017-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/*
 * This code has been modified from https://github.com/toji/gl-matrix/,
 * copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 */
/*
 * Quat.fromUnitVec3 has been modified from https://github.com/Jam3/quat-from-unit-vec3,
 * copyright (c) 2015 Jam3. MIT License
 */
import { Mat3 } from './mat3';
import { Vec3 } from './vec3';
import { EPSILON } from './common';
import { assertUnreachable } from '../../../mol-util/type-helpers';
import { Mat4 } from './mat4';
function Quat() {
    return Quat.zero();
}
(function (Quat) {
    function zero() {
        // force double backing array by 0.1.
        const ret = [0.1, 0, 0, 0];
        ret[0] = 0.0;
        return ret;
    }
    Quat.zero = zero;
    function identity() {
        const out = zero();
        out[3] = 1;
        return out;
    }
    Quat.identity = identity;
    function setIdentity(out) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
    }
    Quat.setIdentity = setIdentity;
    function hasNaN(q) {
        return isNaN(q[0]) || isNaN(q[1]) || isNaN(q[2]) || isNaN(q[3]);
    }
    Quat.hasNaN = hasNaN;
    function create(x, y, z, w) {
        const out = identity();
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    }
    Quat.create = create;
    function setAxisAngle(out, axis, rad) {
        rad = rad * 0.5;
        const s = Math.sin(rad);
        out[0] = s * axis[0];
        out[1] = s * axis[1];
        out[2] = s * axis[2];
        out[3] = Math.cos(rad);
        return out;
    }
    Quat.setAxisAngle = setAxisAngle;
    /**
     * Gets the rotation axis and angle for a given
     *  quaternion. If a quaternion is created with
     *  setAxisAngle, this method will return the same
     *  values as providied in the original parameter list
     *  OR functionally equivalent values.
     * Example: The quaternion formed by axis [0, 0, 1] and
     *  angle -90 is the same as the quaternion formed by
     *  [0, 0, 1] and 270. This method favors the latter.
     */
    function getAxisAngle(out_axis, q) {
        const rad = Math.acos(q[3]) * 2.0;
        const s = Math.sin(rad / 2.0);
        if (s !== 0.0) {
            out_axis[0] = q[0] / s;
            out_axis[1] = q[1] / s;
            out_axis[2] = q[2] / s;
        }
        else {
            // If s is zero, return any axis (no rotation - axis does not matter)
            out_axis[0] = 1;
            out_axis[1] = 0;
            out_axis[2] = 0;
        }
        return rad;
    }
    Quat.getAxisAngle = getAxisAngle;
    function multiply(out, a, b) {
        const ax = a[0], ay = a[1], az = a[2], aw = a[3];
        const bx = b[0], by = b[1], bz = b[2], bw = b[3];
        out[0] = ax * bw + aw * bx + ay * bz - az * by;
        out[1] = ay * bw + aw * by + az * bx - ax * bz;
        out[2] = az * bw + aw * bz + ax * by - ay * bx;
        out[3] = aw * bw - ax * bx - ay * by - az * bz;
        return out;
    }
    Quat.multiply = multiply;
    function rotateX(out, a, rad) {
        rad *= 0.5;
        const ax = a[0], ay = a[1], az = a[2], aw = a[3];
        const bx = Math.sin(rad), bw = Math.cos(rad);
        out[0] = ax * bw + aw * bx;
        out[1] = ay * bw + az * bx;
        out[2] = az * bw - ay * bx;
        out[3] = aw * bw - ax * bx;
        return out;
    }
    Quat.rotateX = rotateX;
    function rotateY(out, a, rad) {
        rad *= 0.5;
        const ax = a[0], ay = a[1], az = a[2], aw = a[3];
        const by = Math.sin(rad), bw = Math.cos(rad);
        out[0] = ax * bw - az * by;
        out[1] = ay * bw + aw * by;
        out[2] = az * bw + ax * by;
        out[3] = aw * bw - ay * by;
        return out;
    }
    Quat.rotateY = rotateY;
    function rotateZ(out, a, rad) {
        rad *= 0.5;
        const ax = a[0], ay = a[1], az = a[2], aw = a[3];
        const bz = Math.sin(rad), bw = Math.cos(rad);
        out[0] = ax * bw + ay * bz;
        out[1] = ay * bw - ax * bz;
        out[2] = az * bw + aw * bz;
        out[3] = aw * bw - az * bz;
        return out;
    }
    Quat.rotateZ = rotateZ;
    /**
     * Calculates the W component of a quat from the X, Y, and Z components.
     * Assumes that quaternion is 1 unit in length.
     * Any existing W component will be ignored.
     */
    function calculateW(out, a) {
        const x = a[0], y = a[1], z = a[2];
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
        return out;
    }
    Quat.calculateW = calculateW;
    /**
     * Performs a spherical linear interpolation between two quat
     */
    function slerp(out, a, b, t) {
        // benchmarks:
        //    http://jsperf.com/quaternion-slerp-implementations
        const ax = a[0], ay = a[1], az = a[2], aw = a[3];
        let bx = b[0], by = b[1], bz = b[2], bw = b[3];
        let omega, cosom, sinom, scale0, scale1;
        // calc cosine
        cosom = ax * bx + ay * by + az * bz + aw * bw;
        // adjust signs (if necessary)
        if (cosom < 0.0) {
            cosom = -cosom;
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
        }
        // calculate coefficients
        if ((1.0 - cosom) > 0.000001) {
            // standard case (slerp)
            omega = Math.acos(cosom);
            sinom = Math.sin(omega);
            scale0 = Math.sin((1.0 - t) * omega) / sinom;
            scale1 = Math.sin(t * omega) / sinom;
        }
        else {
            // "from" and "to" quaternions are very close
            //  ... so we can do a linear interpolation
            scale0 = 1.0 - t;
            scale1 = t;
        }
        // calculate final values
        out[0] = scale0 * ax + scale1 * bx;
        out[1] = scale0 * ay + scale1 * by;
        out[2] = scale0 * az + scale1 * bz;
        out[3] = scale0 * aw + scale1 * bw;
        return out;
    }
    Quat.slerp = slerp;
    function invert(out, a) {
        const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
        const dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        const invDot = dot ? 1.0 / dot : 0;
        // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
        out[0] = -a0 * invDot;
        out[1] = -a1 * invDot;
        out[2] = -a2 * invDot;
        out[3] = a3 * invDot;
        return out;
    }
    Quat.invert = invert;
    /**
     * Calculates the conjugate of a quat
     * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
     */
    function conjugate(out, a) {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = a[3];
        return out;
    }
    Quat.conjugate = conjugate;
    function dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    }
    Quat.dot = dot;
    /**
     * Creates a quaternion from the given 3x3 rotation matrix.
     *
     * NOTE: The resultant quaternion is not normalized, so you should be sure
     * to renormalize the quaternion yourself where necessary.
     */
    function fromMat3(out, m) {
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".
        const fTrace = m[0] + m[4] + m[8];
        let fRoot;
        if (fTrace > 0.0) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0); // 2w
            out[3] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot; // 1/(4w)
            out[0] = (m[5] - m[7]) * fRoot;
            out[1] = (m[6] - m[2]) * fRoot;
            out[2] = (m[1] - m[3]) * fRoot;
        }
        else {
            // |w| <= 1/2
            let i = 0;
            if (m[4] > m[0])
                i = 1;
            if (m[8] > m[i * 3 + i])
                i = 2;
            const j = (i + 1) % 3;
            const k = (i + 2) % 3;
            fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
            out[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
            out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
            out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
        }
        return out;
    }
    Quat.fromMat3 = fromMat3;
    const m3tmp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    function fromMat4(out, m) {
        Mat3.fromMat4(m3tmp, m);
        return fromMat3(out, m3tmp);
    }
    Quat.fromMat4 = fromMat4;
    function fromEuler(out, euler, order) {
        const [x, y, z] = euler;
        // http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m
        const c1 = Math.cos(x / 2);
        const c2 = Math.cos(y / 2);
        const c3 = Math.cos(z / 2);
        const s1 = Math.sin(x / 2);
        const s2 = Math.sin(y / 2);
        const s3 = Math.sin(z / 2);
        switch (order) {
            case 'XYZ':
                out[0] = s1 * c2 * c3 + c1 * s2 * s3;
                out[1] = c1 * s2 * c3 - s1 * c2 * s3;
                out[2] = c1 * c2 * s3 + s1 * s2 * c3;
                out[3] = c1 * c2 * c3 - s1 * s2 * s3;
                break;
            case 'YXZ':
                out[0] = s1 * c2 * c3 + c1 * s2 * s3;
                out[1] = c1 * s2 * c3 - s1 * c2 * s3;
                out[2] = c1 * c2 * s3 - s1 * s2 * c3;
                out[3] = c1 * c2 * c3 + s1 * s2 * s3;
                break;
            case 'ZXY':
                out[0] = s1 * c2 * c3 - c1 * s2 * s3;
                out[1] = c1 * s2 * c3 + s1 * c2 * s3;
                out[2] = c1 * c2 * s3 + s1 * s2 * c3;
                out[3] = c1 * c2 * c3 - s1 * s2 * s3;
                break;
            case 'ZYX':
                out[0] = s1 * c2 * c3 - c1 * s2 * s3;
                out[1] = c1 * s2 * c3 + s1 * c2 * s3;
                out[2] = c1 * c2 * s3 - s1 * s2 * c3;
                out[3] = c1 * c2 * c3 + s1 * s2 * s3;
                break;
            case 'YZX':
                out[0] = s1 * c2 * c3 + c1 * s2 * s3;
                out[1] = c1 * s2 * c3 + s1 * c2 * s3;
                out[2] = c1 * c2 * s3 - s1 * s2 * c3;
                out[3] = c1 * c2 * c3 - s1 * s2 * s3;
                break;
            case 'XZY':
                out[0] = s1 * c2 * c3 - c1 * s2 * s3;
                out[1] = c1 * s2 * c3 - s1 * c2 * s3;
                out[2] = c1 * c2 * s3 + s1 * s2 * c3;
                out[3] = c1 * c2 * c3 + s1 * s2 * s3;
                break;
            default:
                assertUnreachable(order);
        }
        return out;
    }
    Quat.fromEuler = fromEuler;
    const fromUnitVec3Temp = [0, 0, 0];
    /** Quaternion from two normalized unit vectors. */
    function fromUnitVec3(out, a, b) {
        // assumes a and b are normalized
        let r = Vec3.dot(a, b) + 1;
        if (r < EPSILON) {
            // If u and v are exactly opposite, rotate 180 degrees
            // around an arbitrary orthogonal axis. Axis normalisation
            // can happen later, when we normalise the quaternion.
            r = 0;
            if (Math.abs(a[0]) > Math.abs(a[2])) {
                Vec3.set(fromUnitVec3Temp, -a[1], a[0], 0);
            }
            else {
                Vec3.set(fromUnitVec3Temp, 0, -a[2], a[1]);
            }
        }
        else {
            // Otherwise, build quaternion the standard way.
            Vec3.cross(fromUnitVec3Temp, a, b);
        }
        out[0] = fromUnitVec3Temp[0];
        out[1] = fromUnitVec3Temp[1];
        out[2] = fromUnitVec3Temp[2];
        out[3] = r;
        normalize(out, out);
        return out;
    }
    Quat.fromUnitVec3 = fromUnitVec3;
    const m4tmp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    function fromBasis(out, x, y, z) {
        Mat4.fromBasis(m4tmp, x, y, z);
        return fromMat4(out, m4tmp);
    }
    Quat.fromBasis = fromBasis;
    function clone(a) {
        const out = zero();
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    }
    Quat.clone = clone;
    function toArray(a, out, offset) {
        out[offset + 0] = a[0];
        out[offset + 1] = a[1];
        out[offset + 2] = a[2];
        out[offset + 3] = a[3];
        return out;
    }
    Quat.toArray = toArray;
    function fromArray(a, array, offset) {
        a[0] = array[offset + 0];
        a[1] = array[offset + 1];
        a[2] = array[offset + 2];
        a[3] = array[offset + 3];
        return a;
    }
    Quat.fromArray = fromArray;
    function copy(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    }
    Quat.copy = copy;
    function set(out, x, y, z, w) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    }
    Quat.set = set;
    /**
     * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
     */
    function exactEquals(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }
    Quat.exactEquals = exactEquals;
    /**
     * Returns whether or not the quaternions have approximately the same elements in the same position.
     */
    function equals(a, b) {
        const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
        const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)));
    }
    Quat.equals = equals;
    function add(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        return out;
    }
    Quat.add = add;
    function normalize(out, a) {
        const x = a[0];
        const y = a[1];
        const z = a[2];
        const w = a[3];
        let len = x * x + y * y + z * z + w * w;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out[0] = x * len;
            out[1] = y * len;
            out[2] = z * len;
            out[3] = w * len;
        }
        return out;
    }
    Quat.normalize = normalize;
    /**
     * Sets a quaternion to represent the shortest rotation from one
     * vector to another.
     *
     * Both vectors are assumed to be unit length.
     */
    const rotTmpVec3 = [0, 0, 0];
    const rotTmpVec3UnitX = [1, 0, 0];
    const rotTmpVec3UnitY = [0, 1, 0];
    function rotationTo(out, a, b) {
        const dot = Vec3.dot(a, b);
        if (dot < -0.999999) {
            Vec3.cross(rotTmpVec3, rotTmpVec3UnitX, a);
            if (Vec3.magnitude(rotTmpVec3) < 0.000001)
                Vec3.cross(rotTmpVec3, rotTmpVec3UnitY, a);
            Vec3.normalize(rotTmpVec3, rotTmpVec3);
            setAxisAngle(out, rotTmpVec3, Math.PI);
            return out;
        }
        else if (dot > 0.999999) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        }
        else {
            Vec3.cross(rotTmpVec3, a, b);
            out[0] = rotTmpVec3[0];
            out[1] = rotTmpVec3[1];
            out[2] = rotTmpVec3[2];
            out[3] = 1 + dot;
            return normalize(out, out);
        }
    }
    Quat.rotationTo = rotationTo;
    /**
     * Performs a spherical linear interpolation with two control points
     */
    const sqlerpTemp1 = zero();
    const sqlerpTemp2 = zero();
    function sqlerp(out, a, b, c, d, t) {
        slerp(sqlerpTemp1, a, d, t);
        slerp(sqlerpTemp2, b, c, t);
        slerp(out, sqlerpTemp1, sqlerpTemp2, 2 * t * (1 - t));
        return out;
    }
    Quat.sqlerp = sqlerp;
    /**
     * Sets the specified quaternion with values corresponding to the given
     * axes. Each axis is a vec3 and is expected to be unit length and
     * perpendicular to all other specified axes.
     */
    const axesTmpMat = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    function setAxes(out, view, right, up) {
        axesTmpMat[0] = right[0];
        axesTmpMat[3] = right[1];
        axesTmpMat[6] = right[2];
        axesTmpMat[1] = up[0];
        axesTmpMat[4] = up[1];
        axesTmpMat[7] = up[2];
        axesTmpMat[2] = -view[0];
        axesTmpMat[5] = -view[1];
        axesTmpMat[8] = -view[2];
        return normalize(out, fromMat3(out, axesTmpMat));
    }
    Quat.setAxes = setAxes;
    function toString(a, precision) {
        return `[${a[0].toPrecision(precision)} ${a[1].toPrecision(precision)} ${a[2].toPrecision(precision)}  ${a[3].toPrecision(precision)}]`;
    }
    Quat.toString = toString;
    Quat.Identity = identity();
})(Quat || (Quat = {}));
export { Quat };
