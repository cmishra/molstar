"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Áron Samuel Kovács <aron.kovacs@mail.muni.cz>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntialiasingPass = exports.PostprocessingPass = exports.PostprocessingParams = void 0;
const util_1 = require("../../mol-gl/compute/util");
const schema_1 = require("../../mol-gl/renderable/schema");
const shader_code_1 = require("../../mol-gl/shader-code");
const mol_util_1 = require("../../mol-util");
const render_item_1 = require("../../mol-gl/webgl/render-item");
const renderable_1 = require("../../mol-gl/renderable");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const param_definition_1 = require("../../mol-util/param-definition");
const quad_vert_1 = require("../../mol-gl/shader/quad.vert");
const postprocessing_frag_1 = require("../../mol-gl/shader/postprocessing.frag");
const color_1 = require("../../mol-util/color");
const fxaa_1 = require("./fxaa");
const smaa_1 = require("./smaa");
const debug_1 = require("../../mol-util/debug");
const background_1 = require("./background");
const cas_1 = require("./cas");
const dof_1 = require("./dof");
const bloom_1 = require("./bloom");
const outline_1 = require("./outline");
const shadow_1 = require("./shadow");
const ssao_1 = require("./ssao");
const PostprocessingSchema = {
    ...util_1.QuadSchema,
    tSsaoDepth: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tSsaoDepthTransparent: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tTransparentColor: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    dBlendTransparency: (0, schema_1.DefineSpec)('boolean'),
    tDepthOpaque: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tDepthTransparent: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tShadows: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    tOutlines: (0, schema_1.TextureSpec)('texture', 'rgba', 'ubyte', 'nearest'),
    uTexSize: (0, schema_1.UniformSpec)('v2'),
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
    dOcclusionSingleDepth: (0, schema_1.DefineSpec)('boolean'),
    dOcclusionIncludeOpacity: (0, schema_1.DefineSpec)('boolean'),
    dOcclusionIncludeTransparency: (0, schema_1.DefineSpec)('boolean'),
    uOcclusionOffset: (0, schema_1.UniformSpec)('v2'),
    dShadowEnable: (0, schema_1.DefineSpec)('boolean'),
    dOutlineEnable: (0, schema_1.DefineSpec)('boolean'),
    dOutlineScale: (0, schema_1.DefineSpec)('number'),
    dTransparentOutline: (0, schema_1.DefineSpec)('boolean'),
};
function getPostprocessingRenderable(ctx, colorTexture, transparentColorTexture, depthTextureOpaque, depthTextureTransparent, shadowsTexture, outlinesTexture, ssaoDepthTexture, ssaoDepthTransparentTexture, transparentOutline) {
    const values = {
        ...util_1.QuadValues,
        tSsaoDepth: mol_util_1.ValueCell.create(ssaoDepthTexture),
        tSsaoDepthTransparent: mol_util_1.ValueCell.create(ssaoDepthTransparentTexture),
        tColor: mol_util_1.ValueCell.create(colorTexture),
        tTransparentColor: mol_util_1.ValueCell.create(transparentColorTexture),
        dBlendTransparency: mol_util_1.ValueCell.create(true),
        tDepthOpaque: mol_util_1.ValueCell.create(depthTextureOpaque),
        tDepthTransparent: mol_util_1.ValueCell.create(depthTextureTransparent),
        tShadows: mol_util_1.ValueCell.create(shadowsTexture),
        tOutlines: mol_util_1.ValueCell.create(outlinesTexture),
        uTexSize: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(colorTexture.getWidth(), colorTexture.getHeight())),
        dOrthographic: mol_util_1.ValueCell.create(0),
        uNear: mol_util_1.ValueCell.create(1),
        uFar: mol_util_1.ValueCell.create(10000),
        uFogNear: mol_util_1.ValueCell.create(10000),
        uFogFar: mol_util_1.ValueCell.create(10000),
        uFogColor: mol_util_1.ValueCell.create(linear_algebra_1.Vec3.create(1, 1, 1)),
        uOutlineColor: mol_util_1.ValueCell.create(linear_algebra_1.Vec3.create(0, 0, 0)),
        uOcclusionColor: mol_util_1.ValueCell.create(linear_algebra_1.Vec3.create(0, 0, 0)),
        uTransparentBackground: mol_util_1.ValueCell.create(false),
        dOcclusionEnable: mol_util_1.ValueCell.create(true),
        dOcclusionSingleDepth: mol_util_1.ValueCell.create(false),
        dOcclusionIncludeOpacity: mol_util_1.ValueCell.create(true),
        dOcclusionIncludeTransparency: mol_util_1.ValueCell.create(false),
        uOcclusionOffset: mol_util_1.ValueCell.create(linear_algebra_1.Vec2.create(0, 0)),
        dShadowEnable: mol_util_1.ValueCell.create(false),
        dOutlineEnable: mol_util_1.ValueCell.create(false),
        dOutlineScale: mol_util_1.ValueCell.create(1),
        dTransparentOutline: mol_util_1.ValueCell.create(transparentOutline),
    };
    const schema = { ...PostprocessingSchema };
    const shaderCode = (0, shader_code_1.ShaderCode)('postprocessing', quad_vert_1.quad_vert, postprocessing_frag_1.postprocessing_frag);
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', shaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
exports.PostprocessingParams = {
    occlusion: param_definition_1.ParamDefinition.MappedStatic('on', {
        on: param_definition_1.ParamDefinition.Group(ssao_1.SsaoParams),
        off: param_definition_1.ParamDefinition.Group({})
    }, { cycle: true, description: 'Darken occluded crevices with the ambient occlusion effect' }),
    shadow: param_definition_1.ParamDefinition.MappedStatic('off', {
        on: param_definition_1.ParamDefinition.Group(shadow_1.ShadowParams),
        off: param_definition_1.ParamDefinition.Group({})
    }, { cycle: true, description: 'Simplistic shadows' }),
    outline: param_definition_1.ParamDefinition.MappedStatic('off', {
        on: param_definition_1.ParamDefinition.Group(outline_1.OutlineParams),
        off: param_definition_1.ParamDefinition.Group({})
    }, { cycle: true, description: 'Draw outline around 3D objects' }),
    dof: param_definition_1.ParamDefinition.MappedStatic('off', {
        on: param_definition_1.ParamDefinition.Group(dof_1.DofParams),
        off: param_definition_1.ParamDefinition.Group({})
    }, { cycle: true, description: 'DOF' }),
    antialiasing: param_definition_1.ParamDefinition.MappedStatic('smaa', {
        fxaa: param_definition_1.ParamDefinition.Group(fxaa_1.FxaaParams),
        smaa: param_definition_1.ParamDefinition.Group(smaa_1.SmaaParams),
        off: param_definition_1.ParamDefinition.Group({})
    }, { options: [['fxaa', 'FXAA'], ['smaa', 'SMAA'], ['off', 'Off']], description: 'Smooth pixel edges' }),
    sharpening: param_definition_1.ParamDefinition.MappedStatic('off', {
        on: param_definition_1.ParamDefinition.Group(cas_1.CasParams),
        off: param_definition_1.ParamDefinition.Group({})
    }, { cycle: true, description: 'Contrast Adaptive Sharpening' }),
    background: param_definition_1.ParamDefinition.Group(background_1.BackgroundParams, { isFlat: true }),
    bloom: param_definition_1.ParamDefinition.MappedStatic('on', {
        on: param_definition_1.ParamDefinition.Group(bloom_1.BloomParams),
        off: param_definition_1.ParamDefinition.Group({})
    }, { cycle: true, description: 'Bloom' }),
};
class PostprocessingPass {
    static isEnabled(props) {
        return ssao_1.SsaoPass.isEnabled(props) || shadow_1.ShadowPass.isEnabled(props) || outline_1.OutlinePass.isEnabled(props) || props.background.variant.name !== 'off';
    }
    static isTransparentDepthRequired(scene, props) {
        return dof_1.DofPass.isEnabled(props) || outline_1.OutlinePass.isEnabled(props) && PostprocessingPass.isTransparentOutlineEnabled(props) || ssao_1.SsaoPass.isEnabled(props) && PostprocessingPass.isTransparentSsaoEnabled(scene, props);
    }
    static isTransparentOutlineEnabled(props) {
        var _a;
        return outline_1.OutlinePass.isEnabled(props) && ((_a = props.outline.params.includeTransparent) !== null && _a !== void 0 ? _a : true);
    }
    static isTransparentSsaoEnabled(scene, props) {
        return ssao_1.SsaoPass.isEnabled(props) && ssao_1.SsaoPass.isTransparentEnabled(scene, props.occlusion.params);
    }
    static isSsaoEnabled(props) {
        return ssao_1.SsaoPass.isEnabled(props);
    }
    constructor(webgl, assetManager, drawPass) {
        this.webgl = webgl;
        this.drawPass = drawPass;
        this.occlusionOffset = [0, 0];
        this.transparentBackground = false;
        const { colorTarget, transparentColorTarget, depthTextureOpaque, depthTextureTransparent, packedDepth } = drawPass;
        const width = colorTarget.getWidth();
        const height = colorTarget.getHeight();
        // needs to be linear for anti-aliasing pass
        this.target = webgl.createRenderTarget(width, height, false, 'uint8', 'linear');
        this.ssao = new ssao_1.SsaoPass(webgl, width, height, packedDepth, depthTextureOpaque, depthTextureTransparent);
        this.shadow = new shadow_1.ShadowPass(webgl, width, height, depthTextureOpaque);
        this.outline = new outline_1.OutlinePass(webgl, width, height, depthTextureTransparent, depthTextureOpaque);
        this.renderable = getPostprocessingRenderable(webgl, colorTarget.texture, transparentColorTarget.texture, depthTextureOpaque, depthTextureTransparent, this.shadow.target.texture, this.outline.target.texture, this.ssao.ssaoDepthTexture, this.ssao.ssaoDepthTransparentTexture, true);
        this.background = new background_1.BackgroundPass(webgl, assetManager, width, height);
    }
    setSize(width, height) {
        const [w, h] = this.renderable.values.uTexSize.ref.value;
        if (width !== w || height !== h) {
            this.target.setSize(width, height);
            mol_util_1.ValueCell.update(this.renderable.values.uTexSize, linear_algebra_1.Vec2.set(this.renderable.values.uTexSize.ref.value, width, height));
        }
        this.ssao.setSize(width, height);
        this.shadow.setSize(width, height);
        this.outline.setSize(width, height);
        this.background.setSize(width, height);
    }
    updateState(camera, scene, transparentBackground, backgroundColor, props, light, ambientColor) {
        let needsUpdateMain = false;
        const orthographic = camera.state.mode === 'orthographic' ? 1 : 0;
        const outlinesEnabled = outline_1.OutlinePass.isEnabled(props);
        const shadowsEnabled = shadow_1.ShadowPass.isEnabled(props);
        const occlusionEnabled = ssao_1.SsaoPass.isEnabled(props);
        if (occlusionEnabled) {
            const params = props.occlusion.params;
            this.ssao.update(camera, scene, params);
            const includeTransparency = ssao_1.SsaoPass.isTransparentEnabled(scene, params);
            if (this.renderable.values.dOcclusionIncludeTransparency.ref.value !== includeTransparency) {
                needsUpdateMain = true;
                mol_util_1.ValueCell.update(this.renderable.values.dOcclusionIncludeTransparency, includeTransparency);
            }
            mol_util_1.ValueCell.update(this.renderable.values.uOcclusionColor, color_1.Color.toVec3Normalized(this.renderable.values.uOcclusionColor.ref.value, params.color));
        }
        if (shadowsEnabled) {
            this.shadow.update(camera, light, ambientColor, props.shadow.params);
        }
        if (outlinesEnabled) {
            const outlineProps = props.outline.params;
            const { transparentOutline, outlineScale } = this.outline.update(camera, outlineProps, this.drawPass.depthTextureTransparent, this.drawPass.depthTextureOpaque);
            mol_util_1.ValueCell.update(this.renderable.values.uOutlineColor, color_1.Color.toVec3Normalized(this.renderable.values.uOutlineColor.ref.value, outlineProps.color));
            if (this.renderable.values.dOutlineScale.ref.value !== outlineScale) {
                needsUpdateMain = true;
                mol_util_1.ValueCell.update(this.renderable.values.dOutlineScale, outlineScale);
            }
            if (this.renderable.values.dTransparentOutline.ref.value !== transparentOutline) {
                needsUpdateMain = true;
                mol_util_1.ValueCell.update(this.renderable.values.dTransparentOutline, transparentOutline);
            }
        }
        mol_util_1.ValueCell.updateIfChanged(this.renderable.values.uFar, camera.far);
        mol_util_1.ValueCell.updateIfChanged(this.renderable.values.uNear, camera.near);
        mol_util_1.ValueCell.updateIfChanged(this.renderable.values.uFogFar, camera.fogFar);
        mol_util_1.ValueCell.updateIfChanged(this.renderable.values.uFogNear, camera.fogNear);
        mol_util_1.ValueCell.update(this.renderable.values.uFogColor, color_1.Color.toVec3Normalized(this.renderable.values.uFogColor.ref.value, backgroundColor));
        mol_util_1.ValueCell.updateIfChanged(this.renderable.values.uTransparentBackground, transparentBackground);
        if (this.renderable.values.dOrthographic.ref.value !== orthographic) {
            needsUpdateMain = true;
            mol_util_1.ValueCell.update(this.renderable.values.dOrthographic, orthographic);
        }
        if (this.renderable.values.dOutlineEnable.ref.value !== outlinesEnabled) {
            needsUpdateMain = true;
            mol_util_1.ValueCell.update(this.renderable.values.dOutlineEnable, outlinesEnabled);
        }
        if (this.renderable.values.dShadowEnable.ref.value !== shadowsEnabled) {
            needsUpdateMain = true;
            mol_util_1.ValueCell.update(this.renderable.values.dShadowEnable, shadowsEnabled);
        }
        if (this.renderable.values.dOcclusionEnable.ref.value !== occlusionEnabled) {
            needsUpdateMain = true;
            mol_util_1.ValueCell.update(this.renderable.values.dOcclusionEnable, occlusionEnabled);
        }
        const blendTransparency = scene.opacityAverage < 1;
        if (this.renderable.values.dBlendTransparency.ref.value !== blendTransparency) {
            needsUpdateMain = true;
            mol_util_1.ValueCell.update(this.renderable.values.dBlendTransparency, blendTransparency);
        }
        if (needsUpdateMain) {
            this.renderable.update();
        }
        const { gl, state } = this.webgl;
        state.enable(gl.SCISSOR_TEST);
        state.disable(gl.BLEND);
        state.disable(gl.DEPTH_TEST);
        state.depthMask(false);
    }
    setOcclusionOffset(x, y) {
        this.occlusionOffset[0] = x;
        this.occlusionOffset[1] = y;
        mol_util_1.ValueCell.update(this.renderable.values.uOcclusionOffset, linear_algebra_1.Vec2.set(this.renderable.values.uOcclusionOffset.ref.value, x, y));
    }
    setTransparentBackground(value) {
        this.transparentBackground = value;
    }
    render(camera, scene, toDrawingBuffer, transparentBackground, backgroundColor, props, light, ambientColor) {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('PostprocessingPass.render');
        this.updateState(camera, scene, transparentBackground, backgroundColor, props, light, ambientColor);
        const { state } = this.webgl;
        const { x, y, width, height } = camera.viewport;
        // don't render occlusion if offset is given,
        // which will reuse the existing occlusion
        if (props.occlusion.name === 'on' && this.occlusionOffset[0] === 0 && this.occlusionOffset[1] === 0) {
            this.ssao.render(camera);
        }
        state.viewport(x, y, width, height);
        state.scissor(x, y, width, height);
        if (props.outline.name === 'on') {
            this.outline.render();
        }
        if (props.shadow.name === 'on') {
            this.shadow.render();
        }
        if (toDrawingBuffer) {
            this.webgl.unbindFramebuffer();
        }
        else {
            this.target.bind();
        }
        this.background.update(camera, props.background);
        this.background.clear(props.background, this.transparentBackground, backgroundColor);
        this.background.render(props.background);
        this.renderable.render();
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('PostprocessingPass.render');
    }
}
exports.PostprocessingPass = PostprocessingPass;
class AntialiasingPass {
    static isEnabled(props) {
        return props.antialiasing.name !== 'off';
    }
    constructor(webgl, width, height) {
        this.target = webgl.createRenderTarget(width, height, false);
        this.internalTarget = webgl.createRenderTarget(width, height, false);
        this.fxaa = new fxaa_1.FxaaPass(webgl, this.target.texture);
        this.smaa = new smaa_1.SmaaPass(webgl, this.target.texture);
        this.cas = new cas_1.CasPass(webgl, this.target.texture);
    }
    setSize(width, height) {
        const w = this.target.texture.getWidth();
        const h = this.target.texture.getHeight();
        if (width !== w || height !== h) {
            this.target.setSize(width, height);
            this.internalTarget.setSize(width, height);
            this.fxaa.setSize(width, height);
            if (this.smaa.supported)
                this.smaa.setSize(width, height);
            this.cas.setSize(width, height);
        }
    }
    _renderFxaa(camera, input, target, props) {
        if (props.antialiasing.name !== 'fxaa')
            return;
        this.fxaa.update(input, props.antialiasing.params);
        this.fxaa.render(camera.viewport, target);
    }
    _renderSmaa(camera, input, target, props) {
        if (props.antialiasing.name !== 'smaa')
            return;
        this.smaa.update(input, props.antialiasing.params);
        this.smaa.render(camera.viewport, target);
    }
    _renderAntialiasing(camera, input, target, props) {
        if (props.antialiasing.name === 'fxaa') {
            this._renderFxaa(camera, input, target, props);
        }
        else if (props.antialiasing.name === 'smaa') {
            this._renderSmaa(camera, input, target, props);
        }
    }
    _renderCas(camera, input, target, props) {
        if (props.sharpening.name !== 'on')
            return;
        if (props.antialiasing.name !== 'off')
            input = this.internalTarget.texture;
        this.cas.update(input, props.sharpening.params);
        this.cas.render(camera.viewport, target);
    }
    render(camera, input, toDrawingBuffer, props) {
        if (props.antialiasing.name === 'off' && props.sharpening.name === 'off')
            return;
        if (props.antialiasing.name === 'smaa' && !this.smaa.supported) {
            console.error('SMAA not supported, missing "HTMLImageElement"');
            return;
        }
        const target = toDrawingBuffer === true
            ? undefined : toDrawingBuffer === false
            ? this.target : toDrawingBuffer;
        if (props.sharpening.name === 'off') {
            this._renderAntialiasing(camera, input, target, props);
        }
        else if (props.antialiasing.name === 'off') {
            this._renderCas(camera, input, target, props);
        }
        else {
            this._renderAntialiasing(camera, input, this.internalTarget, props);
            this._renderCas(camera, input, target, props);
        }
    }
}
exports.AntialiasingPass = AntialiasingPass;
