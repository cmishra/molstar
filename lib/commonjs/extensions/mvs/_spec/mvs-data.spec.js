"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const mvs_data_1 = require("../mvs-data");
describe('MVSData', () => {
    it.skip('MVSData functions work', async () => {
        const data = fs_1.default.readFileSync('examples/mvs/1cbs.mvsj', { encoding: 'utf8' });
        const mvsData = mvs_data_1.MVSData.fromMVSJ(data);
        expect(mvsData).toBeTruthy();
        expect(mvs_data_1.MVSData.validationIssues(mvsData)).toEqual(undefined);
        expect(mvs_data_1.MVSData.isValid(mvsData)).toEqual(true);
        const reencoded = mvs_data_1.MVSData.toMVSJ(mvsData);
        expect(reencoded.replace(/\s/g, '')).toEqual(data.replace(/\s/g, ''));
        const prettyString = mvs_data_1.MVSData.toPrettyString(mvsData);
        expect(typeof prettyString).toEqual('string');
        expect(prettyString.length).toBeGreaterThan(0);
    });
    it.skip('MVSData builder works', async () => {
        const builder = mvs_data_1.MVSData.createBuilder();
        expect(builder).toBeTruthy();
        const mvsData = builder.getState();
        expect(mvs_data_1.MVSData.validationIssues(mvsData)).toEqual(undefined);
        builder
            .download({ url: 'http://example.com' })
            .parse({ format: 'mmcif' })
            .assemblyStructure({ assembly_id: '1' })
            .component({ selector: 'polymer' })
            .representation()
            .color({ color: 'green', selector: { label_asym_id: 'A' } });
        const mvsData2 = builder.getState();
        expect(mvs_data_1.MVSData.validationIssues(mvsData2)).toEqual(undefined);
    });
});
