"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const approx_1 = require("../../approx");
describe('approx', () => {
    it('fastPow2', () => {
        expect((0, approx_1.fastPow2)(4)).toBeCloseTo(Math.pow(2, 4), 2);
    });
    it('fasterPow2', () => {
        expect((0, approx_1.fasterPow2)(4)).toBeCloseTo(Math.pow(2, 4), 0);
    });
    it('fastExp', () => {
        expect((0, approx_1.fastExp)(4)).toBeCloseTo(Math.exp(4), 2);
    });
    it('fasterExp', () => {
        expect((0, approx_1.fasterExp)(4)).toBeCloseTo(Math.exp(4), 0);
    });
    it('fastLog', () => {
        expect((0, approx_1.fastLog)(12)).toBeCloseTo(Math.log(12), 2);
    });
    it('fasterLog', () => {
        expect((0, approx_1.fasterLog)(12)).toBeCloseTo(Math.log(12), 1);
    });
    it('fastLog10', () => {
        expect((0, approx_1.fastLog10)(42)).toBeCloseTo(Math.log10(42), 2);
    });
    it('fasterLog10', () => {
        expect((0, approx_1.fasterLog10)(42)).toBeCloseTo(Math.log10(42), 1);
    });
    it('fastSinh', () => {
        expect((0, approx_1.fastSinh)(0.3)).toBeCloseTo(Math.sinh(0.3), 2);
    });
    it('fasterSinh', () => {
        expect((0, approx_1.fasterSinh)(0.3)).toBeCloseTo(Math.sinh(0.3), 1);
    });
    it('fastCosh', () => {
        expect((0, approx_1.fastCosh)(0.3)).toBeCloseTo(Math.cosh(0.3), 2);
    });
    it('fasterCosh', () => {
        expect((0, approx_1.fasterCosh)(0.3)).toBeCloseTo(Math.cosh(0.3), 1);
    });
    it('fastTanh', () => {
        expect((0, approx_1.fastTanh)(0.3)).toBeCloseTo(Math.tanh(0.3), 2);
    });
    it('fasterTanh', () => {
        expect((0, approx_1.fasterTanh)(0.3)).toBeCloseTo(Math.tanh(0.3), 1);
    });
    it('fastSin', () => {
        expect((0, approx_1.fastSin)(0.3)).toBeCloseTo(Math.sin(0.3), 2);
    });
    it('fasterSin', () => {
        expect((0, approx_1.fasterSin)(0.3)).toBeCloseTo(Math.sin(0.3), 1);
    });
    it('fastCos', () => {
        expect((0, approx_1.fastCos)(0.3)).toBeCloseTo(Math.cos(0.3), 2);
    });
    it('fasterCos', () => {
        expect((0, approx_1.fasterCos)(0.3)).toBeCloseTo(Math.cos(0.3), 1);
    });
    it('fastTan', () => {
        expect((0, approx_1.fastTan)(0.3)).toBeCloseTo(Math.tan(0.3), 2);
    });
    it('fasterTan', () => {
        expect((0, approx_1.fasterTan)(0.3)).toBeCloseTo(Math.tan(0.3), 1);
    });
    it('fastAtan', () => {
        expect((0, approx_1.fastAtan)(0.3)).toBeCloseTo(Math.atan(0.3), 2);
    });
    it('fastAtan2', () => {
        expect((0, approx_1.fastAtan2)(0.1, 0.5)).toBeCloseTo(Math.atan2(0.1, 0.5), 2);
    });
});
