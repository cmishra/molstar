"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const number_parser_1 = require("../../../mol-io/reader/common/text/number-parser");
describe('common', () => {
    it('number-parser fastParseFloat', () => {
        // ignore suffix numbers in parentheses
        expect((0, number_parser_1.parseFloat)('11.0829(23)', 0, 11)).toBe(11.0829);
        // scientific with no space between consecutive values
        expect((0, number_parser_1.parseFloat)('-5.1E-01-6.1E-01', 0, 11)).toBe(-0.51);
        // ignore plus sign
        expect((0, number_parser_1.parseFloat)('+0.149', 0, 6)).toBe(0.149);
    });
    it('number-parser fastParseInt', () => {
        // ignore suffix numbers in parentheses
        expect((0, number_parser_1.parseInt)('11(23)', 0, 11)).toBe(11);
        // ignore plus sign
        expect((0, number_parser_1.parseFloat)('+10149', 0, 6)).toBe(10149);
    });
    it('number-parser getNumberType', () => {
        expect((0, number_parser_1.getNumberType)('11')).toBe(0 /* NumberTypes.Int */);
        expect((0, number_parser_1.getNumberType)('5E93')).toBe(2 /* NumberTypes.Scientific */);
        expect((0, number_parser_1.getNumberType)('0.42')).toBe(1 /* NumberTypes.Float */);
        expect((0, number_parser_1.getNumberType)('Foo123')).toBe(3 /* NumberTypes.NaN */);
        expect((0, number_parser_1.getNumberType)('11.0829(23)')).toBe(3 /* NumberTypes.NaN */);
        expect((0, number_parser_1.getNumberType)('1..2')).toBe(3 /* NumberTypes.NaN */);
        expect((0, number_parser_1.getNumberType)('.')).toBe(3 /* NumberTypes.NaN */);
        expect((0, number_parser_1.getNumberType)('-.')).toBe(3 /* NumberTypes.NaN */);
        expect((0, number_parser_1.getNumberType)('e')).toBe(3 /* NumberTypes.NaN */);
        expect((0, number_parser_1.getNumberType)('-e')).toBe(3 /* NumberTypes.NaN */);
        expect((0, number_parser_1.getNumberType)('1e')).toBe(2 /* NumberTypes.Scientific */);
        expect((0, number_parser_1.getNumberType)('-1e')).toBe(2 /* NumberTypes.Scientific */);
    });
});
