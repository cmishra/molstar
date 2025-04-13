"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const monadic_parser_1 = require("../monadic-parser");
describe('parser', () => {
    it('string', () => {
        const p = monadic_parser_1.MonadicParser.string('abc');
        expect(p.parse('abc').success).toBe(true);
        expect(p.parse('cabc').success).toBe(false);
    });
    it('alt', () => {
        const p = monadic_parser_1.MonadicParser.alt(monadic_parser_1.MonadicParser.string('abc'), monadic_parser_1.MonadicParser.string('123'));
        expect(p.parse('abc').success).toBe(true);
        expect(p.parse('123').success).toBe(true);
        expect(p.parse('123a').success).toBe(false);
    });
    it('trim', () => {
        const p = monadic_parser_1.MonadicParser.string('abc').trim(monadic_parser_1.MonadicParser.whitespace);
        expect(p.tryParse(' abc ')).toBe('abc');
    });
    it('wrap', () => {
        const p = monadic_parser_1.MonadicParser.string('abc').wrap(monadic_parser_1.MonadicParser.string('('), monadic_parser_1.MonadicParser.string(')'));
        expect(p.tryParse('(abc)')).toBe('abc');
    });
    it('then', () => {
        const p = monadic_parser_1.MonadicParser.string('abc').then(monadic_parser_1.MonadicParser.string('123'));
        expect(p.tryParse('abc123')).toBe('123');
    });
    it('many', () => {
        const p = monadic_parser_1.MonadicParser.string('1').many();
        expect(p.tryParse('111')).toEqual(['1', '1', '1']);
    });
    it('times', () => {
        const p = monadic_parser_1.MonadicParser.string('1').times(2);
        expect(p.tryParse('11')).toEqual(['1', '1']);
    });
    it('sepBy', () => {
        const p = monadic_parser_1.MonadicParser.sepBy(monadic_parser_1.MonadicParser.digits, monadic_parser_1.MonadicParser.string(',')).map(xs => xs.map(x => +x));
        expect(p.tryParse('1,2,3,4')).toEqual([1, 2, 3, 4]);
    });
});
