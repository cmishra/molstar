/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * ported from https://github.com/photopea/UZIP.js/blob/master/UZIP.js
 * MIT License, Copyright (c) 2018 Photopea
 *
 * - added `ungzip`
 */
import { RuntimeContext, Task } from '../../mol-task';
export declare function Unzip(buf: ArrayBuffer, onlyNames?: boolean): Task<{
    [k: string]: Uint8Array<ArrayBufferLike> | {
        size: number;
        csize: number;
    };
}>;
export declare function unzip(runtime: RuntimeContext, buf: ArrayBuffer, onlyNames?: boolean): Promise<{
    [k: string]: Uint8Array<ArrayBufferLike> | {
        size: number;
        csize: number;
    };
}>;
export declare function inflateRaw(runtime: RuntimeContext, file: Uint8Array, buf?: Uint8Array): Promise<Uint8Array<ArrayBufferLike>>;
export declare function inflate(runtime: RuntimeContext, file: Uint8Array, buf?: Uint8Array): Promise<Uint8Array<ArrayBufferLike>>;
export declare function ungzip(runtime: RuntimeContext, file: Uint8Array, buf?: Uint8Array): Promise<Uint8Array<ArrayBufferLike>>;
export declare function deflate(runtime: RuntimeContext, data: Uint8Array, opts?: {
    level: number;
}): Promise<Uint8Array<ArrayBuffer>>;
export declare function Zip(obj: {
    [k: string]: Uint8Array;
}, noCmpr?: boolean): Task<ArrayBuffer>;
export declare function zip(runtime: RuntimeContext, obj: {
    [k: string]: Uint8Array;
}, noCmpr?: boolean): Promise<ArrayBuffer>;
