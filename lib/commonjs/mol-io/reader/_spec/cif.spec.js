"use strict";
/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Data = tslib_1.__importStar(require("../cif/data-model"));
const Schema = tslib_1.__importStar(require("../cif/schema"));
const db_1 = require("../../../mol-data/db");
const parser_1 = require("../cif/text/parser");
const columnData = `123abc d,e,f '4 5 6'`;
// 123abc d,e,f '4 5 6'
const intField = Data.CifField.ofTokens({ data: columnData, indices: [0, 1, 1, 2, 2, 3], count: 3 });
const strField = Data.CifField.ofTokens({ data: columnData, indices: [3, 4, 4, 5, 5, 6], count: 3 });
const strListField = Data.CifField.ofTokens({ data: columnData, indices: [7, 12], count: 1 });
const intListField = Data.CifField.ofTokens({ data: columnData, indices: [14, 19], count: 1 });
const testBlock = Data.CifBlock(['test'], {
    test: Data.CifCategory('test', 3, ['int', 'str', 'strList', 'intList'], {
        int: intField,
        str: strField,
        strList: strListField,
        intList: intListField
    })
}, 'test');
var TestSchema;
(function (TestSchema) {
    TestSchema.test = {
        int: db_1.Column.Schema.int,
        str: db_1.Column.Schema.str,
        strList: db_1.Column.Schema.List(',', x => x),
        intList: db_1.Column.Schema.List(' ', x => parseInt(x, 10))
    };
    TestSchema.schema = { test: TestSchema.test };
})(TestSchema || (TestSchema = {}));
test('cif triple quote', async () => {
    const data = `data_test
_test.field1 '''123 " '' 1'''
_test.field2 ''' c glide reflection through the plane (x,1/4,z)
chosen as one of the generators of the space group'''`;
    const result = await (0, parser_1.parseCifText)(data).run();
    if (result.isError) {
        expect(false).toBe(true);
        return;
    }
    const cat = result.result.blocks[0].categories['test'];
    expect(cat.getField('field1').str(0)).toBe(`123 " '' 1`);
    expect(cat.getField('field2').str(0)).toBe(` c glide reflection through the plane (x,1/4,z)
chosen as one of the generators of the space group`);
});
describe('schema', () => {
    const db = Schema.toDatabase(TestSchema.schema, testBlock);
    it('property access', () => {
        const { int, str, strList, intList } = db.test;
        expect(int.value(0)).toBe(1);
        expect(str.value(1)).toBe('b');
        expect(strList.value(0)).toEqual(['d', 'e', 'f']);
        expect(intList.value(0)).toEqual([4, 5, 6]);
    });
    it('toArray', () => {
        const ret = db.test.int.toArray({ array: Int32Array });
        expect(ret.length).toBe(3);
        expect(ret[0]).toBe(1);
        expect(ret[1]).toBe(2);
        expect(ret[2]).toBe(3);
    });
});
