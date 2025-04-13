"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../renderable/util");
describe('renderable', () => {
    it('calculateBoundingSphere', () => {
        const position = new Float32Array([
            0, 0, 0,
            1, 0, 0,
            -1, 0, 0,
        ]);
        const transform = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 0,
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            1, 0, 0, 0,
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -1, 0, 0, 0
        ]);
        const { boundingSphere, invariantBoundingSphere } = (0, util_1.calculateBoundingSphere)(position, position.length / 3, transform, transform.length / 16);
        expect(invariantBoundingSphere.extrema).toEqual([[0, 0, 0], [1, 0, 0], [-1, 0, 0]]);
        expect(invariantBoundingSphere.radius).toBe(1);
        expect(invariantBoundingSphere.center).toEqual([0, 0, 0]);
        expect(boundingSphere.radius).toBe(2);
        expect(boundingSphere.center).toEqual([0, 0, 0]);
    });
});
