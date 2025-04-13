"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tuple_1 = require("../tuple");
describe('int pair', () => {
    it('works', () => {
        for (let i = 0; i < 10; i++) {
            for (let j = -10; j < 5; j++) {
                const t = tuple_1.IntTuple.create(i, j);
                expect(tuple_1.IntTuple.fst(t)).toBe(i);
                expect(tuple_1.IntTuple.snd(t)).toBe(j);
            }
        }
    });
});
