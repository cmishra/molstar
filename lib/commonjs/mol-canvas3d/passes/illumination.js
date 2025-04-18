"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IlluminationPass = exports.IlluminationParams = void 0;
const util_1 = require("../../mol-gl/compute/util");
const schema_1 = require("../../mol-gl/renderable/schema");
const mol_util_1 = require("../../mol-util");
const debug_1 = require("../../mol-util/debug");
const camera_1 = require("../camera");
const shader_code_1 = require("../../mol-gl/shader-code");
const quad_vert_1 = require("../../mol-gl/shader/quad.vert");
const renderable_1 = require("../../mol-gl/renderable");
const compose_frag_1 = require("../../mol-gl/shader/illumination/compose.frag");
const vec2_1 = require("../../mol-math/linear-algebra/3d/vec2");
const render_item_1 = require("../../mol-gl/webgl/render-item");
const vec3_1 = require("../../mol-math/linear-algebra/3d/vec3");
const param_definition_1 = require("../../mol-util/param-definition");
const color_1 = require("../../mol-util/color/color");
const postprocessing_1 = require("./postprocessing");
const marking_1 = require("./marking");
const dof_1 = require("./dof");
const tracing_1 = require("./tracing");
const multi_sample_1 = require("./multi-sample");
const compose_frag_2 = require("../../mol-gl/shader/compose.frag");
const interpolate_1 = require("../../mol-math/interpolate");
exports.IlluminationParams = {
    enabled: param_definition_1.ParamDefinition.Boolean(false),
    maxIterations: param_definition_1.ParamDefinition.Numeric(5, { min: 0, max: 16, step: 1 }, { description: 'Maximum number of tracing iterations. Final iteration count is 2^x.' }),
    denoise: param_definition_1.ParamDefinition.Boolean(true),
    denoiseThreshold: param_definition_1.ParamDefinition.Interval([0.15, 1], { min: 0, max: 4, step: 0.01 }, { description: 'Threshold for denoising. Automatically adjusted within given interval based on current iteration.' }),
    ignoreOutline: param_definition_1.ParamDefinition.Boolean(true, { description: 'Ignore outline in illumination pass where it is generally not needed for visual clarity. Useful when illumination is often toggled on/off.' }),
    ...tracing_1.TracingParams,
};
class IlluminationPass {
    get iteration() { return this._iteration; }
    get colorTarget() { return this._colorTarget; }
    get supported() {
        return this._supported;
    }
    getMaxIterations(props) {
        return Math.pow(2, props.illumination.maxIterations);
    }
    static isSupported(webgl) {
        const { drawBuffers, textureFloat, colorBufferFloat, depthTexture } = webgl.extensions;
        if (!textureFloat || !colorBufferFloat || !depthTexture || !drawBuffers) {
            if (debug_1.isDebugMode) {
                const missing = [];
                if (!textureFloat)
                    missing.push('textureFloat');
                if (!colorBufferFloat)
                    missing.push('colorBufferFloat');
                if (!depthTexture)
                    missing.push('depthTexture');
                if (!drawBuffers)
                    missing.push('drawBuffers');
                console.log(`Missing "${missing.join('", "')}" extensions required for "illumination"`);
            }
            return false;
        }
        else {
            return true;
        }
    }
    constructor(webgl, drawPass) {
        this.webgl = webgl;
        this.drawPass = drawPass;
        this._iteration = 0;
        this._supported = false;
        this.prevSampleIndex = -1;
        if (!IlluminationPass.isSupported(webgl))
            return;
        const { colorTarget } = drawPass;
        const width = colorTarget.getWidth();
        const height = colorTarget.getHeight();
        this.tracing = new tracing_1.TracingPass(webgl, this.drawPass);
        this.transparentTarget = webgl.createRenderTarget(width, height, false, 'uint8', 'nearest');
        this.outputTarget = webgl.createRenderTarget(width, height, false, 'uint8', 'linear');
        this.copyRenderable = (0, util_1.createCopyRenderable)(webgl, this.transparentTarget.texture);
        this.composeRenderable = getComposeRenderable(webgl, this.tracing.accumulateTarget.texture, this.tracing.normalTextureOpaque, this.tracing.colorTextureOpaque, this.drawPass.depthTextureOpaque, this.drawPass.depthTargetTransparent.texture, this.drawPass.postprocessing.outline.target.texture, this.transparentTarget.texture, this.drawPass.postprocessing.ssao.ssaoDepthTexture, this.drawPass.postprocessing.ssao.ssaoDepthTransparentTexture, false);
        this.multiSampleComposeTarget = webgl.createRenderTarget(width, height, false, 'float32');
        this.multiSampleHoldTarget = webgl.createRenderTarget(width, height, false);
        this.multiSampleAccumulateTarget = webgl.createRenderTarget(width, height, false, 'float32');
        this.multiSampleCompose = getMultiSampleComposeRenderable(webgl, this.outputTarget.texture);
        this._supported = true;
    }
    renderInput(renderer, camera, scene, props) {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('IlluminationPass.renderInput');
        const { gl, state } = this.webgl;
        const markingEnabled = marking_1.MarkingPass.isEnabled(props.marking);
        const hasTransparent = scene.opacityAverage < 1;
        const hasMarking = markingEnabled && scene.markerAverage > 0;
        this.transparentTarget.bind();
        state.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const outlineEnabled = postprocessing_1.PostprocessingPass.isTransparentOutlineEnabled(props.postprocessing) && !props.illumination.ignoreOutline;
        const dofEnabled = dof_1.DofPass.isEnabled(props.postprocessing);
        const ssaoEnabled = postprocessing_1.PostprocessingPass.isTransparentSsaoEnabled(scene, props.postprocessing);
        if (outlineEnabled || dofEnabled || ssaoEnabled) {
            this.drawPass.depthTargetTransparent.bind();
            renderer.clearDepth(true);
        }
        if (hasTransparent) {
            if (this.drawPass.transparency === 'wboit') {
                this.drawPass.wboit.bind();
                renderer.renderWboitTransparent(scene.primitives, camera, this.drawPass.depthTextureOpaque);
                if (scene.volumes.renderables.length > 0) {
                    renderer.renderWboitTransparent(scene.volumes, camera, this.drawPass.depthTextureOpaque);
                }
                this.transparentTarget.bind();
                this.drawPass.wboit.render();
            }
            else if (this.drawPass.transparency === 'dpoit') {
                const dpoitTextures = this.drawPass.dpoit.bind();
                renderer.renderDpoitTransparent(scene.primitives, camera, this.drawPass.depthTextureOpaque, dpoitTextures);
                for (let i = 0, il = props.dpoitIterations; i < il; i++) {
                    if (debug_1.isTimingMode)
                        this.webgl.timer.mark('DpoitPass.layer');
                    const dpoitTextures = this.drawPass.dpoit.bindDualDepthPeeling();
                    renderer.renderDpoitTransparent(scene.primitives, camera, this.drawPass.depthTextureOpaque, dpoitTextures);
                    this.transparentTarget.bind();
                    this.drawPass.dpoit.renderBlendBack();
                    if (debug_1.isTimingMode)
                        this.webgl.timer.markEnd('DpoitPass.layer');
                }
                // evaluate dpoit
                this.transparentTarget.bind();
                this.drawPass.dpoit.render();
                if (scene.volumes.renderables.length > 0) {
                    renderer.renderVolume(scene.volumes, camera, this.drawPass.depthTextureOpaque);
                }
            }
            else {
                this.transparentTarget.bind();
                this.drawPass.depthTextureOpaque.attachFramebuffer(this.transparentTarget.framebuffer, 'depth');
                renderer.renderBlendedTransparent(scene.primitives, camera);
                this.drawPass.depthTextureOpaque.detachFramebuffer(this.transparentTarget.framebuffer, 'depth');
                if (scene.volumes.renderables.length > 0) {
                    renderer.renderVolume(scene.volumes, camera, this.drawPass.depthTextureOpaque);
                }
            }
            if (outlineEnabled || dofEnabled || ssaoEnabled) {
                this.drawPass.depthTargetTransparent.bind();
                if (scene.opacityAverage < 1) {
                    renderer.renderDepthTransparent(scene.primitives, camera, this.drawPass.depthTextureOpaque);
                }
            }
            if (ssaoEnabled) {
                this.drawPass.postprocessing.ssao.update(camera, scene, props.postprocessing.occlusion.params, true);
                this.drawPass.postprocessing.ssao.render(camera);
            }
        }
        //
        if (hasMarking) {
            const markingDepthTest = props.marking.ghostEdgeStrength < 1;
            if (markingDepthTest && scene.markerAverage !== 1) {
                this.drawPass.marking.depthTarget.bind();
                renderer.clear(false, true);
                renderer.renderMarkingDepth(scene.primitives, camera);
            }
            this.drawPass.marking.maskTarget.bind();
            renderer.clear(false, true);
            renderer.renderMarkingMask(scene.primitives, camera, markingDepthTest ? this.drawPass.marking.depthTarget.texture : null);
            this.drawPass.marking.update(props.marking);
            this.drawPass.marking.render(camera.viewport, this.transparentTarget);
        }
        //
        this.tracing.composeTarget.bind();
        state.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('IlluminationPass.renderInput');
    }
    shouldRender(props) {
        return this._supported && props.illumination.enabled && this._iteration < this.getMaxIterations(props);
    }
    setSize(width, height) {
        if (!this._supported)
            return;
        const w = this.outputTarget.getWidth();
        const h = this.outputTarget.getHeight();
        if (width !== w || height !== h) {
            this.tracing.setSize(width, height);
            this.transparentTarget.setSize(width, height);
            this.outputTarget.setSize(width, height);
            mol_util_1.ValueCell.update(this.copyRenderable.values.uTexSize, vec2_1.Vec2.set(this.copyRenderable.values.uTexSize.ref.value, width, height));
            mol_util_1.ValueCell.update(this.composeRenderable.values.uTexSize, vec2_1.Vec2.set(this.composeRenderable.values.uTexSize.ref.value, width, height));
            this.multiSampleComposeTarget.setSize(width, height);
            this.multiSampleHoldTarget.setSize(width, height);
            this.multiSampleAccumulateTarget.setSize(width, height);
            mol_util_1.ValueCell.update(this.multiSampleCompose.values.uTexSize, vec2_1.Vec2.set(this.multiSampleCompose.values.uTexSize.ref.value, width, height));
        }
        this.drawPass.setSize(width, height);
    }
    reset(clearAdjustedProps = false) {
        if (!this._supported)
            return;
        this.tracing.reset(clearAdjustedProps);
        this._iteration = 0;
        this.prevSampleIndex = -1;
    }
    renderInternal(ctx, props, toDrawingBuffer, forceRenderInput) {
        if (!this.shouldRender(props))
            return;
        if (debug_1.isTimingMode) {
            this.webgl.timer.mark('IlluminationPass.render', {
                note: `iteration ${this._iteration + 1} of ${this.getMaxIterations(props)}`
            });
        }
        this.tracing.render(ctx, props.transparentBackground, props.illumination, this._iteration, forceRenderInput);
        const { renderer, camera, scene, helper } = ctx;
        const { gl, state } = this.webgl;
        const { x, y, width, height } = camera.viewport;
        if (this._iteration === 0 || forceRenderInput) {
            // render color & depth
            renderer.setTransparentBackground(props.transparentBackground);
            renderer.setDrawingBufferSize(this.tracing.composeTarget.getWidth(), this.tracing.composeTarget.getHeight());
            renderer.setPixelRatio(this.webgl.pixelRatio);
            renderer.setViewport(x, y, width, height);
            renderer.update(camera, scene);
            this.renderInput(renderer, camera, scene, props);
        }
        state.disable(gl.BLEND);
        state.disable(gl.DEPTH_TEST);
        state.disable(gl.CULL_FACE);
        state.depthMask(false);
        state.viewport(x, y, width, height);
        state.scissor(x, y, width, height);
        const orthographic = camera.state.mode === 'orthographic' ? 1 : 0;
        const outlinesEnabled = props.postprocessing.outline.name === 'on' && !props.illumination.ignoreOutline;
        const occlusionEnabled = postprocessing_1.PostprocessingPass.isTransparentSsaoEnabled(scene, props.postprocessing);
        const markingEnabled = marking_1.MarkingPass.isEnabled(props.marking);
        const hasTransparent = scene.opacityAverage < 1;
        const hasMarking = markingEnabled && scene.markerAverage > 0;
        let needsUpdateCompose = false;
        if (this.composeRenderable.values.dOutlineEnable.ref.value !== outlinesEnabled) {
            needsUpdateCompose = true;
            mol_util_1.ValueCell.update(this.composeRenderable.values.dOutlineEnable, outlinesEnabled);
        }
        if (props.postprocessing.outline.name === 'on') {
            const { transparentOutline, outlineScale } = this.drawPass.postprocessing.outline.update(camera, props.postprocessing.outline.params, this.drawPass.depthTargetTransparent.texture, this.drawPass.depthTextureOpaque);
            this.drawPass.postprocessing.outline.render();
            mol_util_1.ValueCell.update(this.composeRenderable.values.uOutlineColor, color_1.Color.toVec3Normalized(this.composeRenderable.values.uOutlineColor.ref.value, props.postprocessing.outline.params.color));
            if (this.composeRenderable.values.dOutlineScale.ref.value !== outlineScale) {
                needsUpdateCompose = true;
                mol_util_1.ValueCell.update(this.composeRenderable.values.dOutlineScale, outlineScale);
            }
            if (this.composeRenderable.values.dTransparentOutline.ref.value !== transparentOutline) {
                needsUpdateCompose = true;
                mol_util_1.ValueCell.update(this.composeRenderable.values.dTransparentOutline, transparentOutline);
            }
        }
        if (this.composeRenderable.values.dOcclusionEnable.ref.value !== occlusionEnabled) {
            needsUpdateCompose = true;
            mol_util_1.ValueCell.update(this.composeRenderable.values.dOcclusionEnable, occlusionEnabled);
        }
        if (props.postprocessing.occlusion.name === 'on') {
            mol_util_1.ValueCell.update(this.composeRenderable.values.uOcclusionColor, color_1.Color.toVec3Normalized(this.composeRenderable.values.uOcclusionColor.ref.value, props.postprocessing.occlusion.params.color));
        }
        const blendTransparency = hasTransparent || hasMarking;
        if (this.composeRenderable.values.dBlendTransparency.ref.value !== blendTransparency) {
            needsUpdateCompose = true;
            mol_util_1.ValueCell.update(this.composeRenderable.values.dBlendTransparency, blendTransparency);
        }
        mol_util_1.ValueCell.updateIfChanged(this.composeRenderable.values.uNear, camera.near);
        mol_util_1.ValueCell.updateIfChanged(this.composeRenderable.values.uFar, camera.far);
        mol_util_1.ValueCell.updateIfChanged(this.composeRenderable.values.uFogFar, camera.fogFar);
        mol_util_1.ValueCell.updateIfChanged(this.composeRenderable.values.uFogNear, camera.fogNear);
        mol_util_1.ValueCell.update(this.composeRenderable.values.uFogColor, color_1.Color.toVec3Normalized(this.composeRenderable.values.uFogColor.ref.value, renderer.props.backgroundColor));
        if (this.composeRenderable.values.dOrthographic.ref.value !== orthographic) {
            mol_util_1.ValueCell.update(this.composeRenderable.values.dOrthographic, orthographic);
            needsUpdateCompose = true;
        }
        // background
        const _toDrawingBuffer = toDrawingBuffer && !postprocessing_1.AntialiasingPass.isEnabled(props.postprocessing) && props.postprocessing.dof.name === 'off';
        if (_toDrawingBuffer) {
            this.webgl.unbindFramebuffer();
        }
        else {
            this.tracing.composeTarget.bind();
        }
        this._colorTarget = this.tracing.composeTarget;
        this.drawPass.postprocessing.background.update(camera, props.postprocessing.background);
        this.drawPass.postprocessing.background.clear(props.postprocessing.background, props.transparentBackground, renderer.props.backgroundColor);
        this.drawPass.postprocessing.background.render(props.postprocessing.background);
        // compose
        mol_util_1.ValueCell.updateIfChanged(this.composeRenderable.values.uTransparentBackground, props.transparentBackground || this.drawPass.postprocessing.background.isEnabled(props.postprocessing.background));
        if (this.composeRenderable.values.dDenoise.ref.value !== props.illumination.denoise) {
            mol_util_1.ValueCell.update(this.composeRenderable.values.dDenoise, props.illumination.denoise);
            needsUpdateCompose = true;
        }
        const denoiseThreshold = props.multiSample.mode === 'on'
            ? props.illumination.denoiseThreshold[0]
            : (0, interpolate_1.lerp)(props.illumination.denoiseThreshold[1], props.illumination.denoiseThreshold[0], (0, interpolate_1.clamp)(this.iteration / (this.getMaxIterations(props) / 2), 0, 1));
        mol_util_1.ValueCell.updateIfChanged(this.composeRenderable.values.uDenoiseThreshold, denoiseThreshold);
        if (needsUpdateCompose)
            this.composeRenderable.update();
        this.composeRenderable.render();
        //
        renderer.setDrawingBufferSize(this.tracing.composeTarget.getWidth(), this.tracing.composeTarget.getHeight());
        renderer.setPixelRatio(this.webgl.pixelRatio);
        renderer.setViewport(x, y, width, height);
        renderer.update(camera, scene);
        if (helper.debug.isEnabled) {
            helper.debug.syncVisibility();
            renderer.renderBlended(helper.debug.scene, camera);
        }
        if (helper.handle.isEnabled) {
            renderer.renderBlended(helper.handle.scene, camera);
        }
        if (helper.camera.isEnabled) {
            helper.camera.update(camera);
            renderer.update(helper.camera.camera, helper.camera.scene);
            renderer.renderBlended(helper.camera.scene, helper.camera.camera);
        }
        //
        let targetIsDrawingbuffer = false;
        let swapTarget = this.outputTarget;
        if (postprocessing_1.AntialiasingPass.isEnabled(props.postprocessing)) {
            const _toDrawingBuffer = toDrawingBuffer && props.postprocessing.dof.name === 'off';
            this.drawPass.antialiasing.render(camera, this.tracing.composeTarget.texture, _toDrawingBuffer ? true : this.outputTarget, props.postprocessing);
            if (_toDrawingBuffer) {
                targetIsDrawingbuffer = true;
            }
            else {
                this._colorTarget = this.outputTarget;
                swapTarget = this.tracing.composeTarget;
            }
        }
        if (props.postprocessing.bloom.name === 'on') {
            const _toDrawingBuffer = (toDrawingBuffer && props.postprocessing.dof.name === 'off') || targetIsDrawingbuffer;
            this.drawPass.bloom.update(this.tracing.colorTextureOpaque, this.tracing.normalTextureOpaque, this.drawPass.depthTextureOpaque, props.postprocessing.bloom.params);
            this.drawPass.bloom.render(camera.viewport, _toDrawingBuffer ? undefined : this._colorTarget);
        }
        if (props.postprocessing.dof.name === 'on') {
            const _toDrawingBuffer = toDrawingBuffer || targetIsDrawingbuffer;
            this.drawPass.dof.update(camera, this._colorTarget.texture, this.drawPass.depthTextureOpaque, this.drawPass.depthTargetTransparent.texture, props.postprocessing.dof.params, scene.boundingSphereVisible);
            this.drawPass.dof.render(camera.viewport, _toDrawingBuffer ? undefined : swapTarget);
            if (!_toDrawingBuffer) {
                this._colorTarget = swapTarget;
            }
        }
        this._iteration += 1;
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('IlluminationPass.render');
        this.webgl.gl.flush();
    }
    renderMultiSample(ctx, props, toDrawingBuffer) {
        const { camera } = ctx;
        const { multiSampleCompose, multiSampleComposeTarget, multiSampleHoldTarget, webgl } = this;
        const { gl, state } = webgl;
        // based on the Multisample Anti-Aliasing Render Pass
        // contributed to three.js by bhouston / http://clara.io/
        //
        // This manual approach to MSAA re-renders the scene once for
        // each sample with camera jitter and accumulates the results.
        const offsetList = multi_sample_1.JitterVectors[Math.max(0, Math.min(props.multiSample.sampleLevel, 5))];
        const maxIterations = this.getMaxIterations(props);
        const iteration = Math.min(this._iteration, maxIterations);
        const sampleIndex = Math.floor((iteration / maxIterations) * offsetList.length);
        if (debug_1.isTimingMode) {
            webgl.timer.mark('IlluminationPass.renderMultiSample', {
                note: `sampleIndex ${sampleIndex + 1} of ${offsetList.length}`
            });
        }
        const { x, y, width, height } = camera.viewport;
        const sampleWeight = 1.0 / maxIterations;
        if (iteration === 0) {
            this.renderInternal(ctx, props, false, true);
            mol_util_1.ValueCell.update(multiSampleCompose.values.uWeight, 1.0);
            mol_util_1.ValueCell.update(multiSampleCompose.values.tColor, this._colorTarget.texture);
            multiSampleCompose.update();
            multiSampleHoldTarget.bind();
            state.disable(gl.BLEND);
            state.disable(gl.DEPTH_TEST);
            state.depthMask(false);
            state.viewport(x, y, width, height);
            state.scissor(x, y, width, height);
            multiSampleCompose.render();
        }
        else {
            camera.viewOffset.enabled = true;
            mol_util_1.ValueCell.update(multiSampleCompose.values.tColor, this._colorTarget.texture);
            mol_util_1.ValueCell.update(multiSampleCompose.values.uWeight, sampleWeight);
            multiSampleCompose.update();
            // render the scene multiple times, each slightly jitter offset
            // from the last and accumulate the results.
            const offset = offsetList[sampleIndex];
            camera_1.Camera.setViewOffset(camera.viewOffset, width, height, offset[0], offset[1], width, height);
            camera.update();
            // render scene
            this.renderInternal(ctx, props, false, this.prevSampleIndex !== sampleIndex);
            // compose rendered scene with compose target
            multiSampleComposeTarget.bind();
            state.enable(gl.BLEND);
            state.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            state.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
            state.disable(gl.DEPTH_TEST);
            state.depthMask(false);
            state.viewport(x, y, width, height);
            state.scissor(x, y, width, height);
            if (iteration === 1) {
                state.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            multiSampleCompose.render();
        }
        this.prevSampleIndex = sampleIndex;
        if (toDrawingBuffer) {
            this.webgl.unbindFramebuffer();
        }
        else {
            this.multiSampleAccumulateTarget.bind();
        }
        state.viewport(x, y, width, height);
        state.scissor(x, y, width, height);
        const accumulationWeight = iteration * sampleWeight;
        if (accumulationWeight > 0) {
            mol_util_1.ValueCell.update(multiSampleCompose.values.uWeight, 1.0);
            mol_util_1.ValueCell.update(multiSampleCompose.values.tColor, multiSampleComposeTarget.texture);
            multiSampleCompose.update();
            state.disable(gl.BLEND);
            multiSampleCompose.render();
        }
        if (accumulationWeight < 1.0) {
            mol_util_1.ValueCell.update(multiSampleCompose.values.uWeight, 1.0 - accumulationWeight);
            mol_util_1.ValueCell.update(multiSampleCompose.values.tColor, multiSampleHoldTarget.texture);
            multiSampleCompose.update();
            if (accumulationWeight === 0)
                state.disable(gl.BLEND);
            else
                state.enable(gl.BLEND);
            multiSampleCompose.render();
        }
        if (!toDrawingBuffer) {
            state.disable(gl.BLEND);
            this.colorTarget.bind();
            if (this.copyRenderable.values.tColor.ref.value !== this.multiSampleAccumulateTarget.texture) {
                mol_util_1.ValueCell.update(this.copyRenderable.values.tColor, this.multiSampleAccumulateTarget.texture);
                this.copyRenderable.update();
            }
            this.copyRenderable.render();
        }
        camera.viewOffset.enabled = false;
        camera.update();
        if (debug_1.isTimingMode)
            webgl.timer.markEnd('IlluminationPass.renderMultiSample');
    }
    render(ctx, props, toDrawingBuffer) {
        if (!this._supported)
            return;
        if (props.multiSample.mode === 'on') {
            this.renderMultiSample(ctx, props, toDrawingBuffer);
        }
        else {
            this.renderInternal(ctx, props, toDrawingBuffer, false);
        }
    }
}
exports.IlluminationPass = IlluminationPass;
//
const ComposeSchema = {
    ...util_1.QuadSchema,
    tColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tNormal: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tShaded: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tTransparentColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    dBlendTransparency: (0, schema_1.DefineSpec)('boolean'),
    tSsaoDepth: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tSsaoDepthTransparent: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tDepthOpaque: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tDepthTransparent: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tOutlines: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    uTexSize: (0, schema_1.UniformSpec)('v2'),
    dDenoise: (0, schema_1.DefineSpec)('boolean'),
    uDenoiseThreshold: (0, schema_1.UniformSpec)('f'),
    dOrthographic: (0, schema_1.DefineSpec)('number'),
    uNear: (0, schema_1.UniformSpec)('f'),
    uFar: (0, schema_1.UniformSpec)('f'),
    uFogNear: (0, schema_1.UniformSpec)('f'),
    uFogFar: (0, schema_1.UniformSpec)('f'),
    uFogColor: (0, schema_1.UniformSpec)('v3'),
    uOutlineColor: (0, schema_1.UniformSpec)('v3'),
    uOcclusionColor: (0, schema_1.UniformSpec)('v3'),
    uTransparentBackground: (0, schema_1.UniformSpec)('b'),
    dOcclusionEnable: (0, schema_1.DefineSpec)('boolean'),
    dOutlineEnable: (0, schema_1.DefineSpec)('boolean'),
    dOutlineScale: (0, schema_1.DefineSpec)('number'),
    dTransparentOutline: (0, schema_1.DefineSpec)('boolean'),
};
const ComposeShaderCode = (0, shader_code_1.ShaderCode)('compose', quad_vert_1.quad_vert, compose_frag_1.compose_frag);
function getComposeRenderable(ctx, colorTexture, normalTexture, shadedTexture, depthTextureOpaque, depthTextureTransparent, outlinesTexture, transparentColorTexture, ssaoDepthOpaqueTexture, ssaoDepthTransparentTexture, transparentOutline) {
    const values = {
        ...util_1.QuadValues,
        tColor: mol_util_1.ValueCell.create(colorTexture),
        tNormal: mol_util_1.ValueCell.create(normalTexture),
        tShaded: mol_util_1.ValueCell.create(shadedTexture),
        tTransparentColor: mol_util_1.ValueCell.create(transparentColorTexture),
        dBlendTransparency: mol_util_1.ValueCell.create(true),
        tSsaoDepth: mol_util_1.ValueCell.create(ssaoDepthOpaqueTexture),
        tSsaoDepthTransparent: mol_util_1.ValueCell.create(ssaoDepthTransparentTexture),
        tDepthOpaque: mol_util_1.ValueCell.create(depthTextureOpaque),
        tDepthTransparent: mol_util_1.ValueCell.create(depthTextureTransparent),
        tOutlines: mol_util_1.ValueCell.create(outlinesTexture),
        uTexSize: mol_util_1.ValueCell.create(vec2_1.Vec2.create(colorTexture.getWidth(), colorTexture.getHeight())),
        dDenoise: mol_util_1.ValueCell.create(true),
        uDenoiseThreshold: mol_util_1.ValueCell.create(0.1),
        dOrthographic: mol_util_1.ValueCell.create(0),
        uNear: mol_util_1.ValueCell.create(1),
        uFar: mol_util_1.ValueCell.create(10000),
        uFogNear: mol_util_1.ValueCell.create(10000),
        uFogFar: mol_util_1.ValueCell.create(10000),
        uFogColor: mol_util_1.ValueCell.create(vec3_1.Vec3.create(1, 1, 1)),
        uOutlineColor: mol_util_1.ValueCell.create(vec3_1.Vec3.create(0, 0, 0)),
        uOcclusionColor: mol_util_1.ValueCell.create(vec3_1.Vec3.create(0, 0, 0)),
        uTransparentBackground: mol_util_1.ValueCell.create(false),
        dOcclusionEnable: mol_util_1.ValueCell.create(false),
        dOutlineEnable: mol_util_1.ValueCell.create(false),
        dOutlineScale: mol_util_1.ValueCell.create(1),
        dTransparentOutline: mol_util_1.ValueCell.create(transparentOutline),
    };
    const schema = { ...ComposeSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', ComposeShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
//
const MultiSampleComposeSchema = {
    ...util_1.QuadSchema,
    tColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    uTexSize: (0, schema_1.UniformSpec)('v2'),
    uWeight: (0, schema_1.UniformSpec)('f'),
};
const MultiSampleComposeShaderCode = (0, shader_code_1.ShaderCode)('compose', quad_vert_1.quad_vert, compose_frag_2.compose_frag);
function getMultiSampleComposeRenderable(ctx, colorTexture) {
    const values = {
        ...util_1.QuadValues,
        tColor: mol_util_1.ValueCell.create(colorTexture),
        uTexSize: mol_util_1.ValueCell.create(vec2_1.Vec2.create(colorTexture.getWidth(), colorTexture.getHeight())),
        uWeight: mol_util_1.ValueCell.create(1.0),
    };
    const schema = { ...MultiSampleComposeSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', MultiSampleComposeShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
