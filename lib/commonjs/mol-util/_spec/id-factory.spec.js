"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const id_factory_1 = require("../id-factory");
describe('id-factory', () => {
    it('basic', () => {
        const getNextId = (0, id_factory_1.idFactory)();
        expect(getNextId()).toBe(0);
        expect(getNextId()).toBe(1);
    });
    it('start-id', () => {
        const getNextId = (0, id_factory_1.idFactory)(5);
        expect(getNextId()).toBe(5);
        expect(getNextId()).toBe(6);
    });
    it('negative-start-id', () => {
        const getNextId = (0, id_factory_1.idFactory)(-1);
        expect(getNextId()).toBe(-1);
        expect(getNextId()).toBe(0);
    });
    it('max-id', () => {
        const getNextId = (0, id_factory_1.idFactory)(0, 2);
        expect(getNextId()).toBe(0);
        expect(getNextId()).toBe(1);
        expect(getNextId()).toBe(0);
        expect(getNextId()).toBe(1);
    });
});
