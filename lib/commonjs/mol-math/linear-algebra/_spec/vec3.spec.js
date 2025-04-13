"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vec3_1 = require("../3d/vec3");
describe('vec3', () => {
    const vec1 = vec3_1.Vec3.create(1, 2, 3);
    const vec2 = vec3_1.Vec3.create(2, 3, 1);
    const orthVec1 = vec3_1.Vec3.create(0, 1, 0);
    const orthVec2 = vec3_1.Vec3.create(1, 0, 0);
    it('angle calculation', () => {
        expect(vec3_1.Vec3.angle(vec1, vec1) * 360 / (2 * Math.PI)).toBe(0.0);
        expect(vec3_1.Vec3.angle(orthVec1, orthVec2) * 360 / (2 * Math.PI)).toBe(90.0);
        expect(vec3_1.Vec3.angle(vec1, vec2)).toBeCloseTo(0.666946);
    });
});
