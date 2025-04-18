"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ordered_set_1 = require("../ordered-set");
const interval_1 = require("../interval");
const segmentation_1 = require("../segmentation");
describe('segments', () => {
    const data = ordered_set_1.OrderedSet.ofSortedArray([4, 9, 10, 11, 14, 15, 16]);
    const segs = segmentation_1.Segmentation.create([0, 4, 10, 12, 13, 15, 25]);
    it('size', () => expect(segmentation_1.Segmentation.count(segs)).toBe(6));
    it('project', () => {
        const p = segmentation_1.Segmentation.projectValue(segs, data, 4);
        expect(p).toBe(interval_1.Interval.ofBounds(0, 2));
    });
    it('ofOffsetts', () => {
        const p = segmentation_1.Segmentation.ofOffsets([10, 12], interval_1.Interval.ofBounds(10, 14));
        expect(p.offsets).toEqual(new Int32Array([0, 2, 4]));
    });
    it('map', () => {
        const segs = segmentation_1.Segmentation.create([0, 1, 2]);
        expect(segs.index).toEqual(new Int32Array([0, 1]));
        expect(segmentation_1.Segmentation.getSegment(segs, 0)).toBe(0);
        expect(segmentation_1.Segmentation.getSegment(segs, 1)).toBe(1);
    });
    it('iteration', () => {
        const it = segmentation_1.Segmentation.transientSegments(segs, data);
        const t = Object.create(null);
        let count = 0;
        while (it.hasNext) {
            count++;
            const s = it.move();
            for (let j = s.start; j < s.end; j++) {
                const x = t[s.index];
                const v = ordered_set_1.OrderedSet.getAt(data, j);
                if (!x)
                    t[s.index] = [v];
                else
                    x[x.length] = v;
            }
        }
        expect(t).toEqual({ 1: [4, 9], 2: [10, 11], 4: [14], 5: [15, 16] });
        expect(count).toBe(4);
    });
    it('units', () => {
        const data = ordered_set_1.OrderedSet.ofBounds(0, 4);
        const segs = segmentation_1.Segmentation.create([0, 1, 2, 3, 4]);
        const it = segmentation_1.Segmentation.transientSegments(segs, data, { index: 0, start: 2, end: 4 });
        const t = Object.create(null);
        let count = 0;
        while (it.hasNext) {
            count++;
            const s = it.move();
            for (let j = s.start; j < s.end; j++) {
                const x = t[s.index];
                const v = ordered_set_1.OrderedSet.getAt(data, j);
                if (!x)
                    t[s.index] = [v];
                else
                    x[x.length] = v;
            }
        }
        expect(t).toEqual({ 2: [2], 3: [3] });
        expect(count).toBe(2);
    });
    it('iteration range', () => {
        const segs = segmentation_1.Segmentation.create([0, 2, 4]);
        const dataRange = ordered_set_1.OrderedSet.ofBounds(0, 4);
        const it = segmentation_1.Segmentation.transientSegments(segs, dataRange);
        const t = Object.create(null);
        let count = 0;
        while (it.hasNext) {
            count++;
            const s = it.move();
            for (let j = s.start; j < s.end; j++) {
                const x = t[s.index];
                const v = ordered_set_1.OrderedSet.getAt(dataRange, j);
                if (!x)
                    t[s.index] = [v];
                else
                    x[x.length] = v;
            }
        }
        expect(count).toBe(2);
        expect(t).toEqual({ 0: [0, 1], 1: [2, 3] });
    });
    it('iteration range 1', () => {
        const segs = segmentation_1.Segmentation.create([0, 2, 4]);
        const dataRange = ordered_set_1.OrderedSet.ofBounds(0, 4);
        const it = segmentation_1.Segmentation.transientSegments(segs, dataRange, { index: 0, start: 2, end: 4 });
        const t = Object.create(null);
        let count = 0;
        while (it.hasNext) {
            count++;
            const s = it.move();
            for (let j = s.start; j < s.end; j++) {
                const x = t[s.index];
                const v = ordered_set_1.OrderedSet.getAt(dataRange, j);
                if (!x)
                    t[s.index] = [v];
                else
                    x[x.length] = v;
            }
        }
        expect(count).toBe(1);
        expect(t).toEqual({ 1: [2, 3] });
    });
});
