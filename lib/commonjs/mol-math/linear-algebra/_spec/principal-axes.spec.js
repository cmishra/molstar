"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Gianluca Tomasello <giagitom@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vec3_1 = require("../3d/vec3");
const principal_axes_1 = require("../matrix/principal-axes");
describe('PrincipalAxes', () => {
    it('same-cartesian-plane', () => {
        const positions = [
            0.1945, -0.0219, -0.0416,
            -0.0219, -0.0219, -0.0119,
        ];
        const pa = principal_axes_1.PrincipalAxes.ofPositions(positions);
        expect(vec3_1.Vec3.isFinite(pa.boxAxes.origin)).toBe(true);
        expect(vec3_1.Vec3.equals(pa.boxAxes.origin, pa.momentsAxes.origin)).toBe(true);
    });
    it('same-point', () => {
        const positions = [
            0.1945, -0.0219, -0.0416,
            0.1945, -0.0219, -0.0416,
        ];
        const pa = principal_axes_1.PrincipalAxes.ofPositions(positions);
        expect(vec3_1.Vec3.isFinite(pa.boxAxes.origin)).toBe(true);
        expect(vec3_1.Vec3.equals(pa.boxAxes.origin, pa.momentsAxes.origin)).toBe(true);
    });
});
