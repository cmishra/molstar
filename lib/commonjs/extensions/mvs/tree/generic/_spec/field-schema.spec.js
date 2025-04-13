"use strict";
/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const field_schema_1 = require("../field-schema");
describe('fieldValidationIssues', () => {
    it('fieldValidationIssues string', async () => {
        const stringField = (0, field_schema_1.RequiredField)(field_schema_1.str, 'Testing required field stringField');
        expect((0, field_schema_1.fieldValidationIssues)(stringField, 'hello')).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(stringField, '')).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(stringField, 5)).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(stringField, null)).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(stringField, undefined)).toBeTruthy();
    });
    it('fieldValidationIssues string choice', async () => {
        const colorParam = (0, field_schema_1.RequiredField)((0, field_schema_1.literal)('red', 'green', 'blue', 'yellow'), 'Testing required field colorParam');
        expect((0, field_schema_1.fieldValidationIssues)(colorParam, 'red')).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(colorParam, 'green')).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(colorParam, 'blue')).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(colorParam, 'yellow')).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(colorParam, 'banana')).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(colorParam, 5)).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(colorParam, null)).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(colorParam, undefined)).toBeTruthy();
    });
    it('fieldValidationIssues number choice', async () => {
        const numberParam = (0, field_schema_1.RequiredField)((0, field_schema_1.literal)(1, 2, 3, 4), 'Testing required field numberParam');
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, 1)).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, 2)).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, 3)).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, 4)).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, 5)).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, '1')).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, null)).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, undefined)).toBeTruthy();
    });
    it('fieldValidationIssues int', async () => {
        const numberParam = (0, field_schema_1.RequiredField)(field_schema_1.int, 'Testing required field numberParam');
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, 1)).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, 0)).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, 0.5)).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, '1')).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, null)).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(numberParam, undefined)).toBeTruthy();
    });
    it('fieldValidationIssues union', async () => {
        const stringOrNumberParam = (0, field_schema_1.RequiredField)((0, field_schema_1.union)([field_schema_1.str, field_schema_1.float]), 'Testing required field stringOrNumberParam');
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNumberParam, 1)).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNumberParam, 2)).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNumberParam, 'hello')).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNumberParam, '')).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNumberParam, true)).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNumberParam, null)).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNumberParam, undefined)).toBeTruthy();
    });
    it('fieldValidationIssues nullable', async () => {
        const stringOrNullParam = (0, field_schema_1.RequiredField)((0, field_schema_1.nullable)(field_schema_1.str), 'Testing required field stringOrNullParam');
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNullParam, 'hello')).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNullParam, '')).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNullParam, null)).toBeUndefined();
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNullParam, 1)).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNullParam, true)).toBeTruthy();
        expect((0, field_schema_1.fieldValidationIssues)(stringOrNullParam, undefined)).toBeTruthy();
    });
});
