"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ColumnHelpers = tslib_1.__importStar(require("../column-helpers"));
const column_1 = require("../column");
const table_1 = require("../table");
describe('column', () => {
    const cc = column_1.Column.ofConst(10, 2, column_1.Column.Schema.int);
    const arr = column_1.Column.ofArray({ array: [1, 2, 3, 4], schema: column_1.Column.Schema.int });
    const arrNumberList = column_1.Column.ofArray({ array: [[1, 2], [3, 4], [5, 6]], schema: column_1.Column.Schema.List(' ', x => parseInt(x, 10)) });
    const arrStringList = column_1.Column.ofArray({ array: [['a', 'b'], ['c', 'd'], ['e', 'f']], schema: column_1.Column.Schema.List(',', x => x) });
    const arrWindow = column_1.Column.window(arr, 1, 3);
    const typed = column_1.Column.ofArray({ array: new Int32Array([1, 2, 3, 4]), schema: column_1.Column.Schema.int });
    const typedWindow = column_1.Column.window(typed, 1, 3);
    const numStr = column_1.Column.ofArray({ array: [1, 2], schema: column_1.Column.Schema.str });
    it('constant', () => {
        expect(cc.rowCount).toBe(2);
        expect(cc.value(0)).toBe(10);
    });
    it('arr', () => {
        expect(arr.rowCount).toBe(4);
        expect(arr.value(1)).toBe(2);
        expect(arrWindow.value(0)).toBe(2);
        expect(arrWindow.rowCount).toBe(2);
    });
    it('arrList', () => {
        expect(arrNumberList.rowCount).toBe(3);
        expect(arrNumberList.value(1)).toEqual([3, 4]);
        expect(arrStringList.rowCount).toBe(3);
        expect(arrStringList.value(2)).toEqual(['e', 'f']);
    });
    it('typed', () => {
        expect(typedWindow.value(0)).toBe(2);
        expect(typedWindow.rowCount).toBe(2);
        expect(ColumnHelpers.isTypedArray(typedWindow.toArray())).toBe(true);
    });
    it('numStr', () => {
        expect(numStr.value(0)).toBe('1');
        expect(numStr.toArray()).toEqual(['1', '2']);
    });
    it('view', () => {
        expect(column_1.Column.view(arr, [1, 0, 3, 2]).toArray()).toEqual([2, 1, 4, 3]);
        expect(column_1.Column.view(arr, [1, 3]).toArray()).toEqual([2, 4]);
    });
    it('map to array', () => {
        expect(column_1.Column.mapToArray(arrWindow, x => x + 1)).toEqual([3, 4]);
    });
});
describe('string column', () => {
    const xs = ['A', 'b', null, undefined];
    const xsArr = xs.map(x => x !== null && x !== void 0 ? x : '');
    const xsLC = xs.map(x => (x !== null && x !== void 0 ? x : '').toLowerCase());
    const arr = column_1.Column.ofArray({ array: xs, schema: column_1.Column.Schema.str });
    const arrLC = column_1.Column.ofArray({ array: xs, schema: column_1.Column.Schema.Str({ transform: 'lowercase' }) });
    const aliasedLC = column_1.Column.ofArray({ array: xs, schema: column_1.Column.Schema.Aliased(column_1.Column.Schema.lstr) });
    it('value', () => {
        var _a, _b;
        for (let i = 0; i < xs.length; i++) {
            expect(arr.value(i)).toBe((_a = xs[i]) !== null && _a !== void 0 ? _a : '');
            expect(arrLC.value(i)).toBe((_b = xsLC[i]) !== null && _b !== void 0 ? _b : '');
            expect(aliasedLC.value(i)).toBe(xsLC[i]);
        }
    });
    it('array', () => {
        expect(arr.toArray()).toEqual(xsArr);
        expect(arrLC.toArray()).toEqual(xsLC);
        expect(aliasedLC.toArray()).toEqual(xsLC);
    });
});
describe('table', () => {
    const schema = {
        x: column_1.Column.Schema.int,
        n: column_1.Column.Schema.str
    };
    it('ofRows', () => {
        const t = table_1.Table.ofRows(schema, [
            { x: 10, n: 'row1' },
            { x: -1, n: 'row2' },
        ]);
        expect(t.x.toArray()).toEqual([10, -1]);
        expect(t.n.toArray()).toEqual(['row1', 'row2']);
    });
    it('ofColumns', () => {
        const t = table_1.Table.ofColumns(schema, {
            x: column_1.Column.ofArray({ array: [10, -1], schema: column_1.Column.Schema.int }),
            n: column_1.Column.ofArray({ array: ['row1', 'row2'], schema: column_1.Column.Schema.str }),
        });
        expect(t.x.toArray()).toEqual([10, -1]);
        expect(t.n.toArray()).toEqual(['row1', 'row2']);
    });
    it('ofArrays', () => {
        const t = table_1.Table.ofArrays(schema, {
            x: [10, -1],
            n: ['row1', 'row2'],
        });
        expect(t.x.toArray()).toEqual([10, -1]);
        expect(t.n.toArray()).toEqual(['row1', 'row2']);
    });
    it('pickColumns', () => {
        const t = table_1.Table.ofColumns(schema, {
            x: column_1.Column.ofArray({ array: [10, -1], schema: column_1.Column.Schema.int }),
            n: column_1.Column.ofArray({ array: ['row1', 'row2'], schema: column_1.Column.Schema.str }),
        });
        const s = { x: column_1.Column.Schema.int, y: column_1.Column.Schema.int };
        const picked = table_1.Table.pickColumns(s, t, { y: column_1.Column.ofArray({ array: [3, 4], schema: column_1.Column.Schema.int }) });
        expect(picked._columns).toEqual(['x', 'y']);
        expect(picked._rowCount).toEqual(2);
        expect(picked.x.toArray()).toEqual([10, -1]);
        expect(picked.y.toArray()).toEqual([3, 4]);
    });
    it('view', () => {
        const t = table_1.Table.ofColumns(schema, {
            x: column_1.Column.ofArray({ array: [10, -1], schema: column_1.Column.Schema.int }),
            n: column_1.Column.ofArray({ array: ['row1', 'row2'], schema: column_1.Column.Schema.str }),
        });
        const s = { x: column_1.Column.Schema.int };
        const view = table_1.Table.view(t, s, [1]);
        expect(view._columns).toEqual(['x']);
        expect(view._rowCount).toEqual(1);
        expect(view.x.toArray()).toEqual([-1]);
    });
    it('sort', () => {
        const t = table_1.Table.ofColumns(schema, {
            x: column_1.Column.ofArray({ array: [10, -1], schema: column_1.Column.Schema.int }),
            n: column_1.Column.ofArray({ array: ['row1', 'row2'], schema: column_1.Column.Schema.str }),
        });
        const { x } = t;
        const sorted = table_1.Table.sort(t, (i, j) => x.value(i) - x.value(j));
        expect(sorted.x.toArray()).toEqual([-1, 10]);
        expect(sorted.n.toArray()).toEqual(['row2', 'row1']);
    });
});
