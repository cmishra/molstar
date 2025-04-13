"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const array_1 = require("../../../../mol-util/array");
const selections_1 = require("../selections");
describe('groupRows', () => {
    it('groupRows', async () => {
        const rows = [
            { label: 'A' }, { label: 'B', group_id: 1 }, { label: 'C', group_id: 'x' }, { label: 'D', group_id: 1 },
            { label: 'E' }, { label: 'F' }, { label: 'G', group_id: 'x' }, { label: 'H', group_id: 'x' },
        ];
        const g = (0, selections_1.groupRows)(rows);
        const groupedIndices = (0, array_1.range)(g.count).map(i => g.grouped.slice(g.offsets[i], g.offsets[i + 1]));
        const groupedRows = groupedIndices.map(group => group.map(j => rows[j]));
        expect(groupedRows).toEqual([
            [{ label: 'A' }],
            [{ label: 'B', group_id: 1 }, { label: 'D', group_id: 1 }],
            [{ label: 'C', group_id: 'x' }, { label: 'G', group_id: 'x' }, { label: 'H', group_id: 'x' }],
            [{ label: 'E' }],
            [{ label: 'F' }],
        ]);
    });
});
