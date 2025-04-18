"use strict";
/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ordered_set_1 = require("../ordered-set");
const interval_1 = require("../interval");
const sorted_array_1 = require("../sorted-array");
describe('ordered set', () => {
    function ordSetToArray(set) {
        const ret = [];
        for (let i = 0, _i = ordered_set_1.OrderedSet.size(set); i < _i; i++)
            ret.push(ordered_set_1.OrderedSet.getAt(set, i));
        return ret;
    }
    function testEq(name, set, expected) {
        it(name, () => {
            // copy the arrays to ensure "compatibility" between typed and native arrays
            expect(Array.prototype.slice.call(ordSetToArray(set))).toEqual(Array.prototype.slice.call(expected));
        });
    }
    const empty = ordered_set_1.OrderedSet.Empty;
    const singleton10 = ordered_set_1.OrderedSet.ofSingleton(10);
    const range1_4 = ordered_set_1.OrderedSet.ofRange(1, 4);
    const arr136 = ordered_set_1.OrderedSet.ofSortedArray([1, 3, 6]);
    const arr12369 = ordered_set_1.OrderedSet.ofSortedArray([1, 2, 3, 6, 9]);
    const iB = (s, e) => interval_1.Interval.ofBounds(s, e);
    testEq('empty', empty, []);
    testEq('singleton', singleton10, [10]);
    testEq('range', range1_4, [1, 2, 3, 4]);
    testEq('sorted array', arr136, [1, 3, 6]);
    it('equality', () => {
        expect(ordered_set_1.OrderedSet.areEqual(empty, singleton10)).toBe(false);
        expect(ordered_set_1.OrderedSet.areEqual(singleton10, singleton10)).toBe(true);
        expect(ordered_set_1.OrderedSet.areEqual(range1_4, singleton10)).toBe(false);
        expect(ordered_set_1.OrderedSet.areEqual(arr136, ordered_set_1.OrderedSet.ofSortedArray([1, 3, 6]))).toBe(true);
        expect(ordered_set_1.OrderedSet.areEqual(arr136, ordered_set_1.OrderedSet.ofSortedArray([1, 4, 6]))).toBe(false);
    });
    it('areIntersecting', () => {
        expect(ordered_set_1.OrderedSet.areIntersecting(range1_4, arr136)).toBe(true);
        expect(ordered_set_1.OrderedSet.areIntersecting(empty, empty)).toBe(true);
        expect(ordered_set_1.OrderedSet.areIntersecting(empty, singleton10)).toBe(false);
        expect(ordered_set_1.OrderedSet.areIntersecting(empty, range1_4)).toBe(false);
        expect(ordered_set_1.OrderedSet.areIntersecting(empty, arr136)).toBe(false);
        expect(ordered_set_1.OrderedSet.areIntersecting(interval_1.Interval.ofRange(2, 3), arr12369)).toBe(true);
        expect(ordered_set_1.OrderedSet.areIntersecting(interval_1.Interval.ofRange(2, 6), arr12369)).toBe(true);
        expect(ordered_set_1.OrderedSet.areIntersecting(interval_1.Interval.ofRange(2, 8), arr12369)).toBe(true);
        expect(ordered_set_1.OrderedSet.areIntersecting(interval_1.Interval.ofRange(4, 8), arr12369)).toBe(true);
        expect(ordered_set_1.OrderedSet.areIntersecting(interval_1.Interval.ofRange(4, 5), arr12369)).toBe(false);
        expect(ordered_set_1.OrderedSet.areIntersecting(interval_1.Interval.ofRange(7, 8), arr12369)).toBe(false);
        expect(ordered_set_1.OrderedSet.areIntersecting(interval_1.Interval.ofRange(6, 6), arr12369)).toBe(true);
        expect(ordered_set_1.OrderedSet.areIntersecting(interval_1.Interval.ofRange(3, 4), ordered_set_1.OrderedSet.ofSortedArray([0, 1, 10]))).toBe(false);
    });
    it('isSubset', () => {
        expect(ordered_set_1.OrderedSet.isSubset(singleton10, empty)).toBe(true);
        expect(ordered_set_1.OrderedSet.isSubset(range1_4, empty)).toBe(true);
        expect(ordered_set_1.OrderedSet.isSubset(arr136, empty)).toBe(true);
        expect(ordered_set_1.OrderedSet.isSubset(empty, empty)).toBe(true);
        expect(ordered_set_1.OrderedSet.isSubset(empty, singleton10)).toBe(false);
        expect(ordered_set_1.OrderedSet.isSubset(empty, range1_4)).toBe(false);
        expect(ordered_set_1.OrderedSet.isSubset(empty, arr136)).toBe(false);
        expect(ordered_set_1.OrderedSet.isSubset(singleton10, range1_4)).toBe(false);
        expect(ordered_set_1.OrderedSet.isSubset(range1_4, ordered_set_1.OrderedSet.ofRange(2, 3))).toBe(true);
        expect(ordered_set_1.OrderedSet.isSubset(arr136, range1_4)).toBe(false);
        expect(ordered_set_1.OrderedSet.isSubset(arr136, arr136)).toBe(true);
        expect(ordered_set_1.OrderedSet.isSubset(arr136, ordered_set_1.OrderedSet.ofSortedArray([1, 3]))).toBe(true);
        expect(ordered_set_1.OrderedSet.isSubset(arr136, ordered_set_1.OrderedSet.ofSortedArray([1, 3, 7]))).toBe(false);
        expect(ordered_set_1.OrderedSet.isSubset(ordered_set_1.OrderedSet.ofSortedArray([0, 1, 2, 3, 7, 10]), ordered_set_1.OrderedSet.ofSortedArray([1, 3, 7]))).toBe(true);
        expect(ordered_set_1.OrderedSet.isSubset(arr136, ordered_set_1.OrderedSet.ofSortedArray([1, 3, 10, 45]))).toBe(false);
        expect(ordered_set_1.OrderedSet.isSubset(arr136, ordered_set_1.OrderedSet.ofSortedArray([12, 13, 16]))).toBe(false);
    });
    it('isSubsetIS', () => {
        expect(ordered_set_1.OrderedSet.isSubset(interval_1.Interval.ofRange(1271, 1295), ordered_set_1.OrderedSet.ofSortedArray([1271, 1272, 1274, 1275, 1276, 1278, 1280, 1282, 1284, 1286, 1288, 1290, 1292, 1294]))).toBe(true);
    });
    it('access/membership', () => {
        expect(ordered_set_1.OrderedSet.has(empty, 10)).toBe(false);
        expect(ordered_set_1.OrderedSet.indexOf(empty, 10)).toBe(-1);
        expect(ordered_set_1.OrderedSet.has(singleton10, 10)).toBe(true);
        expect(ordered_set_1.OrderedSet.has(singleton10, 11)).toBe(false);
        expect(ordered_set_1.OrderedSet.indexOf(singleton10, 10)).toBe(0);
        expect(ordered_set_1.OrderedSet.indexOf(singleton10, 11)).toBe(-1);
        expect(ordered_set_1.OrderedSet.has(range1_4, 4)).toBe(true);
        expect(ordered_set_1.OrderedSet.has(range1_4, 5)).toBe(false);
        expect(ordered_set_1.OrderedSet.indexOf(range1_4, 4)).toBe(3);
        expect(ordered_set_1.OrderedSet.indexOf(range1_4, 11)).toBe(-1);
        expect(ordered_set_1.OrderedSet.has(arr136, 3)).toBe(true);
        expect(ordered_set_1.OrderedSet.has(arr136, 4)).toBe(false);
        expect(ordered_set_1.OrderedSet.indexOf(arr136, 3)).toBe(1);
        expect(ordered_set_1.OrderedSet.indexOf(arr136, 11)).toBe(-1);
    });
    it('interval range', () => {
        expect(ordered_set_1.OrderedSet.findRange(empty, 9, 11)).toEqual(iB(0, 0));
        expect(ordered_set_1.OrderedSet.findRange(empty, -9, -6)).toEqual(iB(0, 0));
        expect(ordered_set_1.OrderedSet.findRange(singleton10, 9, 11)).toEqual(iB(0, 1));
        expect(ordered_set_1.OrderedSet.findRange(range1_4, 2, 3)).toEqual(iB(1, 3));
        expect(ordered_set_1.OrderedSet.findRange(range1_4, -10, 2)).toEqual(iB(0, 2));
        expect(ordered_set_1.OrderedSet.findRange(range1_4, -10, 20)).toEqual(iB(0, 4));
        expect(ordered_set_1.OrderedSet.findRange(range1_4, 3, 20)).toEqual(iB(2, 4));
        expect(ordered_set_1.OrderedSet.findRange(arr136, 0, 1)).toEqual(iB(0, 1));
        expect(ordered_set_1.OrderedSet.findRange(arr136, 0, 3)).toEqual(iB(0, 2));
        expect(ordered_set_1.OrderedSet.findRange(arr136, 0, 4)).toEqual(iB(0, 2));
        expect(ordered_set_1.OrderedSet.findRange(arr136, 2, 4)).toEqual(iB(1, 2));
        expect(ordered_set_1.OrderedSet.findRange(arr136, 2, 7)).toEqual(iB(1, 3));
    });
    it('intersectionSize', () => {
        expect(ordered_set_1.OrderedSet.intersectionSize(arr136, range1_4)).toEqual(2);
        expect(ordered_set_1.OrderedSet.intersectionSize(arr12369, range1_4)).toEqual(3);
        expect(ordered_set_1.OrderedSet.intersectionSize(ordered_set_1.OrderedSet.ofSortedArray([12, 13, 16]), range1_4)).toEqual(0);
        expect(ordered_set_1.OrderedSet.intersectionSize(ordered_set_1.OrderedSet.ofSortedArray([1, 2, 4]), range1_4)).toEqual(3);
    });
    testEq('union ES', ordered_set_1.OrderedSet.union(empty, singleton10), [10]);
    testEq('union ER', ordered_set_1.OrderedSet.union(empty, range1_4), [1, 2, 3, 4]);
    testEq('union EA', ordered_set_1.OrderedSet.union(empty, arr136), [1, 3, 6]);
    testEq('union SS', ordered_set_1.OrderedSet.union(singleton10, ordered_set_1.OrderedSet.ofSingleton(16)), [10, 16]);
    testEq('union SR', ordered_set_1.OrderedSet.union(range1_4, singleton10), [1, 2, 3, 4, 10]);
    testEq('union SA', ordered_set_1.OrderedSet.union(arr136, singleton10), [1, 3, 6, 10]);
    testEq('union SA1', ordered_set_1.OrderedSet.union(arr136, ordered_set_1.OrderedSet.ofSingleton(3)), [1, 3, 6]);
    testEq('union RR', ordered_set_1.OrderedSet.union(range1_4, range1_4), [1, 2, 3, 4]);
    testEq('union RR1', ordered_set_1.OrderedSet.union(range1_4, ordered_set_1.OrderedSet.ofRange(6, 7)), [1, 2, 3, 4, 6, 7]);
    testEq('union RR2', ordered_set_1.OrderedSet.union(range1_4, ordered_set_1.OrderedSet.ofRange(3, 5)), [1, 2, 3, 4, 5]);
    testEq('union RA', ordered_set_1.OrderedSet.union(range1_4, arr136), [1, 2, 3, 4, 6]);
    testEq('union AA', ordered_set_1.OrderedSet.union(arr136, ordered_set_1.OrderedSet.ofSortedArray([2, 4, 6, 7])), [1, 2, 3, 4, 6, 7]);
    testEq('union AA1', ordered_set_1.OrderedSet.union(arr136, ordered_set_1.OrderedSet.ofSortedArray([2, 3, 4, 6, 7])), [1, 2, 3, 4, 6, 7]);
    testEq('union AA2', ordered_set_1.OrderedSet.union(arr136, ordered_set_1.OrderedSet.ofSortedArray([2, 4, 5, 6, 7])), [1, 2, 3, 4, 5, 6, 7]);
    testEq('union AA3', ordered_set_1.OrderedSet.union(ordered_set_1.OrderedSet.ofSortedArray([1, 3]), ordered_set_1.OrderedSet.ofSortedArray([2, 4])), [1, 2, 3, 4]);
    testEq('union AA4', ordered_set_1.OrderedSet.union(ordered_set_1.OrderedSet.ofSortedArray([1, 3]), ordered_set_1.OrderedSet.ofSortedArray([1, 3, 4])), [1, 3, 4]);
    testEq('union AA5', ordered_set_1.OrderedSet.union(ordered_set_1.OrderedSet.ofSortedArray([1, 3, 4]), ordered_set_1.OrderedSet.ofSortedArray([1, 3])), [1, 3, 4]);
    testEq('union AR', ordered_set_1.OrderedSet.union(ordered_set_1.OrderedSet.ofSortedArray([1, 2, 5, 6]), ordered_set_1.OrderedSet.ofRange(3, 4)), [1, 2, 3, 4, 5, 6]);
    testEq('union AR1', ordered_set_1.OrderedSet.union(ordered_set_1.OrderedSet.ofSortedArray([1, 2, 6, 7]), ordered_set_1.OrderedSet.ofRange(3, 4)), [1, 2, 3, 4, 6, 7]);
    it('union AA6', () => expect(ordered_set_1.OrderedSet.union(arr136, ordered_set_1.OrderedSet.ofSortedArray([1, 3, 6]))).toBe(arr136));
    testEq('intersect ES', ordered_set_1.OrderedSet.intersect(empty, singleton10), []);
    testEq('intersect ER', ordered_set_1.OrderedSet.intersect(empty, range1_4), []);
    testEq('intersect EA', ordered_set_1.OrderedSet.intersect(empty, arr136), []);
    testEq('intersect SS', ordered_set_1.OrderedSet.intersect(singleton10, ordered_set_1.OrderedSet.ofSingleton(16)), []);
    testEq('intersect SS1', ordered_set_1.OrderedSet.intersect(singleton10, singleton10), [10]);
    testEq('intersect SR', ordered_set_1.OrderedSet.intersect(range1_4, singleton10), []);
    testEq('intersect RR', ordered_set_1.OrderedSet.intersect(range1_4, range1_4), [1, 2, 3, 4]);
    testEq('intersect RR2', ordered_set_1.OrderedSet.intersect(range1_4, ordered_set_1.OrderedSet.ofRange(3, 5)), [3, 4]);
    testEq('intersect RA', ordered_set_1.OrderedSet.intersect(range1_4, arr136), [1, 3]);
    testEq('intersect AA', ordered_set_1.OrderedSet.intersect(arr136, ordered_set_1.OrderedSet.ofSortedArray([2, 3, 4, 6, 7])), [3, 6]);
    it('intersect AA1', () => expect(ordered_set_1.OrderedSet.union(arr136, ordered_set_1.OrderedSet.ofSortedArray([1, 3, 6]))).toBe(arr136));
    testEq('idxIntersect 1', ordered_set_1.OrderedSet.indexedIntersect(ordered_set_1.OrderedSet.ofSortedArray([1, 2, 4]), sorted_array_1.SortedArray.ofSortedArray([1, 2, 3, 4, 5, 6]), sorted_array_1.SortedArray.ofSortedArray([2, 4, 5, 8])), [0, 2]);
    testEq('idxIntersect 2', ordered_set_1.OrderedSet.indexedIntersect(ordered_set_1.OrderedSet.ofSortedArray([0, 1]), sorted_array_1.SortedArray.ofSortedArray([1, 2]), sorted_array_1.SortedArray.ofSortedArray([1, 2])), [0, 1]);
    testEq('subtract ES', ordered_set_1.OrderedSet.subtract(empty, singleton10), []);
    testEq('subtract ER', ordered_set_1.OrderedSet.subtract(empty, range1_4), []);
    testEq('subtract EA', ordered_set_1.OrderedSet.subtract(empty, arr136), []);
    testEq('subtract SS', ordered_set_1.OrderedSet.subtract(singleton10, ordered_set_1.OrderedSet.ofSingleton(16)), [10]);
    testEq('subtract SS1', ordered_set_1.OrderedSet.subtract(singleton10, singleton10), []);
    testEq('subtract SR', ordered_set_1.OrderedSet.subtract(range1_4, singleton10), [1, 2, 3, 4]);
    testEq('subtract SR1', ordered_set_1.OrderedSet.subtract(range1_4, ordered_set_1.OrderedSet.ofSingleton(4)), [1, 2, 3]);
    testEq('subtract SR2', ordered_set_1.OrderedSet.subtract(range1_4, ordered_set_1.OrderedSet.ofSingleton(3)), [1, 2, 4]);
    testEq('subtract RR', ordered_set_1.OrderedSet.subtract(range1_4, range1_4), []);
    testEq('subtract RR1', ordered_set_1.OrderedSet.subtract(range1_4, ordered_set_1.OrderedSet.ofRange(3, 5)), [1, 2]);
    testEq('subtract RR2', ordered_set_1.OrderedSet.subtract(range1_4, ordered_set_1.OrderedSet.ofRange(2, 3)), [1, 4]);
    testEq('subtract RA', ordered_set_1.OrderedSet.subtract(range1_4, arr136), [2, 4]);
    testEq('subtract RA1', ordered_set_1.OrderedSet.subtract(range1_4, ordered_set_1.OrderedSet.ofSortedArray([0, 1, 2, 3, 4, 7])), []);
    testEq('subtract RA2', ordered_set_1.OrderedSet.subtract(range1_4, ordered_set_1.OrderedSet.ofSortedArray([0, 2, 3])), [1, 4]);
    testEq('subtract AR', ordered_set_1.OrderedSet.subtract(arr136, range1_4), [6]);
    testEq('subtract AR1', ordered_set_1.OrderedSet.subtract(arr136, ordered_set_1.OrderedSet.ofRange(0, 10)), []);
    testEq('subtract AR1', ordered_set_1.OrderedSet.subtract(arr136, ordered_set_1.OrderedSet.ofRange(2, 10)), [1]);
    testEq('subtract AA', ordered_set_1.OrderedSet.subtract(arr136, arr136), []);
    testEq('subtract AA1', ordered_set_1.OrderedSet.subtract(arr136, ordered_set_1.OrderedSet.ofSortedArray([2, 3, 4, 6, 7])), [1]);
    testEq('subtract AA2', ordered_set_1.OrderedSet.subtract(arr136, ordered_set_1.OrderedSet.ofSortedArray([0, 1, 6])), [3]);
    it('foreach', () => {
        const int = ordered_set_1.OrderedSet.ofBounds(1, 3), set = ordered_set_1.OrderedSet.ofSortedArray([2, 3, 4]);
        expect(ordered_set_1.OrderedSet.forEach(int, (v, i, ctx) => ctx[i] = v, [])).toEqual([1, 2]);
        expect(ordered_set_1.OrderedSet.forEach(set, (v, i, ctx) => ctx[i] = v, [])).toEqual([2, 3, 4]);
    });
});
