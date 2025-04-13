"use strict";
/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mvs_data_1 = require("../../../mvs-data");
const mvs_builder_1 = require("../mvs-builder");
describe('mvs-builder', () => {
    it('mvs-builder demo works', async () => {
        const mvsData = (0, mvs_builder_1.builderDemo)();
        expect(typeof mvsData.metadata.version).toEqual('string');
        expect(typeof mvsData.metadata.timestamp).toEqual('string');
        expect(mvs_data_1.MVSData.validationIssues(mvsData)).toEqual(undefined);
    });
});
