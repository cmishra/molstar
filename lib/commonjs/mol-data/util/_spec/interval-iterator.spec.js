"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const int_1 = require("../../int");
const interval_iterator_1 = require("../interval-iterator");
describe('interval', () => {
    function testIterator(name, interval, set, expectedValues) {
        it(`iterator, ${name}`, () => {
            const intervalIt = new interval_iterator_1.IntervalIterator(interval, set);
            const { index, start, end } = expectedValues;
            let i = 0;
            while (intervalIt.hasNext) {
                const segment = intervalIt.move();
                expect(segment.index).toBe(index[i]);
                expect(segment.start).toBe(start[i]);
                expect(segment.end).toBe(end[i]);
                ++i;
            }
            expect(i).toBe(index.length);
        });
    }
    testIterator('basic', int_1.Interval.ofRange(0, 5), int_1.SortedArray.ofSortedArray([1, 3, 7, 8]), { index: [1, 3], start: [0, 1], end: [1, 2] });
});
