"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageShaderCode = exports.DirectVolumeShaderCode = exports.MeshShaderCode = exports.LinesShaderCode = exports.TextShaderCode = exports.CylindersShaderCode = exports.SpheresShaderCode = exports.PointsShaderCode = void 0;
exports.ShaderCode = ShaderCode;
exports.addShaderDefines = addShaderDefines;
const id_factory_1 = require("../mol-util/id-factory");
const compat_1 = require("./webgl/compat");
const type_helpers_1 = require("../mol-util/type-helpers");
const shaderCodeId = (0, id_factory_1.idFactory)();
const apply_fog_glsl_1 = require("./shader/chunks/apply-fog.glsl");
const apply_interior_color_glsl_1 = require("./shader/chunks/apply-interior-color.glsl");
const apply_light_color_glsl_1 = require("./shader/chunks/apply-light-color.glsl");
const apply_marker_color_glsl_1 = require("./shader/chunks/apply-marker-color.glsl");
const assign_clipping_varying_glsl_1 = require("./shader/chunks/assign-clipping-varying.glsl");
const assign_color_varying_glsl_1 = require("./shader/chunks/assign-color-varying.glsl");
const assign_group_glsl_1 = require("./shader/chunks/assign-group.glsl");
const assign_marker_varying_glsl_1 = require("./shader/chunks/assign-marker-varying.glsl");
const assign_material_color_glsl_1 = require("./shader/chunks/assign-material-color.glsl");
const assign_position_glsl_1 = require("./shader/chunks/assign-position.glsl");
const assign_size_glsl_1 = require("./shader/chunks/assign-size.glsl");
const check_picking_alpha_glsl_1 = require("./shader/chunks/check-picking-alpha.glsl");
const check_transparency_glsl_1 = require("./shader/chunks/check-transparency.glsl");
const clip_instance_glsl_1 = require("./shader/chunks/clip-instance.glsl");
const clip_pixel_glsl_1 = require("./shader/chunks/clip-pixel.glsl");
const color_frag_params_glsl_1 = require("./shader/chunks/color-frag-params.glsl");
const color_vert_params_glsl_1 = require("./shader/chunks/color-vert-params.glsl");
const common_clip_glsl_1 = require("./shader/chunks/common-clip.glsl");
const common_frag_params_glsl_1 = require("./shader/chunks/common-frag-params.glsl");
const common_vert_params_glsl_1 = require("./shader/chunks/common-vert-params.glsl");
const common_glsl_1 = require("./shader/chunks/common.glsl");
const fade_lod_glsl_1 = require("./shader/chunks/fade-lod.glsl");
const float_to_rgba_glsl_1 = require("./shader/chunks/float-to-rgba.glsl");
const light_frag_params_glsl_1 = require("./shader/chunks/light-frag-params.glsl");
const matrix_scale_glsl_1 = require("./shader/chunks/matrix-scale.glsl");
const normal_frag_params_glsl_1 = require("./shader/chunks/normal-frag-params.glsl");
const read_from_texture_glsl_1 = require("./shader/chunks/read-from-texture.glsl");
const rgba_to_float_glsl_1 = require("./shader/chunks/rgba-to-float.glsl");
const size_vert_params_glsl_1 = require("./shader/chunks/size-vert-params.glsl");
const texture3d_from_1d_trilinear_glsl_1 = require("./shader/chunks/texture3d-from-1d-trilinear.glsl");
const texture3d_from_2d_linear_glsl_1 = require("./shader/chunks/texture3d-from-2d-linear.glsl");
const texture3d_from_2d_nearest_glsl_1 = require("./shader/chunks/texture3d-from-2d-nearest.glsl");
const wboit_write_glsl_1 = require("./shader/chunks/wboit-write.glsl");
const dpoit_write_glsl_1 = require("./shader/chunks/dpoit-write.glsl");
const ShaderChunks = {
    apply_fog: apply_fog_glsl_1.apply_fog,
    apply_interior_color: apply_interior_color_glsl_1.apply_interior_color,
    apply_light_color: apply_light_color_glsl_1.apply_light_color,
    apply_marker_color: apply_marker_color_glsl_1.apply_marker_color,
    assign_clipping_varying: assign_clipping_varying_glsl_1.assign_clipping_varying,
    assign_color_varying: assign_color_varying_glsl_1.assign_color_varying,
    assign_group: assign_group_glsl_1.assign_group,
    assign_marker_varying: assign_marker_varying_glsl_1.assign_marker_varying,
    assign_material_color: assign_material_color_glsl_1.assign_material_color,
    assign_position: assign_position_glsl_1.assign_position,
    assign_size: assign_size_glsl_1.assign_size,
    check_picking_alpha: check_picking_alpha_glsl_1.check_picking_alpha,
    check_transparency: check_transparency_glsl_1.check_transparency,
    clip_instance: clip_instance_glsl_1.clip_instance,
    clip_pixel: clip_pixel_glsl_1.clip_pixel,
    color_frag_params: color_frag_params_glsl_1.color_frag_params,
    color_vert_params: color_vert_params_glsl_1.color_vert_params,
    common_clip: common_clip_glsl_1.common_clip,
    common_frag_params: common_frag_params_glsl_1.common_frag_params,
    common_vert_params: common_vert_params_glsl_1.common_vert_params,
    common: common_glsl_1.common,
    fade_lod: fade_lod_glsl_1.fade_lod,
    float_to_rgba: float_to_rgba_glsl_1.float_to_rgba,
    light_frag_params: light_frag_params_glsl_1.light_frag_params,
    matrix_scale: matrix_scale_glsl_1.matrix_scale,
    normal_frag_params: normal_frag_params_glsl_1.normal_frag_params,
    read_from_texture: read_from_texture_glsl_1.read_from_texture,
    rgba_to_float: rgba_to_float_glsl_1.rgba_to_float,
    size_vert_params: size_vert_params_glsl_1.size_vert_params,
    texture3d_from_1d_trilinear: texture3d_from_1d_trilinear_glsl_1.texture3d_from_1d_trilinear,
    texture3d_from_2d_linear: texture3d_from_2d_linear_glsl_1.texture3d_from_2d_linear,
    texture3d_from_2d_nearest: texture3d_from_2d_nearest_glsl_1.texture3d_from_2d_nearest,
    wboit_write: wboit_write_glsl_1.wboit_write,
    dpoit_write: dpoit_write_glsl_1.dpoit_write
};
const reInclude = /^(?!\/\/)\s*#include\s+(\S+)/gm;
const reUnrollLoop = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*\+\+i\s*\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
const reSingleLineComment = /[ \t]*\/\/.*\n/g;
const reMultiLineComment = /[ \t]*\/\*[\s\S]*?\*\//g;
const reMultipleLinebreaks = /\n{2,}/g;
function addIncludes(text) {
    return text
        .replace(reInclude, (_, p1) => {
        const chunk = ShaderChunks[p1];
        if (!chunk)
            throw new Error(`empty chunk, '${p1}'`);
        return chunk;
    })
        .trim()
        .replace(reSingleLineComment, '\n')
        .replace(reMultiLineComment, '\n')
        .replace(reMultipleLinebreaks, '\n');
}
function unrollLoops(str) {
    return str.replace(reUnrollLoop, loopReplacer);
}
function loopReplacer(_match, start, end, snippet) {
    let out = '';
    for (let i = parseInt(start); i < parseInt(end); ++i) {
        out += snippet
            .replace(/\[\s*i\s*\]/g, `[${i}]`)
            .replace(/UNROLLED_LOOP_INDEX/g, `${i}`);
    }
    return out;
}
function replaceCounts(str, defines) {
    if (defines.dLightCount)
        str = str.replace(/dLightCount/g, `${defines.dLightCount.ref.value}`);
    if (defines.dClipObjectCount)
        str = str.replace(/dClipObjectCount/g, `${defines.dClipObjectCount.ref.value}`);
    return str;
}
function preprocess(str, defines) {
    return unrollLoops(replaceCounts(str, defines));
}
function ShaderCode(name, vert, frag, extensions = {}, outTypes = {}, ignoreDefine) {
    return { id: shaderCodeId(), name, vert: addIncludes(vert), frag: addIncludes(frag), extensions, outTypes, ignoreDefine };
}
// Note: `drawBuffers` need to be 'optional' for wboit
function ignoreDefine(name, variant, defines) {
    var _a;
    if (variant.startsWith('color') || variant === 'tracing') {
        if (name === 'dLightCount') {
            return !!((_a = defines.dIgnoreLight) === null || _a === void 0 ? void 0 : _a.ref.value);
        }
    }
    else {
        const ignore = [
            'dColorType', 'dUsePalette',
            'dOverpaintType', 'dOverpaint',
            'dSubstanceType', 'dSubstance',
            'dColorMarker', 'dCelShaded',
            'dLightCount',
        ];
        if (variant !== 'depth') {
            ignore.push('dXrayShaded');
        }
        if (variant !== 'emissive') {
            ignore.push('dEmissiveType', 'dEmissive');
        }
        return ignore.includes(name);
    }
    return false;
}
;
function ignoreDefineUnlit(name, variant, defines) {
    if (name === 'dLightCount')
        return true;
    return ignoreDefine(name, variant, defines);
}
;
const points_vert_1 = require("./shader/points.vert");
const points_frag_1 = require("./shader/points.frag");
exports.PointsShaderCode = ShaderCode('points', points_vert_1.points_vert, points_frag_1.points_frag, { drawBuffers: 'optional' }, {}, ignoreDefineUnlit);
const spheres_vert_1 = require("./shader/spheres.vert");
const spheres_frag_1 = require("./shader/spheres.frag");
exports.SpheresShaderCode = ShaderCode('spheres', spheres_vert_1.spheres_vert, spheres_frag_1.spheres_frag, { fragDepth: 'required', drawBuffers: 'optional' }, {}, ignoreDefine);
const cylinders_vert_1 = require("./shader/cylinders.vert");
const cylinders_frag_1 = require("./shader/cylinders.frag");
exports.CylindersShaderCode = ShaderCode('cylinders', cylinders_vert_1.cylinders_vert, cylinders_frag_1.cylinders_frag, { fragDepth: 'required', drawBuffers: 'optional' }, {}, ignoreDefine);
const text_vert_1 = require("./shader/text.vert");
const text_frag_1 = require("./shader/text.frag");
exports.TextShaderCode = ShaderCode('text', text_vert_1.text_vert, text_frag_1.text_frag, { drawBuffers: 'optional' }, {}, ignoreDefineUnlit);
const lines_vert_1 = require("./shader/lines.vert");
const lines_frag_1 = require("./shader/lines.frag");
exports.LinesShaderCode = ShaderCode('lines', lines_vert_1.lines_vert, lines_frag_1.lines_frag, { drawBuffers: 'optional' }, {}, ignoreDefineUnlit);
const mesh_vert_1 = require("./shader/mesh.vert");
const mesh_frag_1 = require("./shader/mesh.frag");
exports.MeshShaderCode = ShaderCode('mesh', mesh_vert_1.mesh_vert, mesh_frag_1.mesh_frag, { drawBuffers: 'optional' }, {}, ignoreDefine);
const direct_volume_vert_1 = require("./shader/direct-volume.vert");
const direct_volume_frag_1 = require("./shader/direct-volume.frag");
exports.DirectVolumeShaderCode = ShaderCode('direct-volume', direct_volume_vert_1.directVolume_vert, direct_volume_frag_1.directVolume_frag, { fragDepth: 'optional', drawBuffers: 'optional' }, {}, ignoreDefine);
const image_vert_1 = require("./shader/image.vert");
const image_frag_1 = require("./shader/image.frag");
exports.ImageShaderCode = ShaderCode('image', image_vert_1.image_vert, image_frag_1.image_frag, { drawBuffers: 'optional' }, {}, ignoreDefineUnlit);
function getDefinesCode(defines, ignore) {
    var _a;
    if (defines === undefined)
        return '';
    const variant = (((_a = defines.dRenderVariant) === null || _a === void 0 ? void 0 : _a.ref.value) || '');
    const lines = [];
    for (const name in defines) {
        if (ignore === null || ignore === void 0 ? void 0 : ignore(name, variant, defines))
            continue;
        const define = defines[name];
        const v = define.ref.value;
        if (v !== undefined) {
            if (typeof v === 'string') {
                lines.push(`#define ${name}_${v}`);
            }
            else if (typeof v === 'number') {
                lines.push(`#define ${name} ${v}`);
            }
            else if (typeof v === 'boolean') {
                if (v)
                    lines.push(`#define ${name}`);
            }
            else {
                (0, type_helpers_1.assertUnreachable)(v);
            }
        }
    }
    return lines.join('\n') + '\n';
}
function getGlsl100VertPrefix(extensions, shaderExtensions) {
    const prefix = [];
    if (shaderExtensions.drawBuffers) {
        if (extensions.drawBuffers) {
            prefix.push('#define requiredDrawBuffers');
        }
        else if (shaderExtensions.drawBuffers === 'required') {
            throw new Error(`required 'GL_EXT_draw_buffers' extension not available`);
        }
    }
    if (shaderExtensions.multiDraw) {
        if (extensions.multiDraw) {
            prefix.push('#extension GL_ANGLE_multi_draw : require');
            prefix.push('#define enabledMultiDraw');
        }
        else if (shaderExtensions.multiDraw === 'required') {
            throw new Error(`required 'GL_ANGLE_multi_draw' extension not available`);
        }
    }
    return prefix.join('\n') + '\n';
}
function getGlsl100FragPrefix(extensions, shaderExtensions) {
    const prefix = [
        '#extension GL_OES_standard_derivatives : enable'
    ];
    if (shaderExtensions.fragDepth) {
        if (extensions.fragDepth) {
            prefix.push('#extension GL_EXT_frag_depth : enable');
            prefix.push('#define enabledFragDepth');
        }
        else if (shaderExtensions.fragDepth === 'required') {
            throw new Error(`required 'GL_EXT_frag_depth' extension not available`);
        }
    }
    if (shaderExtensions.drawBuffers) {
        if (extensions.drawBuffers) {
            prefix.push('#extension GL_EXT_draw_buffers : require');
            prefix.push('#define requiredDrawBuffers');
            prefix.push('#define gl_FragColor gl_FragData[0]');
        }
        else if (shaderExtensions.drawBuffers === 'required') {
            throw new Error(`required 'GL_EXT_draw_buffers' extension not available`);
        }
    }
    if (shaderExtensions.shaderTextureLod) {
        if (extensions.shaderTextureLod) {
            prefix.push('#extension GL_EXT_shader_texture_lod : enable');
            prefix.push('#define enabledShaderTextureLod');
        }
        else if (shaderExtensions.shaderTextureLod === 'required') {
            throw new Error(`required 'GL_EXT_shader_texture_lod' extension not available`);
        }
    }
    if (extensions.depthTexture) {
        prefix.push('#define depthTextureSupport');
    }
    return prefix.join('\n') + '\n';
}
const glsl300VertPrefixCommon = `
#define attribute in
#define varying out
#define texture2D texture
`;
const glsl300FragPrefixCommon = `
#define varying in
#define texture2D texture
#define textureCube texture
#define texture2DLodEXT textureLod
#define textureCubeLodEXT textureLod

#define gl_FragColor out_FragData0
#define gl_FragDepthEXT gl_FragDepth
`;
function getGlsl300VertPrefix(extensions, shaderExtensions) {
    const prefix = [
        '#version 300 es',
    ];
    if (shaderExtensions.drawBuffers) {
        if (extensions.drawBuffers) {
            prefix.push('#define requiredDrawBuffers');
        }
    }
    if (shaderExtensions.multiDraw) {
        if (extensions.multiDraw) {
            prefix.push('#extension GL_ANGLE_multi_draw : require');
            prefix.push('#define enabledMultiDraw');
        }
        else if (shaderExtensions.multiDraw === 'required') {
            throw new Error(`required 'GL_ANGLE_multi_draw' extension not available`);
        }
    }
    if (shaderExtensions.clipCullDistance) {
        if (extensions.clipCullDistance) {
            prefix.push('#extension GL_ANGLE_clip_cull_distance : enable');
            prefix.push('#define enabledClipCullDistance');
        }
        else if (shaderExtensions.clipCullDistance === 'required') {
            throw new Error(`required 'GL_ANGLE_clip_cull_distance' extension not available`);
        }
    }
    if (shaderExtensions.conservativeDepth) {
        if (extensions.conservativeDepth) {
            prefix.push('#extension GL_EXT_conservative_depth : enable');
            prefix.push('#define enabledConservativeDepth');
        }
        else if (shaderExtensions.conservativeDepth === 'required') {
            throw new Error(`required 'GL_EXT_conservative_depth' extension not available`);
        }
    }
    if (extensions.noNonInstancedActiveAttribs) {
        prefix.push('#define noNonInstancedActiveAttribs');
    }
    prefix.push(glsl300VertPrefixCommon);
    return prefix.join('\n') + '\n';
}
function getGlsl300FragPrefix(gl, extensions, shaderExtensions, outTypes) {
    const prefix = [
        '#version 300 es',
        `layout(location = 0) out highp ${outTypes[0] || 'vec4'} out_FragData0;`
    ];
    if (shaderExtensions.fragDepth) {
        if (extensions.fragDepth) {
            prefix.push('#define enabledFragDepth');
        }
    }
    if (shaderExtensions.drawBuffers) {
        if (extensions.drawBuffers) {
            prefix.push('#define requiredDrawBuffers');
            const maxDrawBuffers = gl.getParameter(gl.MAX_DRAW_BUFFERS);
            for (let i = 1, il = maxDrawBuffers; i < il; ++i) {
                prefix.push(`layout(location = ${i}) out highp ${outTypes[i] || 'vec4'} out_FragData${i};`);
            }
        }
    }
    if (shaderExtensions.shaderTextureLod) {
        if (extensions.shaderTextureLod) {
            prefix.push('#define enabledShaderTextureLod');
        }
    }
    if (extensions.depthTexture) {
        prefix.push('#define depthTextureSupport');
    }
    prefix.push(glsl300FragPrefixCommon);
    return prefix.join('\n') + '\n';
}
function transformGlsl300Frag(frag) {
    return frag.replace(/gl_FragData\[([0-9]+)\]/g, 'out_FragData$1');
}
function addShaderDefines(gl, extensions, defines, shaders) {
    const vertHeader = getDefinesCode(defines, shaders.ignoreDefine);
    const fragHeader = getDefinesCode(defines, shaders.ignoreDefine);
    const vertPrefix = (0, compat_1.isWebGL2)(gl)
        ? getGlsl300VertPrefix(extensions, shaders.extensions)
        : getGlsl100VertPrefix(extensions, shaders.extensions);
    const fragPrefix = (0, compat_1.isWebGL2)(gl)
        ? getGlsl300FragPrefix(gl, extensions, shaders.extensions, shaders.outTypes)
        : getGlsl100FragPrefix(extensions, shaders.extensions);
    const frag = (0, compat_1.isWebGL2)(gl) ? transformGlsl300Frag(shaders.frag) : shaders.frag;
    return {
        id: shaderCodeId(),
        name: shaders.name,
        vert: `${vertPrefix}${vertHeader}${preprocess(shaders.vert, defines)}`,
        frag: `${fragPrefix}${fragHeader}${preprocess(frag, defines)}`,
        extensions: shaders.extensions,
        outTypes: shaders.outTypes
    };
}
