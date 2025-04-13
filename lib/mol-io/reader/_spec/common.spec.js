/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { parseFloat as fastParseFloat, parseInt as fastParseInt, getNumberType } from '../../../mol-io/reader/common/text/number-parser';
describe('common', () => {
    it('number-parser fastParseFloat', () => {
        // ignore suffix numbers in parentheses
        expect(fastParseFloat('11.0829(23)', 0, 11)).toBe(11.0829);
        // scientific with no space between consecutive values
        expect(fastParseFloat('-5.1E-01-6.1E-01', 0, 11)).toBe(-0.51);
        // ignore plus sign
        expect(fastParseFloat('+0.149', 0, 6)).toBe(0.149);
    });
    it('number-parser fastParseInt', () => {
        // ignore suffix numbers in parentheses
        expect(fastParseInt('11(23)', 0, 11)).toBe(11);
        // ignore plus sign
        expect(fastParseFloat('+10149', 0, 6)).toBe(10149);
    });
    it('number-parser getNumberType', () => {
        expect(getNumberType('11')).toBe(0 /* NumberTypes.Int */);
        expect(getNumberType('5E93')).toBe(2 /* NumberTypes.Scientific */);
        expect(getNumberType('0.42')).toBe(1 /* NumberTypes.Float */);
        expect(getNumberType('Foo123')).toBe(3 /* NumberTypes.NaN */);
        expect(getNumberType('11.0829(23)')).toBe(3 /* NumberTypes.NaN */);
        expect(getNumberType('1..2')).toBe(3 /* NumberTypes.NaN */);
        expect(getNumberType('.')).toBe(3 /* NumberTypes.NaN */);
        expect(getNumberType('-.')).toBe(3 /* NumberTypes.NaN */);
        expect(getNumberType('e')).toBe(3 /* NumberTypes.NaN */);
        expect(getNumberType('-e')).toBe(3 /* NumberTypes.NaN */);
        expect(getNumberType('1e')).toBe(2 /* NumberTypes.Scientific */);
        expect(getNumberType('-1e')).toBe(2 /* NumberTypes.Scientific */);
    });
});
