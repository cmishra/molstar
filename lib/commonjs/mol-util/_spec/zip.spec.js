"use strict";
/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const zip_1 = require("../zip/zip");
const synchronous_1 = require("../../mol-task/execution/synchronous");
describe('zip', () => {
    it('roundtrip deflate/inflate', async () => {
        const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
        const deflated = await (0, zip_1.deflate)(synchronous_1.SyncRuntimeContext, data);
        const inflated = await (0, zip_1.inflate)(synchronous_1.SyncRuntimeContext, deflated);
        expect(inflated).toEqual(data);
    });
    it('roundtrip zip/unzip', async () => {
        const data = {
            'test.foo': new Uint8Array([1, 2, 3, 4, 5, 6, 7])
        };
        const zipped = await (0, zip_1.zip)(synchronous_1.SyncRuntimeContext, data);
        const unzipped = await (0, zip_1.unzip)(synchronous_1.SyncRuntimeContext, zipped);
        expect(unzipped).toEqual(data);
    });
});
