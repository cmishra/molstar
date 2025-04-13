"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mat4_1 = require("../3d/mat4");
const euler_1 = require("../3d/euler");
const quat_1 = require("../3d/quat");
const t = [
    [euler_1.Euler.create(0, 0, 0), 'XYZ'],
    [euler_1.Euler.create(1, 0, 0), 'XYZ'],
    [euler_1.Euler.create(0, 1, 0), 'ZYX'],
];
describe('Euler', () => {
    it('fromMat4', () => {
        for (const [e, o] of t) {
            const m = mat4_1.Mat4.fromEuler((0, mat4_1.Mat4)(), e, o);
            const e2 = euler_1.Euler.fromMat4((0, euler_1.Euler)(), m, o);
            const m2 = mat4_1.Mat4.fromEuler((0, mat4_1.Mat4)(), e2, o);
            expect(mat4_1.Mat4.areEqual(m, m2, 0.0001)).toBe(true);
        }
    });
    it('fromQuat', () => {
        for (const [e, o] of t) {
            const q = quat_1.Quat.fromEuler((0, quat_1.Quat)(), e, o);
            const e2 = euler_1.Euler.fromQuat((0, euler_1.Euler)(), q, o);
            const q2 = quat_1.Quat.fromEuler((0, quat_1.Quat)(), e2, o);
            expect(quat_1.Quat.equals(q, q2)).toBe(true);
        }
    });
});
