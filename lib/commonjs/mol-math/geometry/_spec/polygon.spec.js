"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const linear_algebra_1 = require("../../linear-algebra");
const polygon_1 = require("../polygon");
describe('pointInPolygon', () => {
    it('basic', () => {
        const polygon = [
            -1, -1,
            1, -1,
            1, 1,
            -1, 1
        ];
        expect((0, polygon_1.pointInPolygon)(linear_algebra_1.Vec2.create(0, 0), polygon, 4)).toBe(true);
        expect((0, polygon_1.pointInPolygon)(linear_algebra_1.Vec2.create(2, 2), polygon, 4)).toBe(false);
    });
});
