"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const string_builder_1 = require("../string-builder");
describe('string-builder', () => {
    function check(name, bb, expected) {
        const sb = string_builder_1.StringBuilder.create();
        bb(sb);
        it(name, () => expect(string_builder_1.StringBuilder.getString(sb)).toEqual(expected));
    }
    check('write', sb => string_builder_1.StringBuilder.write(sb, '123'), '123');
    check('whitespace', sb => string_builder_1.StringBuilder.whitespace(sb, 3), '   ');
    check('writePadLeft', sb => string_builder_1.StringBuilder.writePadLeft(sb, '1', 3), '  1');
    check('writePadRight', sb => string_builder_1.StringBuilder.writePadRight(sb, '1', 3), '1  ');
    check('writeIntegerPadLeft', sb => string_builder_1.StringBuilder.writeIntegerPadLeft(sb, -125, 5), ' -125');
    check('writeIntegerPadRight', sb => string_builder_1.StringBuilder.writeIntegerPadRight(sb, -125, 5), '-125 ');
    check('writeFloat', sb => string_builder_1.StringBuilder.writeFloat(sb, 1.123, 100), '1.12');
    check('writeFloatPadLeft', sb => string_builder_1.StringBuilder.writeFloatPadLeft(sb, 1.123, 100, 6), '  1.12');
    check('writeFloatPadRight', sb => string_builder_1.StringBuilder.writeFloatPadRight(sb, -1.123, 100, 6), '-1.12 ');
    it('chunks', () => {
        const sb = string_builder_1.StringBuilder.create(2);
        string_builder_1.StringBuilder.write(sb, '1');
        string_builder_1.StringBuilder.write(sb, '2');
        string_builder_1.StringBuilder.write(sb, '3');
        expect(string_builder_1.StringBuilder.getChunks(sb)).toEqual(['12', '3']);
        expect(string_builder_1.StringBuilder.getString(sb)).toEqual('123');
    });
});
