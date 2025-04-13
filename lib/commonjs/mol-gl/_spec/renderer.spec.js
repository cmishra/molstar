"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRenderer = createRenderer;
const gl_shim_1 = require("./gl.shim");
const camera_1 = require("../../mol-canvas3d/camera");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const renderer_1 = require("../renderer");
const context_1 = require("../webgl/context");
const scene_1 = require("../scene");
const points_spec_1 = require("./points.spec");
function createRenderer(gl) {
    const ctx = (0, context_1.createContext)(gl);
    const camera = new camera_1.Camera({
        position: linear_algebra_1.Vec3.create(0, 0, 50)
    });
    const renderer = renderer_1.Renderer.create(ctx);
    return { ctx, camera, renderer };
}
describe('renderer', () => {
    it('basic', () => {
        const [width, height] = [32, 32];
        const gl = (0, gl_shim_1.createGl)(width, height, { preserveDrawingBuffer: true });
        const { ctx, renderer } = createRenderer(gl);
        expect(ctx.gl.drawingBufferWidth).toBe(32);
        expect(ctx.gl.drawingBufferHeight).toBe(32);
        expect(ctx.stats.resourceCounts.attribute).toBe(0);
        expect(ctx.stats.resourceCounts.texture).toBe(1);
        expect(ctx.stats.resourceCounts.vertexArray).toBe(0);
        expect(ctx.stats.resourceCounts.program).toBe(0);
        expect(ctx.stats.resourceCounts.shader).toBe(0);
        renderer.setViewport(0, 0, 64, 48);
        expect(ctx.gl.getParameter(ctx.gl.VIEWPORT)[2]).toBe(64);
        expect(ctx.gl.getParameter(ctx.gl.VIEWPORT)[3]).toBe(48);
    });
    it('points', async () => {
        const [width, height] = [32, 32];
        const gl = (0, gl_shim_1.createGl)(width, height, { preserveDrawingBuffer: true });
        const { ctx } = createRenderer(gl);
        const scene = scene_1.Scene.create(ctx);
        const points = (0, points_spec_1.createPoints)();
        scene.add(points);
        scene.commit();
        expect(ctx.stats.resourceCounts.attribute).toBe(ctx.isWebGL2 ? 4 : 5);
        expect(ctx.stats.resourceCounts.texture).toBe(10);
        expect(ctx.stats.resourceCounts.vertexArray).toBe(ctx.extensions.vertexArrayObject ? 5 : 0);
        expect(ctx.stats.resourceCounts.program).toBe(5);
        expect(ctx.stats.resourceCounts.shader).toBe(10);
        scene.remove(points);
        scene.commit();
        expect(ctx.stats.resourceCounts.attribute).toBe(0);
        expect(ctx.stats.resourceCounts.texture).toBe(1);
        expect(ctx.stats.resourceCounts.vertexArray).toBe(0);
        expect(ctx.stats.resourceCounts.program).toBe(5);
        expect(ctx.stats.resourceCounts.shader).toBe(10);
        ctx.resources.destroy();
        expect(ctx.stats.resourceCounts.program).toBe(0);
        expect(ctx.stats.resourceCounts.shader).toBe(0);
    });
    it('transparency', async () => {
        const [width, height] = [32, 32];
        const gl = (0, gl_shim_1.createGl)(width, height, { preserveDrawingBuffer: true });
        const { ctx } = createRenderer(gl);
        const points = (0, points_spec_1.createPoints)();
        const sceneBlended = scene_1.Scene.create(ctx, 'blended');
        sceneBlended.add(points);
        sceneBlended.commit();
        const sceneWboit = scene_1.Scene.create(ctx, 'wboit');
        sceneWboit.add(points);
        sceneWboit.commit();
        const sceneDpoit = scene_1.Scene.create(ctx, 'dpoit');
        sceneDpoit.add(points);
        sceneDpoit.commit();
        expect(ctx.stats.resourceCounts.attribute).toBe(ctx.isWebGL2 ? 12 : 15);
        expect(ctx.stats.resourceCounts.texture).toBe(28);
        expect(ctx.stats.resourceCounts.vertexArray).toBe(ctx.extensions.vertexArrayObject ? 15 : 0);
        expect(ctx.stats.resourceCounts.program).toBe(7);
        expect(ctx.stats.resourceCounts.shader).toBe(14);
    });
});
