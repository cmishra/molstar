"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcActiveVoxels = calcActiveVoxels;
const renderable_1 = require("../../renderable");
const render_item_1 = require("../../webgl/render-item");
const schema_1 = require("../../renderable/schema");
const shader_code_1 = require("../../../mol-gl/shader-code");
const mol_util_1 = require("../../../mol-util");
const util_1 = require("../util");
const tables_1 = require("./tables");
const quad_vert_1 = require("../../../mol-gl/shader/quad.vert");
const active_voxels_frag_1 = require("../../../mol-gl/shader/marching-cubes/active-voxels.frag");
const debug_1 = require("../../../mol-util/debug");
const compat_1 = require("../../webgl/compat");
const ActiveVoxelsSchema = {
    ...util_1.QuadSchema,
    tTriCount: (0, schema_1.TextureSpec)('image-uint8', 'alpha', 'ubyte', 'nearest'),
    tVolumeData: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    dValueChannel: (0, schema_1.DefineSpec)('string', ['red', 'alpha']),
    uIsoValue: (0, schema_1.UniformSpec)('f'),
    uGridDim: (0, schema_1.UniformSpec)('v3'),
    uGridTexDim: (0, schema_1.UniformSpec)('v3'),
    uScale: (0, schema_1.UniformSpec)('v2'),
};
const ActiveVoxelsName = 'active-voxels';
function valueChannel(ctx, volumeData) {
    return (0, compat_1.isWebGL2)(ctx.gl) && volumeData.format === ctx.gl.RED ? 'red' : 'alpha';
}
function getActiveVoxelsRenderable(ctx, volumeData, gridDim, gridTexDim, isoValue, scale) {
    if (ctx.namedComputeRenderables[ActiveVoxelsName]) {
        const v = ctx.namedComputeRenderables[ActiveVoxelsName].values;
        mol_util_1.ValueCell.update(v.uQuadScale, scale);
        mol_util_1.ValueCell.update(v.tVolumeData, volumeData);
        mol_util_1.ValueCell.update(v.dValueChannel, valueChannel(ctx, volumeData));
        mol_util_1.ValueCell.updateIfChanged(v.uIsoValue, isoValue);
        mol_util_1.ValueCell.update(v.uGridDim, gridDim);
        mol_util_1.ValueCell.update(v.uGridTexDim, gridTexDim);
        mol_util_1.ValueCell.update(v.uScale, scale);
        ctx.namedComputeRenderables[ActiveVoxelsName].update();
    }
    else {
        ctx.namedComputeRenderables[ActiveVoxelsName] = createActiveVoxelsRenderable(ctx, volumeData, gridDim, gridTexDim, isoValue, scale);
    }
    return ctx.namedComputeRenderables[ActiveVoxelsName];
}
function createActiveVoxelsRenderable(ctx, volumeData, gridDim, gridTexDim, isoValue, scale) {
    const values = {
        ...util_1.QuadValues,
        tTriCount: mol_util_1.ValueCell.create((0, tables_1.getTriCount)()),
        uQuadScale: mol_util_1.ValueCell.create(scale),
        tVolumeData: mol_util_1.ValueCell.create(volumeData),
        dValueChannel: mol_util_1.ValueCell.create(valueChannel(ctx, volumeData)),
        uIsoValue: mol_util_1.ValueCell.create(isoValue),
        uGridDim: mol_util_1.ValueCell.create(gridDim),
        uGridTexDim: mol_util_1.ValueCell.create(gridTexDim),
        uScale: mol_util_1.ValueCell.create(scale),
    };
    const schema = { ...ActiveVoxelsSchema };
    const shaderCode = (0, shader_code_1.ShaderCode)('active-voxels', quad_vert_1.quad_vert, active_voxels_frag_1.activeVoxels_frag);
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', shaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
function setRenderingDefaults(ctx) {
    const { gl, state } = ctx;
    state.disable(gl.CULL_FACE);
    state.disable(gl.BLEND);
    state.disable(gl.DEPTH_TEST);
    state.enable(gl.SCISSOR_TEST);
    state.depthMask(false);
    state.colorMask(true, true, true, true);
    state.clearColor(0, 0, 0, 0);
}
function calcActiveVoxels(ctx, volumeData, gridDim, gridTexDim, isoValue, gridScale) {
    if (debug_1.isTimingMode)
        ctx.timer.mark('calcActiveVoxels');
    const { gl, state, resources } = ctx;
    const width = volumeData.getWidth();
    const height = volumeData.getHeight();
    if (!ctx.namedFramebuffers[ActiveVoxelsName]) {
        ctx.namedFramebuffers[ActiveVoxelsName] = resources.framebuffer();
    }
    const framebuffer = ctx.namedFramebuffers[ActiveVoxelsName];
    framebuffer.bind();
    if (!ctx.namedTextures[ActiveVoxelsName]) {
        ctx.namedTextures[ActiveVoxelsName] = resources.texture('image-uint8', 'rgba', 'ubyte', 'nearest');
    }
    const activeVoxelsTex = ctx.namedTextures[ActiveVoxelsName];
    activeVoxelsTex.define(width, height);
    const renderable = getActiveVoxelsRenderable(ctx, volumeData, gridDim, gridTexDim, isoValue, gridScale);
    ctx.state.currentRenderItemId = -1;
    activeVoxelsTex.attachFramebuffer(framebuffer, 0);
    setRenderingDefaults(ctx);
    state.viewport(0, 0, width, height);
    state.scissor(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    state.scissor(0, 0, gridTexDim[0], gridTexDim[1]);
    renderable.render();
    // console.log('gridScale', gridScale, 'gridTexDim', gridTexDim, 'gridDim', gridDim);
    // console.log('volumeData', volumeData);
    // console.log('at', readTexture(ctx, activeVoxelsTex));
    // printTextureImage(readTexture(ctx, activeVoxelsTex), { scale: 0.75 });
    gl.finish();
    if (debug_1.isTimingMode)
        ctx.timer.markEnd('calcActiveVoxels');
    return activeVoxelsTex;
}
