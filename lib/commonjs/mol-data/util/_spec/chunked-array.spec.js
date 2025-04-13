"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const chunked_array_1 = require("../chunked-array");
describe('Chunked Array', () => {
    it('creation', () => {
        const arr = chunked_array_1.ChunkedArray.create(Array, 2, 2);
        chunked_array_1.ChunkedArray.add2(arr, 1, 2);
        chunked_array_1.ChunkedArray.add2(arr, 3, 4);
        expect(chunked_array_1.ChunkedArray.compact(arr)).toEqual([1, 2, 3, 4]);
    });
    it('initial', () => {
        const arr = chunked_array_1.ChunkedArray.create(Int32Array, 2, 6, new Int32Array([1, 2, 3, 4]));
        chunked_array_1.ChunkedArray.add2(arr, 4, 3);
        chunked_array_1.ChunkedArray.add2(arr, 2, 1);
        chunked_array_1.ChunkedArray.add2(arr, 5, 6);
        expect(chunked_array_1.ChunkedArray.compact(arr)).toEqual(new Int32Array([4, 3, 2, 1, 5, 6]));
    });
    it('add many', () => {
        const arr = chunked_array_1.ChunkedArray.create(Array, 2, 2);
        chunked_array_1.ChunkedArray.addMany(arr, [1, 2, 3, 4]);
        expect(chunked_array_1.ChunkedArray.compact(arr)).toEqual([1, 2, 3, 4]);
    });
    it('resize', () => {
        const arr = chunked_array_1.ChunkedArray.create(Int32Array, 2, 2);
        chunked_array_1.ChunkedArray.add2(arr, 1, 2);
        chunked_array_1.ChunkedArray.add2(arr, 3, 4);
        chunked_array_1.ChunkedArray.add2(arr, 5, 6);
        chunked_array_1.ChunkedArray.add2(arr, 7, 8);
        chunked_array_1.ChunkedArray.add2(arr, 9, 10);
        expect(chunked_array_1.ChunkedArray.compact(arr)).toEqual(new Int32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
    });
    it('resize-fraction', () => {
        const arr = chunked_array_1.ChunkedArray.create(Int32Array, 2, 2.5);
        chunked_array_1.ChunkedArray.add2(arr, 1, 2);
        chunked_array_1.ChunkedArray.add2(arr, 3, 4);
        chunked_array_1.ChunkedArray.add2(arr, 5, 6);
        chunked_array_1.ChunkedArray.add2(arr, 7, 8);
        chunked_array_1.ChunkedArray.add2(arr, 9, 10);
        expect(arr.elementCount).toBe(5);
        expect(chunked_array_1.ChunkedArray.compact(arr)).toEqual(new Int32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
    });
});
