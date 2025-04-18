"use strict";
/**
 * Copyright (c) 2021-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorNormalizeSchema = exports.ColorAccumulateSchema = void 0;
exports.calcTextureMeshColorSmoothing = calcTextureMeshColorSmoothing;
exports.applyTextureMeshColorSmoothing = applyTextureMeshColorSmoothing;
exports.applyTextureMeshOverpaintSmoothing = applyTextureMeshOverpaintSmoothing;
exports.applyTextureMeshTransparencySmoothing = applyTextureMeshTransparencySmoothing;
exports.applyTextureMeshEmissiveSmoothing = applyTextureMeshEmissiveSmoothing;
exports.applyTextureMeshSubstanceSmoothing = applyTextureMeshSubstanceSmoothing;
const mol_util_1 = require("../../../mol-util");
const renderable_1 = require("../../../mol-gl/renderable");
const texture_1 = require("../../../mol-gl/webgl/texture");
const shader_code_1 = require("../../../mol-gl/shader-code");
const render_item_1 = require("../../../mol-gl/webgl/render-item");
const schema_1 = require("../../../mol-gl/renderable/schema");
const quad_vert_1 = require("../../../mol-gl/shader/quad.vert");
const normalize_frag_1 = require("../../../mol-gl/shader/compute/color-smoothing/normalize.frag");
const util_1 = require("../../../mol-gl/compute/util");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const geometry_1 = require("../../../mol-math/geometry");
const accumulate_frag_1 = require("../../../mol-gl/shader/compute/color-smoothing/accumulate.frag");
const accumulate_vert_1 = require("../../../mol-gl/shader/compute/color-smoothing/accumulate.vert");
const compat_1 = require("../../../mol-gl/webgl/compat");
const debug_1 = require("../../../mol-util/debug");
exports.ColorAccumulateSchema = {
    drawCount: (0, schema_1.ValueSpec)('number'),
    instanceCount: (0, schema_1.ValueSpec)('number'),
    stride: (0, schema_1.ValueSpec)('number'),
    uGroupCount: (0, schema_1.UniformSpec)('i', 'material'),
    aTransform: (0, schema_1.AttributeSpec)('float32', 16, 1),
    aInstance: (0, schema_1.AttributeSpec)('float32', 1, 1),
    aSample: (0, schema_1.AttributeSpec)('float32', 1, 0),
    uGeoTexDim: (0, schema_1.UniformSpec)('v2', 'material'),
    tPosition: (0, schema_1.TextureSpec)('texture', 'rgba', 'float', 'nearest', 'material'),
    tGroup: (0, schema_1.TextureSpec)('texture', 'rgba', 'float', 'nearest', 'material'),
    uColorTexDim: (0, schema_1.UniformSpec)('v2', 'material'),
    tColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest', 'material'),
    dColorType: (0, schema_1.DefineSpec)('string', ['group', 'groupInstance', 'vertex', 'vertexInstance']),
    uCurrentSlice: (0, schema_1.UniformSpec)('f'),
    uCurrentX: (0, schema_1.UniformSpec)('f'),
    uCurrentY: (0, schema_1.UniformSpec)('f'),
    uBboxMin: (0, schema_1.UniformSpec)('v3', 'material'),
    uBboxSize: (0, schema_1.UniformSpec)('v3', 'material'),
    uResolution: (0, schema_1.UniformSpec)('f', 'material'),
};
const ColorAccumulateName = 'color-accumulate';
const ColorCountName = 'color-count';
function getSampleBuffer(sampleCount, stride) {
    const sampleBuffer = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; ++i) {
        sampleBuffer[i] = i * stride;
    }
    return sampleBuffer;
}
function getAccumulateRenderable(ctx, input, box, resolution, stride) {
    if (ctx.namedComputeRenderables[ColorAccumulateName]) {
        const extent = linear_algebra_1.Vec3.sub((0, linear_algebra_1.Vec3)(), box.max, box.min);
        const v = ctx.namedComputeRenderables[ColorAccumulateName].values;
        const sampleCount = Math.round(input.vertexCount / stride);
        if (sampleCount > v.drawCount.ref.value || stride !== v.stride.ref.value) {
            mol_util_1.ValueCell.update(v.aSample, getSampleBuffer(sampleCount, stride));
        }
        mol_util_1.ValueCell.updateIfChanged(v.drawCount, sampleCount);
        mol_util_1.ValueCell.updateIfChanged(v.instanceCount, input.instanceCount);
        mol_util_1.ValueCell.updateIfChanged(v.stride, stride);
        mol_util_1.ValueCell.updateIfChanged(v.uGroupCount, input.groupCount);
        mol_util_1.ValueCell.update(v.aTransform, input.transformBuffer);
        mol_util_1.ValueCell.update(v.aInstance, input.instanceBuffer);
        mol_util_1.ValueCell.update(v.uGeoTexDim, linear_algebra_1.Vec2.set(v.uGeoTexDim.ref.value, input.positionTexture.getWidth(), input.positionTexture.getHeight()));
        mol_util_1.ValueCell.update(v.tPosition, input.positionTexture);
        mol_util_1.ValueCell.update(v.tGroup, input.groupTexture);
        mol_util_1.ValueCell.update(v.uColorTexDim, linear_algebra_1.Vec2.set(v.uColorTexDim.ref.value, input.colorData.getWidth(), input.colorData.getHeight()));
        mol_util_1.ValueCell.update(v.tColor, input.colorData);
        mol_util_1.ValueCell.updateIfChanged(v.dColorType, input.colorType);
        mol_util_1.ValueCell.updateIfChanged(v.uCurrentSlice, 0);
        mol_util_1.ValueCell.updateIfChanged(v.uCurrentX, 0);
        mol_util_1.ValueCell.updateIfChanged(v.uCurrentY, 0);
        mol_util_1.ValueCell.update(v.uBboxMin, box.min);
        mol_util_1.ValueCell.update(v.uBboxSize, extent);
        mol_util_1.ValueCell.updateIfChanged(v.uResolution, resolution);
        ctx.namedComputeRenderables[ColorAccumulateName].update();
    }
    else {
        ctx.namedComputeRenderables[ColorAccumulateName] = createAccumulateRenderable(ctx, input, box, resolution, stride);
    }
    return ctx.namedComputeRenderables[ColorAccumulateName];
}
function createAccumulateRenderable(ctx, input, box, resolution, stride) {
    const extent = linear_algebra_1.Vec3.sub((0, linear_algebra_1.Vec3)(), box.max, box.min);
    const sampleCount = Math.round(input.vertexCount / stride);
    const values = {
        drawCount: mol_util_1.ValueCell.create(sampleCount),
        instanceCount: mol_util_1.ValueCell.create(input.instanceCount),
        stride: mol_util_1.ValueCell.create(stride),
        uGroupCount: mol_util_1.ValueCell.create(input.groupCount),
        aTransform: mol_util_1.ValueCell.create(input.transformBuffer),
        aInstance: mol_util_1.ValueCell.create(input.instanceBuffer),
        aSample: mol_util_1.ValueCell.create(getSampleBuffer(sampleCount, stride)),
        uGeoTexDim: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(input.positionTexture.getWidth(), input.positionTexture.getHeight())),
        tPosition: mol_util_1.ValueCell.create(input.positionTexture),
        tGroup: mol_util_1.ValueCell.create(input.groupTexture),
        uColorTexDim: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(input.colorData.getWidth(), input.colorData.getHeight())),
        tColor: mol_util_1.ValueCell.create(input.colorData),
        dColorType: mol_util_1.ValueCell.create(input.colorType),
        uCurrentSlice: mol_util_1.ValueCell.create(0),
        uCurrentX: mol_util_1.ValueCell.create(0),
        uCurrentY: mol_util_1.ValueCell.create(0),
        uBboxMin: mol_util_1.ValueCell.create(box.min),
        uBboxSize: mol_util_1.ValueCell.create(extent),
        uResolution: mol_util_1.ValueCell.create(resolution),
    };
    const schema = { ...exports.ColorAccumulateSchema };
    const shaderCode = (0, shader_code_1.ShaderCode)('accumulate', accumulate_vert_1.accumulate_vert, accumulate_frag_1.accumulate_frag, { drawBuffers: 'required' });
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'points', shaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
function setAccumulateDefaults(ctx) {
    const { gl, state } = ctx;
    state.disable(gl.CULL_FACE);
    state.enable(gl.BLEND);
    state.disable(gl.DEPTH_TEST);
    state.enable(gl.SCISSOR_TEST);
    state.depthMask(false);
    state.clearColor(0, 0, 0, 0);
    state.blendFunc(gl.ONE, gl.ONE);
    state.blendEquation(gl.FUNC_ADD);
}
//
exports.ColorNormalizeSchema = {
    ...util_1.QuadSchema,
    tColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'float', 'nearest'),
    tCount: (0, schema_1.TextureSpec)('texture', 'alpha', 'float', 'nearest'),
    uTexSize: (0, schema_1.UniformSpec)('v2'),
};
const ColorNormalizeName = 'color-normalize';
function getNormalizeRenderable(ctx, color, count) {
    if (ctx.namedComputeRenderables[ColorNormalizeName]) {
        const v = ctx.namedComputeRenderables[ColorNormalizeName].values;
        mol_util_1.ValueCell.update(v.tColor, color);
        mol_util_1.ValueCell.update(v.tCount, count);
        mol_util_1.ValueCell.update(v.uTexSize, linear_algebra_1.Vec2.set(v.uTexSize.ref.value, color.getWidth(), color.getHeight()));
        ctx.namedComputeRenderables[ColorNormalizeName].update();
    }
    else {
        ctx.namedComputeRenderables[ColorNormalizeName] = createColorNormalizeRenderable(ctx, color, count);
    }
    return ctx.namedComputeRenderables[ColorNormalizeName];
}
function createColorNormalizeRenderable(ctx, color, count) {
    const values = {
        ...util_1.QuadValues,
        tColor: mol_util_1.ValueCell.create(color),
        tCount: mol_util_1.ValueCell.create(count),
        uTexSize: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(color.getWidth(), color.getHeight())),
    };
    const schema = { ...exports.ColorNormalizeSchema };
    const shaderCode = (0, shader_code_1.ShaderCode)('normalize', quad_vert_1.quad_vert, normalize_frag_1.normalize_frag);
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', shaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
function setNormalizeDefaults(ctx) {
    const { gl, state } = ctx;
    state.disable(gl.CULL_FACE);
    state.enable(gl.BLEND);
    state.disable(gl.DEPTH_TEST);
    state.enable(gl.SCISSOR_TEST);
    state.depthMask(false);
    state.clearColor(0, 0, 0, 0);
    state.blendFunc(gl.ONE, gl.ONE);
    state.blendEquation(gl.FUNC_ADD);
}
//
function getTexture2dSize(gridDim) {
    const area = gridDim[0] * gridDim[1] * gridDim[2];
    const squareDim = Math.sqrt(area);
    const powerOfTwoSize = Math.pow(2, Math.ceil(Math.log(squareDim) / Math.log(2)));
    let texDimX = 0;
    let texDimY = gridDim[1];
    let texRows = 1;
    let texCols = gridDim[2];
    if (powerOfTwoSize < gridDim[0] * gridDim[2]) {
        texCols = Math.floor(powerOfTwoSize / gridDim[0]);
        texRows = Math.ceil(gridDim[2] / texCols);
        texDimX = texCols * gridDim[0];
        texDimY *= texRows;
    }
    else {
        texDimX = gridDim[0] * gridDim[2];
    }
    // console.log(texDimX, texDimY, texDimY < powerOfTwoSize ? powerOfTwoSize : powerOfTwoSize * 2);
    return { texDimX, texDimY, texRows, texCols, powerOfTwoSize: texDimY < powerOfTwoSize ? powerOfTwoSize : powerOfTwoSize * 2 };
}
function calcTextureMeshColorSmoothing(input, resolution, stride, webgl, texture) {
    const { drawBuffers } = webgl.extensions;
    if (!drawBuffers)
        throw new Error('need WebGL draw buffers');
    if (debug_1.isTimingMode)
        webgl.timer.mark('calcTextureMeshColorSmoothing');
    const { gl, resources, state, extensions: { colorBufferHalfFloat, textureHalfFloat } } = webgl;
    const isInstanceType = input.colorType.endsWith('Instance');
    const box = geometry_1.Box3D.fromSphere3D((0, geometry_1.Box3D)(), isInstanceType ? input.boundingSphere : input.invariantBoundingSphere);
    const pad = 1 + resolution;
    const expandedBox = geometry_1.Box3D.expand((0, geometry_1.Box3D)(), box, linear_algebra_1.Vec3.create(pad, pad, pad));
    const scaleFactor = 1 / resolution;
    const scaledBox = geometry_1.Box3D.scale((0, geometry_1.Box3D)(), expandedBox, scaleFactor);
    const gridDim = geometry_1.Box3D.size((0, linear_algebra_1.Vec3)(), scaledBox);
    linear_algebra_1.Vec3.ceil(gridDim, gridDim);
    linear_algebra_1.Vec3.add(gridDim, gridDim, linear_algebra_1.Vec3.create(2, 2, 2));
    const { min } = expandedBox;
    const [dx, dy, dz] = gridDim;
    const { texDimX: width, texDimY: height, texCols } = getTexture2dSize(gridDim);
    // console.log({ width, height, texCols, gridDim, resolution });
    if (!webgl.namedFramebuffers[ColorAccumulateName]) {
        webgl.namedFramebuffers[ColorAccumulateName] = webgl.resources.framebuffer();
    }
    const framebuffer = webgl.namedFramebuffers[ColorAccumulateName];
    if ((0, compat_1.isWebGL2)(gl)) {
        if (!webgl.namedTextures[ColorAccumulateName]) {
            webgl.namedTextures[ColorAccumulateName] = colorBufferHalfFloat && textureHalfFloat
                ? resources.texture('image-float16', 'rgba', 'fp16', 'nearest')
                : resources.texture('image-float32', 'rgba', 'float', 'nearest');
        }
        if (!webgl.namedTextures[ColorCountName]) {
            webgl.namedTextures[ColorCountName] = resources.texture('image-float32', 'alpha', 'float', 'nearest');
        }
    }
    else {
        // webgl1 requires consistent bit plane counts
        // this is quite wasteful but good enough for medium size meshes
        if (!webgl.namedTextures[ColorAccumulateName]) {
            webgl.namedTextures[ColorAccumulateName] = resources.texture('image-float32', 'rgba', 'float', 'nearest');
        }
        if (!webgl.namedTextures[ColorCountName]) {
            webgl.namedTextures[ColorCountName] = resources.texture('image-float32', 'rgba', 'float', 'nearest');
        }
    }
    const accumulateTexture = webgl.namedTextures[ColorAccumulateName];
    const countTexture = webgl.namedTextures[ColorCountName];
    accumulateTexture.define(width, height);
    countTexture.define(width, height);
    accumulateTexture.attachFramebuffer(framebuffer, 0);
    countTexture.attachFramebuffer(framebuffer, 1);
    const accumulateRenderable = getAccumulateRenderable(webgl, input, expandedBox, resolution, stride);
    state.currentRenderItemId = -1;
    framebuffer.bind();
    drawBuffers.drawBuffers([
        drawBuffers.COLOR_ATTACHMENT0,
        drawBuffers.COLOR_ATTACHMENT1,
    ]);
    const { uCurrentSlice, uCurrentX, uCurrentY } = accumulateRenderable.values;
    if (debug_1.isTimingMode)
        webgl.timer.mark('ColorAccumulate.render');
    setAccumulateDefaults(webgl);
    state.viewport(0, 0, width, height);
    state.scissor(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    mol_util_1.ValueCell.update(uCurrentY, 0);
    let currCol = 0;
    let currY = 0;
    let currX = 0;
    for (let i = 0; i < dz; ++i) {
        if (currCol >= texCols) {
            currCol -= texCols;
            currY += dy;
            currX = 0;
            mol_util_1.ValueCell.update(uCurrentY, currY);
        }
        // console.log({ i, currX, currY });
        mol_util_1.ValueCell.update(uCurrentX, currX);
        mol_util_1.ValueCell.update(uCurrentSlice, i);
        state.viewport(currX, currY, dx, dy);
        state.scissor(currX, currY, dx, dy);
        accumulateRenderable.render();
        ++currCol;
        currX += dx;
    }
    accumulateTexture.detachFramebuffer(framebuffer, 0);
    countTexture.detachFramebuffer(framebuffer, 1);
    drawBuffers.drawBuffers([gl.COLOR_ATTACHMENT0, gl.NONE]);
    if (debug_1.isTimingMode)
        webgl.timer.markEnd('ColorAccumulate.render');
    // const accImage = new Float32Array(width * height * 4);
    // accumulateTexture.attachFramebuffer(framebuffer, 0);
    // webgl.readPixels(0, 0, width, height, accImage);
    // console.log(accImage);
    // printTextureImage({ array: accImage, width, height }, { scale: 1 });
    // const cntImage = new Float32Array(width * height * 4);
    // countTexture.attachFramebuffer(framebuffer, 0);
    // webgl.readPixels(0, 0, width, height, cntImage);
    // console.log(cntImage);
    // printTextureImage({ array: cntImage, width, height }, { scale: 1 });
    // normalize
    if (debug_1.isTimingMode)
        webgl.timer.mark('ColorNormalize.render');
    if (!texture || (0, texture_1.isNullTexture)(texture)) {
        texture = resources.texture('image-uint8', 'rgba', 'ubyte', 'linear');
    }
    texture.define(width, height);
    const normalizeRenderable = getNormalizeRenderable(webgl, accumulateTexture, countTexture);
    state.currentRenderItemId = -1;
    setNormalizeDefaults(webgl);
    texture.attachFramebuffer(framebuffer, 0);
    state.viewport(0, 0, width, height);
    state.scissor(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    normalizeRenderable.render();
    if (debug_1.isTimingMode)
        webgl.timer.markEnd('ColorNormalize.render');
    // const normImage = new Uint8Array(width * height * 4);
    // texture.attachFramebuffer(framebuffer, 0);
    // webgl.readPixels(0, 0, width, height, normImage);
    // console.log(normImage);
    // printTextureImage({ array: normImage, width, height }, { scale: 1 });
    const gridTransform = linear_algebra_1.Vec4.create(min[0], min[1], min[2], scaleFactor);
    const type = isInstanceType ? 'volumeInstance' : 'volume';
    if (debug_1.isTimingMode)
        webgl.timer.markEnd('calcTextureMeshColorSmoothing');
    // printTextureImage(readTexture(webgl, texture), { scale: 0.75 });
    return { texture, gridDim, gridTexDim: linear_algebra_1.Vec2.create(width, height), gridTransform, type };
}
//
const ColorSmoothingRgbName = 'color-smoothing-rgb';
const ColorSmoothingRgbaName = 'color-smoothing-rgba';
const ColorSmoothingAlphaName = 'color-smoothing-alpha';
function isSupportedColorType(x) {
    return x === 'group' || x === 'groupInstance';
}
function applyTextureMeshColorSmoothing(values, resolution, stride, webgl, colorTexture) {
    if (!isSupportedColorType(values.dColorType.ref.value))
        return;
    stride *= 3; // triple because TextureMesh is never indexed (no elements buffer)
    if (!webgl.namedTextures[ColorSmoothingRgbName]) {
        webgl.namedTextures[ColorSmoothingRgbName] = webgl.resources.texture('image-uint8', 'rgb', 'ubyte', 'nearest');
    }
    const colorData = webgl.namedTextures[ColorSmoothingRgbName];
    colorData.load(values.tColor.ref.value);
    const smoothingData = calcTextureMeshColorSmoothing({
        vertexCount: values.uVertexCount.ref.value,
        instanceCount: values.uInstanceCount.ref.value,
        groupCount: values.uGroupCount.ref.value,
        transformBuffer: values.aTransform.ref.value,
        instanceBuffer: values.aInstance.ref.value,
        positionTexture: values.tPosition.ref.value,
        groupTexture: values.tGroup.ref.value,
        colorData,
        colorType: values.dColorType.ref.value,
        boundingSphere: values.boundingSphere.ref.value,
        invariantBoundingSphere: values.invariantBoundingSphere.ref.value,
    }, resolution, stride, webgl, colorTexture);
    mol_util_1.ValueCell.updateIfChanged(values.dColorType, smoothingData.type);
    mol_util_1.ValueCell.update(values.tColorGrid, smoothingData.texture);
    mol_util_1.ValueCell.update(values.uColorTexDim, smoothingData.gridTexDim);
    mol_util_1.ValueCell.update(values.uColorGridDim, smoothingData.gridDim);
    mol_util_1.ValueCell.update(values.uColorGridTransform, smoothingData.gridTransform);
}
function isSupportedOverpaintType(x) {
    return x === 'groupInstance';
}
function applyTextureMeshOverpaintSmoothing(values, resolution, stride, webgl, colorTexture) {
    if (!isSupportedOverpaintType(values.dOverpaintType.ref.value))
        return;
    stride *= 3; // triple because TextureMesh is never indexed (no elements buffer)
    if (!webgl.namedTextures[ColorSmoothingRgbaName]) {
        webgl.namedTextures[ColorSmoothingRgbaName] = webgl.resources.texture('image-uint8', 'rgba', 'ubyte', 'nearest');
    }
    const colorData = webgl.namedTextures[ColorSmoothingRgbaName];
    colorData.load(values.tOverpaint.ref.value);
    const smoothingData = calcTextureMeshColorSmoothing({
        vertexCount: values.uVertexCount.ref.value,
        instanceCount: values.uInstanceCount.ref.value,
        groupCount: values.uGroupCount.ref.value,
        transformBuffer: values.aTransform.ref.value,
        instanceBuffer: values.aInstance.ref.value,
        positionTexture: values.tPosition.ref.value,
        groupTexture: values.tGroup.ref.value,
        colorData,
        colorType: values.dOverpaintType.ref.value,
        boundingSphere: values.boundingSphere.ref.value,
        invariantBoundingSphere: values.invariantBoundingSphere.ref.value,
    }, resolution, stride, webgl, colorTexture);
    mol_util_1.ValueCell.updateIfChanged(values.dOverpaintType, smoothingData.type);
    mol_util_1.ValueCell.update(values.tOverpaintGrid, smoothingData.texture);
    mol_util_1.ValueCell.update(values.uOverpaintTexDim, smoothingData.gridTexDim);
    mol_util_1.ValueCell.update(values.uOverpaintGridDim, smoothingData.gridDim);
    mol_util_1.ValueCell.update(values.uOverpaintGridTransform, smoothingData.gridTransform);
}
function isSupportedTransparencyType(x) {
    return x === 'groupInstance';
}
function applyTextureMeshTransparencySmoothing(values, resolution, stride, webgl, colorTexture) {
    if (!isSupportedTransparencyType(values.dTransparencyType.ref.value))
        return;
    stride *= 3; // triple because TextureMesh is never indexed (no elements buffer)
    if (!webgl.namedTextures[ColorSmoothingAlphaName]) {
        webgl.namedTextures[ColorSmoothingAlphaName] = webgl.resources.texture('image-uint8', 'alpha', 'ubyte', 'nearest');
    }
    const colorData = webgl.namedTextures[ColorSmoothingAlphaName];
    colorData.load(values.tTransparency.ref.value);
    const smoothingData = calcTextureMeshColorSmoothing({
        vertexCount: values.uVertexCount.ref.value,
        instanceCount: values.uInstanceCount.ref.value,
        groupCount: values.uGroupCount.ref.value,
        transformBuffer: values.aTransform.ref.value,
        instanceBuffer: values.aInstance.ref.value,
        positionTexture: values.tPosition.ref.value,
        groupTexture: values.tGroup.ref.value,
        colorData,
        colorType: values.dTransparencyType.ref.value,
        boundingSphere: values.boundingSphere.ref.value,
        invariantBoundingSphere: values.invariantBoundingSphere.ref.value,
    }, resolution, stride, webgl, colorTexture);
    mol_util_1.ValueCell.updateIfChanged(values.dTransparencyType, smoothingData.type);
    mol_util_1.ValueCell.update(values.tTransparencyGrid, smoothingData.texture);
    mol_util_1.ValueCell.update(values.uTransparencyTexDim, smoothingData.gridTexDim);
    mol_util_1.ValueCell.update(values.uTransparencyGridDim, smoothingData.gridDim);
    mol_util_1.ValueCell.update(values.uTransparencyGridTransform, smoothingData.gridTransform);
}
function isSupportedEmissiveType(x) {
    return x === 'groupInstance';
}
function applyTextureMeshEmissiveSmoothing(values, resolution, stride, webgl, colorTexture) {
    if (!isSupportedEmissiveType(values.dEmissiveType.ref.value))
        return;
    stride *= 3; // triple because TextureMesh is never indexed (no elements buffer)
    if (!webgl.namedTextures[ColorSmoothingAlphaName]) {
        webgl.namedTextures[ColorSmoothingAlphaName] = webgl.resources.texture('image-uint8', 'alpha', 'ubyte', 'nearest');
    }
    const colorData = webgl.namedTextures[ColorSmoothingAlphaName];
    colorData.load(values.tEmissive.ref.value);
    const smoothingData = calcTextureMeshColorSmoothing({
        vertexCount: values.uVertexCount.ref.value,
        instanceCount: values.uInstanceCount.ref.value,
        groupCount: values.uGroupCount.ref.value,
        transformBuffer: values.aTransform.ref.value,
        instanceBuffer: values.aInstance.ref.value,
        positionTexture: values.tPosition.ref.value,
        groupTexture: values.tGroup.ref.value,
        colorData,
        colorType: values.dEmissiveType.ref.value,
        boundingSphere: values.boundingSphere.ref.value,
        invariantBoundingSphere: values.invariantBoundingSphere.ref.value,
    }, resolution, stride, webgl, colorTexture);
    mol_util_1.ValueCell.updateIfChanged(values.dEmissiveType, smoothingData.type);
    mol_util_1.ValueCell.update(values.tEmissiveGrid, smoothingData.texture);
    mol_util_1.ValueCell.update(values.uEmissiveTexDim, smoothingData.gridTexDim);
    mol_util_1.ValueCell.update(values.uEmissiveGridDim, smoothingData.gridDim);
    mol_util_1.ValueCell.update(values.uEmissiveGridTransform, smoothingData.gridTransform);
}
function isSupportedSubstanceType(x) {
    return x === 'groupInstance';
}
function applyTextureMeshSubstanceSmoothing(values, resolution, stride, webgl, colorTexture) {
    if (!isSupportedSubstanceType(values.dSubstanceType.ref.value))
        return;
    stride *= 3; // triple because TextureMesh is never indexed (no elements buffer)
    if (!webgl.namedTextures[ColorSmoothingRgbaName]) {
        webgl.namedTextures[ColorSmoothingRgbaName] = webgl.resources.texture('image-uint8', 'rgba', 'ubyte', 'nearest');
    }
    const colorData = webgl.namedTextures[ColorSmoothingRgbaName];
    colorData.load(values.tSubstance.ref.value);
    const smoothingData = calcTextureMeshColorSmoothing({
        vertexCount: values.uVertexCount.ref.value,
        instanceCount: values.uInstanceCount.ref.value,
        groupCount: values.uGroupCount.ref.value,
        transformBuffer: values.aTransform.ref.value,
        instanceBuffer: values.aInstance.ref.value,
        positionTexture: values.tPosition.ref.value,
        groupTexture: values.tGroup.ref.value,
        colorData,
        colorType: values.dSubstanceType.ref.value,
        boundingSphere: values.boundingSphere.ref.value,
        invariantBoundingSphere: values.invariantBoundingSphere.ref.value,
    }, resolution, stride, webgl, colorTexture);
    mol_util_1.ValueCell.updateIfChanged(values.dSubstanceType, smoothingData.type);
    mol_util_1.ValueCell.update(values.tSubstanceGrid, smoothingData.texture);
    mol_util_1.ValueCell.update(values.uSubstanceTexDim, smoothingData.gridTexDim);
    mol_util_1.ValueCell.update(values.uSubstanceGridDim, smoothingData.gridDim);
    mol_util_1.ValueCell.update(values.uSubstanceGridTransform, smoothingData.gridTransform);
}
