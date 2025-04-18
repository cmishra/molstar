"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mat4_1 = require("../3d/mat4");
const vec3_1 = require("../3d/vec3");
describe('Mat4', () => {
    it('permutation', () => {
        expect(mat4_1.Mat4.areEqual(mat4_1.Mat4.fromPermutation((0, mat4_1.Mat4)(), [0, 1, 2, 3]), mat4_1.Mat4.identity(), 1e-6)).toBe(true);
        expect(mat4_1.Mat4.areEqual(mat4_1.Mat4.fromPermutation((0, mat4_1.Mat4)(), [1, 0, 2, 3]), mat4_1.Mat4.ofRows([
            [0, 1, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ]), 1e-6)).toBe(true);
        const perm = mat4_1.Mat4.fromPermutation((0, mat4_1.Mat4)(), [1, 2, 0, 3]);
        expect(vec3_1.Vec3.transformMat4((0, vec3_1.Vec3)(), vec3_1.Vec3.create(1, 2, 3), perm)).toEqual(vec3_1.Vec3.create(2, 3, 1));
    });
});
