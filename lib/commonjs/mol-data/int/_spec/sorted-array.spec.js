"use strict";
/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const interval_1 = require("../interval");
const sorted_array_1 = require("../sorted-array");
describe('sortedArray', () => {
    function testI(name, a, b) {
        it(name, () => expect(interval_1.Interval.areEqual(a, b)).toBe(true));
    }
    function test(name, a, b) {
        it(name, () => expect(a).toEqual(b));
    }
    function compareArrays(a, b) {
        expect(a.length).toBe(b.length);
        for (let i = 0; i < a.length; i++)
            expect(a[i]).toBe(b[i]);
    }
    const a1234 = sorted_array_1.SortedArray.ofSortedArray([1, 2, 3, 4]);
    const a2468 = sorted_array_1.SortedArray.ofSortedArray([2, 4, 6, 8]);
    test('size', sorted_array_1.SortedArray.size(a1234), 4);
    test('min/max', [sorted_array_1.SortedArray.min(a1234), sorted_array_1.SortedArray.max(a1234)], [1, 4]);
    test('start/end', [sorted_array_1.SortedArray.start(a1234), sorted_array_1.SortedArray.end(a1234)], [1, 5]);
    test('has', sorted_array_1.SortedArray.has(a1234, 5), false);
    test('has', sorted_array_1.SortedArray.has(a1234, 4), true);
    it('has-all', () => {
        for (let i = 1; i <= 4; i++)
            expect(sorted_array_1.SortedArray.has(a1234, i)).toBe(true);
    });
    test('indexOf', sorted_array_1.SortedArray.indexOf(a2468, 5), -1);
    test('indexOf', sorted_array_1.SortedArray.indexOf(a2468, 2), 0);
    test('getAt', a2468[1], 4);
    test('areEqual', sorted_array_1.SortedArray.areEqual(a2468, a2468), true);
    test('areEqual1', sorted_array_1.SortedArray.areEqual(a2468, sorted_array_1.SortedArray.ofUnsortedArray([4, 2, 8, 6])), true);
    test('areEqual2', sorted_array_1.SortedArray.areEqual(a1234, a2468), false);
    test('predIndex1', sorted_array_1.SortedArray.findPredecessorIndex(a1234, 5), 4);
    test('predIndex2', sorted_array_1.SortedArray.findPredecessorIndex(a1234, 2), 1);
    test('predIndex3', sorted_array_1.SortedArray.findPredecessorIndex(a2468, 4), 1);
    test('predIndex4', sorted_array_1.SortedArray.findPredecessorIndex(a2468, 3), 1);
    test('predIndexInt', sorted_array_1.SortedArray.findPredecessorIndexInInterval(a1234, 0, interval_1.Interval.ofRange(2, 3)), 2);
    const aDuplSmall = sorted_array_1.SortedArray.ofSortedArray([1, ...new Array(2).fill(3), 3]);
    test('predIndexDuplSmall', sorted_array_1.SortedArray.findPredecessorIndex(aDuplSmall, 2), 1);
    const aDuplBig = sorted_array_1.SortedArray.ofSortedArray([1, ...new Array(333).fill(2), ...new Array(666).fill(3), 4]);
    test('predIndexDuplBig', sorted_array_1.SortedArray.findPredecessorIndex(aDuplBig, 3), 334);
    testI('findRange', sorted_array_1.SortedArray.findRange(a2468, 2, 4), interval_1.Interval.ofRange(0, 1));
    it('deduplicate', () => {
        compareArrays(sorted_array_1.SortedArray.deduplicate(sorted_array_1.SortedArray.ofSortedArray([1, 1, 1, 1])), [1]);
        compareArrays(sorted_array_1.SortedArray.deduplicate(sorted_array_1.SortedArray.ofSortedArray([1, 1, 2, 2, 3, 4])), [1, 2, 3, 4]);
        compareArrays(sorted_array_1.SortedArray.deduplicate(sorted_array_1.SortedArray.ofSortedArray([1, 2, 3])), [1, 2, 3]);
    });
    it('indicesOf', () => {
        compareArrays(sorted_array_1.SortedArray.indicesOf(sorted_array_1.SortedArray.ofSortedArray([10, 11, 12]), sorted_array_1.SortedArray.ofSortedArray([10, 12, 14])), [0, 2]);
    });
    it('indicesOf 2', () => {
        compareArrays(sorted_array_1.SortedArray.indicesOf(sorted_array_1.SortedArray.ofSortedArray([0, 1, 2, 3, 4, 8, 9, 10]), sorted_array_1.SortedArray.ofSortedArray([1, 3, 4, 9, 10])), [1, 3, 4, 6, 7]);
    });
    test('intersectionSize', sorted_array_1.SortedArray.intersectionSize(a1234, a2468), 2);
    it('union1', () => {
        compareArrays(sorted_array_1.SortedArray.union(sorted_array_1.SortedArray.ofSortedArray([830, 831, 832, 833, 834, 836, 837, 838, 839, 840, 841, 842, 843]), sorted_array_1.SortedArray.ofSortedArray([835])), sorted_array_1.SortedArray.ofSortedArray([830, 831, 832, 833, 834, 835, 836, 837, 838, 839, 840, 841, 842, 843]));
    });
    it('union2', () => {
        compareArrays(sorted_array_1.SortedArray.union(sorted_array_1.SortedArray.ofSortedArray([830, 832, 833]), sorted_array_1.SortedArray.ofSortedArray([831])), sorted_array_1.SortedArray.ofSortedArray([830, 831, 832, 833]));
    });
    it('union3ab', () => {
        compareArrays(sorted_array_1.SortedArray.union(sorted_array_1.SortedArray.ofSortedArray([830, 831, 832, 833, 834, 835]), sorted_array_1.SortedArray.ofSortedArray([836, 837, 838, 839, 840, 841, 842, 843])), sorted_array_1.SortedArray.ofSortedArray([830, 831, 832, 833, 834, 835, 836, 837, 838, 839, 840, 841, 842, 843]));
    });
    it('union3ba', () => {
        compareArrays(sorted_array_1.SortedArray.union(sorted_array_1.SortedArray.ofSortedArray([836, 837, 838, 839, 840, 841, 842, 843]), sorted_array_1.SortedArray.ofSortedArray([830, 831, 832, 833, 834, 835])), sorted_array_1.SortedArray.ofSortedArray([830, 831, 832, 833, 834, 835, 836, 837, 838, 839, 840, 841, 842, 843]));
    });
    it('union4', () => {
        compareArrays(sorted_array_1.SortedArray.union(sorted_array_1.SortedArray.ofSortedArray([1, 3, 5, 7, 9]), sorted_array_1.SortedArray.ofSortedArray([2, 4, 6, 8])), sorted_array_1.SortedArray.ofSortedArray([1, 2, 3, 4, 5, 6, 7, 8, 9]));
    });
    it('union5', () => {
        compareArrays(sorted_array_1.SortedArray.union(sorted_array_1.SortedArray.ofSortedArray([2, 3, 4, 20, 21, 22]), sorted_array_1.SortedArray.ofSortedArray([10, 11, 12])), sorted_array_1.SortedArray.ofSortedArray([2, 3, 4, 10, 11, 12, 20, 21, 22]));
    });
    it('union6', () => {
        compareArrays(sorted_array_1.SortedArray.union(sorted_array_1.SortedArray.ofSortedArray([768, 769, 770, 771, 772, 773, 774, 775, 776, 819, 820, 821, 822, 823, 824, 825, 826, 827, 828, 829, 1811, 1812, 1813, 1814, 1815, 1816, 1817, 1818, 1819]), sorted_array_1.SortedArray.ofSortedArray([1751, 1752, 1753, 1754, 1755, 1756, 1757, 1758])), sorted_array_1.SortedArray.ofSortedArray([768, 769, 770, 771, 772, 773, 774, 775, 776, 819, 820, 821, 822, 823, 824, 825, 826, 827, 828, 829, 1751, 1752, 1753, 1754, 1755, 1756, 1757, 1758, 1811, 1812, 1813, 1814, 1815, 1816, 1817, 1818, 1819]));
    });
    it('union7', () => {
        compareArrays(sorted_array_1.SortedArray.union(sorted_array_1.SortedArray.ofSortedArray([3766, 3767, 3768, 3770, 3773, 3780, 3783, 3787, 3797]), sorted_array_1.SortedArray.ofSortedArray([3769, 3790, 3794])), sorted_array_1.SortedArray.ofSortedArray([3766, 3767, 3768, 3769, 3770, 3773, 3780, 3783, 3787, 3790, 3794, 3797]));
    });
    it('isSubset', () => {
        expect(sorted_array_1.SortedArray.isSubset(sorted_array_1.SortedArray.ofSortedArray([1271, 1272, 1273, 1274, 1275, 1276, 1277, 1278, 1279, 1280, 1281, 1282, 1283, 1284, 1285, 1286, 1287, 1288, 1289, 1290, 1291, 1292, 1293, 1294, 1295]), sorted_array_1.SortedArray.ofSortedArray([1271, 1272, 1274, 1275, 1276, 1278, 1280, 1282, 1284, 1286, 1288, 1290, 1292, 1294]))).toBe(true);
    });
});
