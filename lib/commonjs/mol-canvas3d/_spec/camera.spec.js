"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const mat4_1 = require("../../mol-math/linear-algebra/3d/mat4");
const util_1 = require("../camera/util");
describe('camera', () => {
    it('project/unproject', () => {
        const proj = mat4_1.Mat4.perspective((0, mat4_1.Mat4)(), -1, 1, 1, -1, 1, 100);
        const invProj = mat4_1.Mat4.invert((0, mat4_1.Mat4)(), proj);
        const c = (0, linear_algebra_1.Vec4)();
        const po = (0, linear_algebra_1.Vec3)();
        const vp = util_1.Viewport.create(0, 0, 100, 100);
        const pi = linear_algebra_1.Vec3.create(0, 0, 1);
        (0, util_1.cameraProject)(c, pi, vp, proj);
        expect(linear_algebra_1.Vec4.equals(c, linear_algebra_1.Vec4.create(50, 50, 2.020202, -1))).toBe(true);
        (0, util_1.cameraUnproject)(po, c, vp, invProj);
        expect(linear_algebra_1.Vec3.equals(po, pi)).toBe(true);
        linear_algebra_1.Vec3.set(pi, 0.5, 0.5, 1);
        (0, util_1.cameraProject)(c, pi, vp, proj);
        (0, util_1.cameraUnproject)(po, c, vp, invProj);
        expect(linear_algebra_1.Vec3.equals(po, pi)).toBe(true);
        util_1.Viewport.set(vp, 50, 50, 100, 100);
        linear_algebra_1.Vec3.set(pi, 0.5, 0.5, 1);
        (0, util_1.cameraProject)(c, pi, vp, proj);
        (0, util_1.cameraUnproject)(po, c, vp, invProj);
        expect(linear_algebra_1.Vec3.equals(po, pi)).toBe(true);
    });
});
