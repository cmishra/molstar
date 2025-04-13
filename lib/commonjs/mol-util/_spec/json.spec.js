"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const json_1 = require("../json");
describe('object utils', () => {
    it('canonicalJsonString', async () => {
        expect((0, json_1.canonicalJsonString)({})).toEqual('{}');
        const obj1 = { c: 1, b: 2, d: undefined, a: { x: null, f: undefined, e: 4 } };
        expect((0, json_1.canonicalJsonString)(obj1)).toEqual('{"a":{"e":4,"x":null},"b":2,"c":1}');
        const obj2 = { c: [1, { p: 'P', q: undefined }, 0], x: null, b: false, a: undefined };
        expect((0, json_1.canonicalJsonString)(obj2)).toEqual('{"b":false,"c":[1,{"p":"P"},0],"x":null}');
    });
});
