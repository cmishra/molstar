"use strict";
/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const u = tslib_1.__importStar(require("./utils"));
const parser_1 = require("../vmd/parser");
const keywords_1 = require("../vmd/keywords");
const properties_1 = require("../vmd/properties");
const operators_1 = require("../vmd/operators");
const general = {
    supported: [
        // trimming
        '    name CA   ',
        'name CA   ',
        '    name CA',
    ],
    unsupported: [
        // variables
        'name $atomname',
        'protein and @myselection',
        // values outside of comparisons
        'foobar',
        '34',
        'name',
        'abs(-42)',
        'abs(21+21)',
        'sqr(3)',
        'sqr(x)',
        'sqr(x+33)',
        'protein or foobar',
        '34 and protein',
        'name or protein',
    ]
};
describe('vmd general', () => {
    general.supported.forEach(str => {
        it(str, () => {
            (0, parser_1.transpiler)(str);
            // compile(expr);
        });
    });
    general.unsupported.forEach(str => {
        it(str, () => {
            const transpileStr = () => (0, parser_1.transpiler)(str);
            expect(transpileStr).toThrow();
            expect(transpileStr).not.toThrowError(RangeError);
        });
    });
});
describe('vmd keywords', () => u.testKeywords(keywords_1.keywords, parser_1.transpiler));
describe('vmd operators', () => u.testOperators(operators_1.operators, parser_1.transpiler));
describe('vmd properties', () => u.testProperties(properties_1.properties, parser_1.transpiler));
