"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const geometry_1 = require("../../geometry");
const util_1 = require("../../../mol-data/util");
const int_1 = require("../../../mol-data/int");
const boundary_1 = require("../boundary");
const xs = [0, 0, 1];
const ys = [0, 1, 0];
const zs = [0, 0, 0];
const rs = [0, 0.5, 1 / 3];
describe('GridLookup3d', () => {
    it('basic', () => {
        const position = { x: xs, y: ys, z: zs, indices: int_1.OrderedSet.ofBounds(0, 3) };
        const boundary = (0, boundary_1.getBoundary)(position);
        const grid = (0, geometry_1.GridLookup3D)(position, boundary);
        let r = grid.find(0, 0, 0, 0);
        expect(r.count).toBe(1);
        expect(r.indices[0]).toBe(0);
        r = grid.nearest(0, 0, 0, 1);
        expect(r.count).toBe(1);
        expect(r.indices[0]).toBe(0);
        r = grid.find(0, 0, 0, 1);
        expect(r.count).toBe(3);
        expect((0, util_1.sortArray)(r.indices)).toEqual([0, 1, 2]);
        r = grid.nearest(0, 0, 0, 3);
        expect(r.count).toBe(3);
        expect((0, util_1.sortArray)(r.indices)).toEqual([0, 1, 2]);
    });
    it('radius', () => {
        const position = { x: xs, y: ys, z: zs, radius: [0, 0.5, 1 / 3], indices: int_1.OrderedSet.ofBounds(0, 3) };
        const boundary = (0, boundary_1.getBoundary)(position);
        const grid = (0, geometry_1.GridLookup3D)(position, boundary);
        let r = grid.find(0, 0, 0, 0);
        expect(r.count).toBe(1);
        expect(r.indices[0]).toBe(0);
        r = grid.nearest(0, 0, 0, 1);
        expect(r.count).toBe(1);
        expect(r.indices[0]).toBe(0);
        r = grid.find(0, 0, 0, 0.5);
        expect(r.count).toBe(2);
        expect((0, util_1.sortArray)(r.indices)).toEqual([0, 1]);
        r = grid.nearest(0, 0, 0, 3);
        expect(r.count).toBe(3);
        expect((0, util_1.sortArray)(r.indices)).toEqual([0, 1, 2]);
    });
    it('indexed', () => {
        const position = { x: xs, y: ys, z: zs, indices: int_1.OrderedSet.ofSingleton(1), radius: rs };
        const boundary = (0, boundary_1.getBoundary)(position);
        const grid = (0, geometry_1.GridLookup3D)(position, boundary);
        let r = grid.find(0, 0, 0, 0);
        expect(r.count).toBe(0);
        r = grid.nearest(0, 0, 0, 1);
        expect(r.count).toBe(1);
        r = grid.find(0, 0, 0, 0.5);
        expect(r.count).toBe(1);
        expect((0, util_1.sortArray)(r.indices)).toEqual([0]);
        r = grid.nearest(0, 0, 0, 3);
        expect(r.count).toBe(1);
        expect((0, util_1.sortArray)(r.indices)).toEqual([0]);
    });
});
