"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const iterator_1 = require("../iterator");
function iteratorToArray(it) {
    const ret = [];
    while (it.hasNext) {
        const v = it.move();
        ret[ret.length] = v;
    }
    return ret;
}
describe('basic iterators', () => {
    function check(name, iter, expected) {
        it(name, () => {
            expect(iteratorToArray(iter)).toEqual(expected);
        });
    }
    check('empty', iterator_1.Iterator.Empty, []);
    check('singleton', iterator_1.Iterator.Value(10), [10]);
    check('array', iterator_1.Iterator.Array([1, 2, 3]), [1, 2, 3]);
    check('range', iterator_1.Iterator.Range(0, 3), [0, 1, 2, 3]);
    check('map', iterator_1.Iterator.map(iterator_1.Iterator.Range(0, 1), x => x + 1), [1, 2]);
    check('filter', iterator_1.Iterator.filter(iterator_1.Iterator.Range(0, 3), x => x >= 2), [2, 3]);
});
