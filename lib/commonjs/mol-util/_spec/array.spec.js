"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const array_1 = require("../array");
describe('filterInPlace', () => {
    it('filterInPlace works', async () => {
        expect((0, array_1.filterInPlace)([], () => true)).toEqual([]);
        expect((0, array_1.filterInPlace)([], () => false)).toEqual([]);
        expect((0, array_1.filterInPlace)([1, 2, 3, 4, 5], () => true)).toEqual([1, 2, 3, 4, 5]);
        expect((0, array_1.filterInPlace)([1, 2, 3, 4, 5], () => false)).toEqual([]);
        expect((0, array_1.filterInPlace)([1, 2, 3, 4, 5], x => x % 2 === 0)).toEqual([2, 4]);
        expect((0, array_1.filterInPlace)([1, 2, 3, 4, 5], x => x % 2 === 1)).toEqual([1, 3, 5]);
        expect((0, array_1.filterInPlace)([1, 2, 3, 4, 5], x => x <= 2)).toEqual([1, 2]);
        expect((0, array_1.filterInPlace)([1, 2, 3, 4, 5], x => x > 2)).toEqual([3, 4, 5]);
    });
    it('filterInPlace works in place', async () => {
        const array = [1, 2, 3, 4, 5];
        (0, array_1.filterInPlace)(array, x => x % 2 === 1);
        expect(array).toEqual([1, 3, 5]);
    });
    it('filterInPlace big data', async () => {
        const array = (0, array_1.range)(10 ** 5);
        const expectedResult = array.filter(x => x % 7 === 0);
        expect((0, array_1.filterInPlace)(array, x => x % 7 === 0)).toEqual(expectedResult);
    });
});
