"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const interval_1 = require("../interval");
describe('interval', () => {
    function testI(name, a, b) {
        it(name, () => expect(interval_1.Interval.areEqual(a, b)).toBe(true));
    }
    function test(name, a, b) {
        it(name, () => expect(a).toEqual(b));
    }
    const e = interval_1.Interval.Empty;
    const r05 = interval_1.Interval.ofRange(0, 5);
    const se05 = interval_1.Interval.ofBounds(0, 5);
    test('size', interval_1.Interval.size(e), 0);
    test('size', interval_1.Interval.size(r05), 6);
    test('size', interval_1.Interval.size(se05), 5);
    test('min/max', [interval_1.Interval.min(e), interval_1.Interval.max(e)], [0, -1]);
    test('min/max', [interval_1.Interval.min(r05), interval_1.Interval.max(r05)], [0, 5]);
    test('min/max', [interval_1.Interval.min(se05), interval_1.Interval.max(se05)], [0, 4]);
    test('start/end', [interval_1.Interval.start(e), interval_1.Interval.end(e)], [0, 0]);
    test('start/end', [interval_1.Interval.start(r05), interval_1.Interval.end(r05)], [0, 6]);
    test('start/end', [interval_1.Interval.start(se05), interval_1.Interval.end(se05)], [0, 5]);
    test('has', interval_1.Interval.has(e, 5), false);
    test('has', interval_1.Interval.has(r05, 5), true);
    test('has', interval_1.Interval.has(r05, 6), false);
    test('has', interval_1.Interval.has(r05, -1), false);
    test('has', interval_1.Interval.has(se05, 5), false);
    test('has', interval_1.Interval.has(se05, 4), true);
    test('indexOf', interval_1.Interval.indexOf(e, 5), -1);
    test('indexOf', interval_1.Interval.indexOf(r05, 5), 5);
    test('indexOf', interval_1.Interval.indexOf(r05, 6), -1);
    test('getAt', interval_1.Interval.getAt(r05, 5), 5);
    test('areEqual', interval_1.Interval.areEqual(r05, se05), false);
    test('areIntersecting1', interval_1.Interval.areIntersecting(r05, se05), true);
    test('areIntersecting2', interval_1.Interval.areIntersecting(r05, e), false);
    test('areIntersecting3', interval_1.Interval.areIntersecting(e, r05), false);
    test('areIntersecting4', interval_1.Interval.areIntersecting(e, e), true);
    test('areIntersecting5', interval_1.Interval.areIntersecting(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(-4, 3)), true);
    test('areIntersecting6', interval_1.Interval.areIntersecting(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(-4, -3)), false);
    test('areIntersecting7', interval_1.Interval.areIntersecting(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(1, 2)), true);
    test('areIntersecting8', interval_1.Interval.areIntersecting(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(3, 6)), true);
    test('isSubInterval', interval_1.Interval.isSubInterval(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(3, 6)), false);
    test('isSubInterval', interval_1.Interval.isSubInterval(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(3, 5)), true);
    testI('intersect', interval_1.Interval.intersect(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(-4, 3)), interval_1.Interval.ofRange(0, 3));
    testI('intersect1', interval_1.Interval.intersect(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(1, 3)), interval_1.Interval.ofRange(1, 3));
    testI('intersect2', interval_1.Interval.intersect(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(3, 5)), interval_1.Interval.ofRange(3, 5));
    testI('intersect3', interval_1.Interval.intersect(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(-4, -3)), interval_1.Interval.Empty);
    test('predIndex1', interval_1.Interval.findPredecessorIndex(r05, 5), 5);
    test('predIndex2', interval_1.Interval.findPredecessorIndex(r05, -1), 0);
    test('predIndex3', interval_1.Interval.findPredecessorIndex(r05, 6), 6);
    test('predIndexInt', interval_1.Interval.findPredecessorIndexInInterval(r05, 0, interval_1.Interval.ofRange(2, 3)), 2);
    test('predIndexInt1', interval_1.Interval.findPredecessorIndexInInterval(r05, 4, interval_1.Interval.ofRange(2, 3)), 4);
    test('predIndexInt2', interval_1.Interval.findPredecessorIndex(interval_1.Interval.ofRange(3, 10), 5), 2);
    test('predIndexInt3', interval_1.Interval.findPredecessorIndexInInterval(interval_1.Interval.ofRange(3, 10), 5, interval_1.Interval.ofRange(2, 6)), 2);
    testI('findRange', interval_1.Interval.findRange(r05, 2, 3), interval_1.Interval.ofRange(2, 3));
    test('intersectionSize1', interval_1.Interval.intersectionSize(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(0, 5)), 6);
    test('intersectionSize2', interval_1.Interval.intersectionSize(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(1, 2)), 2);
    test('intersectionSize3', interval_1.Interval.intersectionSize(interval_1.Interval.ofRange(1, 2), interval_1.Interval.ofRange(0, 5)), 2);
    test('intersectionSize4', interval_1.Interval.intersectionSize(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(3, 8)), 3);
    test('intersectionSize5', interval_1.Interval.intersectionSize(interval_1.Interval.ofRange(0, 5), interval_1.Interval.ofRange(6, 8)), 0);
});
