/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { WebGLContext } from './context';
import { ShaderCode } from '../shader-code';
import { Program } from './program';
import { RenderableSchema, RenderableValues } from '../renderable/schema';
import { UniformsList } from './uniform';
export type DrawMode = 'points' | 'lines' | 'line-strip' | 'line-loop' | 'triangles' | 'triangle-strip' | 'triangle-fan';
export declare function getDrawMode(ctx: WebGLContext, drawMode: DrawMode): 0 | 1 | 2 | 3 | 6 | 5 | 4;
export type MultiDrawBaseData = {
    /** Only used for `multiDrawArraysInstancedBaseInstance` */
    firsts: Int32Array;
    counts: Int32Array;
    /** Only used for `multiDrawElementsInstancedBaseVertexBaseInstance` */
    offsets: Int32Array;
    instanceCounts: Int32Array;
    /** Only used for `multiDrawElementsInstancedBaseVertexBaseInstance` */
    baseVertices: Int32Array;
    baseInstances: Uint32Array;
    count: number;
    uniforms: UniformsList;
};
export interface RenderItem<T extends string> {
    readonly id: number;
    readonly materialId: number;
    getProgram: (variant: T) => Program;
    setTransparency: (transparency: Transparency) => void;
    render: (variant: T, sharedTexturesCount: number, mdbDataList?: MultiDrawBaseData[]) => void;
    update: () => void;
    destroy: () => void;
}
declare const GraphicsRenderVariant: {
    color: string;
    pick: string;
    depth: string;
    marking: string;
    emissive: string;
    tracing: string;
};
export type GraphicsRenderVariant = keyof typeof GraphicsRenderVariant;
export declare const GraphicsRenderVariants: GraphicsRenderVariant[];
declare const ComputeRenderVariant: {
    compute: string;
};
export type ComputeRenderVariant = keyof typeof ComputeRenderVariant;
export declare const ComputeRenderVariants: ComputeRenderVariant[];
export type Transparency = 'blended' | 'wboit' | 'dpoit' | undefined;
export type GraphicsRenderItem = RenderItem<GraphicsRenderVariant>;
export declare function createGraphicsRenderItem(ctx: WebGLContext, drawMode: DrawMode, shaderCode: ShaderCode, schema: RenderableSchema, values: RenderableValues, materialId: number, transparency: Transparency): RenderItem<"color" | "tracing" | "depth" | "emissive" | "pick" | "marking">;
export type ComputeRenderItem = RenderItem<ComputeRenderVariant>;
export declare function createComputeRenderItem(ctx: WebGLContext, drawMode: DrawMode, shaderCode: ShaderCode, schema: RenderableSchema, values: RenderableValues, materialId?: number): RenderItem<"compute">;
/**
 * Creates a render item
 *
 * - assumes that `values.drawCount` and `values.instanceCount` exist
 */
export declare function createRenderItem<T extends string>(ctx: WebGLContext, drawMode: DrawMode, shaderCode: ShaderCode, schema: RenderableSchema, values: RenderableValues, materialId: number, renderVariants: T[], transparency: Transparency): RenderItem<T>;
export {};
