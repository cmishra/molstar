"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const linear_algebra_1 = require("../../linear-algebra");
const box3d_1 = require("../primitives/box3d");
const frustum3d_1 = require("../primitives/frustum3d");
const sphere3d_1 = require("../primitives/sphere3d");
const v3 = linear_algebra_1.Vec3.create;
const s3 = sphere3d_1.Sphere3D.create;
describe('frustum3d', () => {
    it('intersectsSphere3D', () => {
        const f = (0, frustum3d_1.Frustum3D)();
        const m = linear_algebra_1.Mat4.perspective((0, linear_algebra_1.Mat4)(), -1, 1, 1, -1, 1, 100);
        frustum3d_1.Frustum3D.fromProjectionMatrix(f, m);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(0, 0, 0), 0))).toBe(false);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(0, 0, 0), 0.9))).toBe(false);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(0, 0, 0), 1.1))).toBe(true);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(0, 0, -50), 0))).toBe(true);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(0, 0, -1.001), 0))).toBe(true);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(-1, -1, -1.001), 0))).toBe(true);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(-1.1, -1.1, -1.001), 0))).toBe(false);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(-1.1, -1.1, -1.001), 0.5))).toBe(true);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(1, 1, -1.001), 0))).toBe(true);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(1.1, 1.1, -1.001), 0))).toBe(false);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(1.1, 1.1, -1.001), 0.5))).toBe(true);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(0, 0, -99.999), 0))).toBe(true);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(-99.999, -99.999, -99.999), 0))).toBe(true);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(-100.1, -100.1, -100.1), 0))).toBe(false);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(-100.1, -100.1, -100.1), 0.5))).toBe(true);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(99.999, 99.999, -99.999), 0))).toBe(true);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(100.1, 100.1, -100.1), 0))).toBe(false);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(100.1, 100.1, -100.1), 0.2))).toBe(true);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(0, 0, -101), 0))).toBe(false);
        expect(frustum3d_1.Frustum3D.intersectsSphere3D(f, s3(v3(0, 0, -101), 1.1))).toBe(true);
    });
    it('intersectsBox3D', () => {
        const f = (0, frustum3d_1.Frustum3D)();
        const m = linear_algebra_1.Mat4.perspective((0, linear_algebra_1.Mat4)(), -1, 1, 1, -1, 1, 100);
        frustum3d_1.Frustum3D.fromProjectionMatrix(f, m);
        const b0 = box3d_1.Box3D.create(v3(0, 0, 0), v3(1, 1, 1));
        expect(frustum3d_1.Frustum3D.intersectsBox3D(f, b0)).toBe(false);
        const b1 = box3d_1.Box3D.create(v3(-1.1, -1.1, -1.1), v3(-0.1, -0.1, -0.1));
        expect(frustum3d_1.Frustum3D.intersectsBox3D(f, b1)).toBe(true);
    });
    it('containsPoint', () => {
        const f = (0, frustum3d_1.Frustum3D)();
        const m = linear_algebra_1.Mat4.perspective((0, linear_algebra_1.Mat4)(), -1, 1, 1, -1, 1, 100);
        frustum3d_1.Frustum3D.fromProjectionMatrix(f, m);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(0, 0, 0))).toBe(false);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(0, 0, -50))).toBe(true);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(0, 0, -1.001))).toBe(true);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(-1, -1, -1.001))).toBe(true);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(-1.1, -1.1, -1.001))).toBe(false);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(1, 1, -1.001))).toBe(true);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(1.1, 1.1, -1.001))).toBe(false);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(0, 0, -99.999))).toBe(true);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(-99.999, -99.999, -99.999))).toBe(true);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(-100.1, -100.1, -100.1))).toBe(false);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(99.999, 99.999, -99.999))).toBe(true);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(100.1, 100.1, -100.1))).toBe(false);
        expect(frustum3d_1.Frustum3D.containsPoint(f, v3(0, 0, -101))).toBe(false);
    });
});
