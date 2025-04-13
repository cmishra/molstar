"use strict";
/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const field_schema_1 = require("../field-schema");
const params_schema_1 = require("../params-schema");
const simpleSchema = (0, params_schema_1.SimpleParamsSchema)({
    name: (0, field_schema_1.OptionalField)(field_schema_1.str, 'Anonymous', 'Testing optional field name'),
    surname: (0, field_schema_1.RequiredField)(field_schema_1.str, 'Testing optional field surname'),
    lunch: (0, field_schema_1.RequiredField)(field_schema_1.bool, 'Testing optional field lunch'),
    age: (0, field_schema_1.OptionalField)(field_schema_1.int, 0, 'Testing optional field age'),
});
describe('validateParams', () => {
    it('validateParams', async () => {
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { surname: 'Doe', lunch: true }, { noExtra: true })).toBeUndefined();
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { name: 'John', surname: 'Doe', lunch: true }, { noExtra: true })).toBeUndefined();
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { surname: 'Doe', lunch: true, age: 29 }, { noExtra: true })).toBeUndefined();
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { name: 'John', surname: 'Doe', lunch: true, age: 29 }, { noExtra: true })).toBeUndefined();
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, {}, { noExtra: true })).toBeTruthy();
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { name: 'John', surname: 'Doe', age: 29 }, { noExtra: true })).toBeTruthy(); // missing `lunch`
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { name: 'John', surname: 'Doe', lunch: true, age: 'old' }, { noExtra: true })).toBeTruthy(); // wrong type of `age`
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { surname: 'Doe', lunch: true, married: false }, { noExtra: true })).toBeTruthy(); // extra param `married`
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { surname: 'Doe', lunch: true, married: false })).toBeUndefined(); // extra param `married`
    });
});
describe('validateFullParams', () => {
    it('validateFullParams', async () => {
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { surname: 'Doe', lunch: true }, { requireAll: true, noExtra: true })).toBeTruthy();
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { name: 'John', surname: 'Doe', lunch: true }, { requireAll: true, noExtra: true })).toBeTruthy();
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { surname: 'Doe', lunch: true, age: 29 }, { requireAll: true, noExtra: true })).toBeTruthy();
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { name: 'John', surname: 'Doe', lunch: true, age: 29 }, { requireAll: true, noExtra: true })).toBeUndefined();
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, {}, { requireAll: true, noExtra: true })).toBeTruthy();
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { name: 'John', surname: 'Doe', lunch: true, age: 'old' }, { requireAll: true, noExtra: true })).toBeTruthy(); // wrong type of `age`
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { name: 'John', surname: 'Doe', lunch: true, age: 29, married: true }, { requireAll: true, noExtra: true })).toBeTruthy(); // extra param `married`
        expect((0, params_schema_1.paramsValidationIssues)(simpleSchema, { name: 'John', surname: 'Doe', lunch: true, age: 29, married: true }, { requireAll: true, noExtra: false })).toBeUndefined(); // extra param `married`
    });
});
const unionSchema = (0, params_schema_1.UnionParamsSchema)('kind', 'Description for "kind"', {
    person: (0, params_schema_1.SimpleParamsSchema)({
        name: (0, field_schema_1.OptionalField)(field_schema_1.str, 'Anonymous', 'Testing optional field name'),
        surname: (0, field_schema_1.RequiredField)(field_schema_1.str, 'Testing optional field surname'),
        lunch: (0, field_schema_1.RequiredField)(field_schema_1.bool, 'Testing optional field lunch'),
        age: (0, field_schema_1.OptionalField)(field_schema_1.int, 0, 'Testing optional field age'),
    }),
    object: (0, params_schema_1.SimpleParamsSchema)({
        weight: (0, field_schema_1.RequiredField)(field_schema_1.float, 'Testing optional field weight'),
        color: (0, field_schema_1.OptionalField)(field_schema_1.str, 'colorless', 'Testing optional field color'),
    }),
});
describe('validateUnionParams', () => {
    it('validateUnionParams', async () => {
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { surname: 'Doe', lunch: true }, { noExtra: true })).toBeTruthy(); // missing discriminator param `kind`
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'person', surname: 'Doe', lunch: true }, { noExtra: true })).toBeUndefined();
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'person', name: 'John', surname: 'Doe', lunch: true }, { noExtra: true })).toBeUndefined();
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'person', surname: 'Doe', lunch: true, age: 29 }, { noExtra: true })).toBeUndefined();
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'person', name: 'John', surname: 'Doe', lunch: true, age: 29 }, { noExtra: true })).toBeUndefined();
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'person' }, { noExtra: true })).toBeTruthy();
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'person', name: 'John', surname: 'Doe', age: 29 }, { noExtra: true })).toBeTruthy(); // missing `lunch`
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'person', name: 'John', surname: 'Doe', lunch: true, age: 'old' }, { noExtra: true })).toBeTruthy(); // wrong type of `age`
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'person', surname: 'Doe', lunch: true, married: false }, { noExtra: true })).toBeTruthy(); // extra param `married`
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'person', surname: 'Doe', lunch: true, married: false })).toBeUndefined(); // extra param `married`
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'object', weight: 42, color: 'black' }, { noExtra: true })).toBeUndefined();
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'object', weight: 42 }, { noExtra: true })).toBeUndefined();
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'object', color: 'black' }, { noExtra: true })).toBeTruthy(); // missing param `weight`
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'object', weight: 42, name: 'John' }, { noExtra: true })).toBeTruthy(); // extra param `name`
        expect((0, params_schema_1.paramsValidationIssues)(unionSchema, { kind: 'spanish_inquisition' }, { noExtra: true })).toBeTruthy(); // unexpected value for discriminator param `kind`
    });
});
