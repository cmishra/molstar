/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare function getGLContext(width: number, height: number): import("../webgl/context").WebGLContext;
export declare function tryGetGLContext(width: number, height: number, requiredExtensions?: {
    fragDepth?: boolean;
    textureFloat?: boolean;
}): import("../webgl/context").WebGLContext | undefined;
