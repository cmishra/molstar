/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Áron Samuel Kovács <aron.kovacs@mail.muni.cz>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
export declare const ssao_frag = "\nprecision highp float;\nprecision highp int;\nprecision highp sampler2D;\n\n#include common\n\n\nuniform sampler2D tDepth;\nuniform sampler2D tDepthHalf;\nuniform sampler2D tDepthQuarter;\n\n#if defined(dIncludeTransparent)\n    uniform sampler2D tDepthTransparent;\n    uniform sampler2D tDepthHalfTransparent;\n    uniform sampler2D tDepthQuarterTransparent;\n#endif\n\nuniform int uTransparencyFlag;\n\nuniform vec2 uTexSize;\nuniform vec4 uBounds;\n\nuniform vec3 uSamples[dNSamples];\n\nuniform mat4 uProjection;\nuniform mat4 uInvProjection;\n\n#ifdef dMultiScale\n    uniform float uLevelRadius[dLevels];\n    uniform float uLevelBias[dLevels];\n    uniform float uNearThreshold;\n    uniform float uFarThreshold;\n#else\n    uniform float uRadius;\n#endif\nuniform float uBias;\n\nfloat smootherstep(float edge0, float edge1, float x) {\n    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);\n    return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\n}\n\nfloat noise(const in vec2 coords) {\n    float a = 12.9898;\n    float b = 78.233;\n    float c = 43758.5453;\n    float dt = dot(coords, vec2(a,b));\n    float sn = mod(dt, PI);\n    return abs(fract(sin(sn) * c)); // is abs necessary?\n}\n\nvec2 getNoiseVec2(const in vec2 coords) {\n    return vec2(noise(coords), noise(coords + vec2(PI, 2.71828)));\n}\n\nbool isBackground(const in float depth) {\n    return depth > 0.999; // handle precision issues with packed depth\n}\n\nfloat getDepth(const in vec2 coords, const in int transparentFlag) {\n    vec2 c = vec2(clamp(coords.x, uBounds.x, uBounds.z), clamp(coords.y, uBounds.y, uBounds.w));\n    if (transparentFlag == 1){\n        #if defined(dIncludeTransparent)\n            return unpackRGBAToDepthWithAlpha(texture2D(tDepthTransparent, c)).x;\n        #else\n            return 1.0;\n        #endif\n    } else {\n        #ifdef depthTextureSupport\n            return texture2D(tDepth, c).r;\n        #else\n            return unpackRGBAToDepth(texture2D(tDepth, c));\n        #endif\n    }\n}\n\n#if defined(dIncludeTransparent)\n    vec2 getDepthTransparentWithAlpha(const in vec2 coords){\n        vec2 c = vec2(clamp(coords.x, uBounds.x, uBounds.z), clamp(coords.y, uBounds.y, uBounds.w));\n        return unpackRGBAToDepthWithAlpha(texture2D(tDepthTransparent, c));\n    }\n#endif\n\n#define dQuarterThreshold 0.1\n#define dHalfThreshold 0.05\n\nfloat getMappedDepth(const in vec2 coords, const in vec2 selfCoords) {\n    vec2 c = vec2(clamp(coords.x, uBounds.x, uBounds.z), clamp(coords.y, uBounds.y, uBounds.w));\n    float d = distance(coords, selfCoords);\n    #ifdef depthTextureSupport\n        if (d > dQuarterThreshold) {\n            return texture2D(tDepthQuarter, c).r;\n        } else if (d > dHalfThreshold) {\n            return texture2D(tDepthHalf, c).r;\n        } else {\n            return texture2D(tDepth, c).r;\n        }\n    #else\n        if (d > dQuarterThreshold) {\n            return unpackRGBAToDepth(texture2D(tDepthQuarter, c));\n        } else if (d > dHalfThreshold) {\n            return unpackRGBAToDepth(texture2D(tDepthHalf, c));\n        } else {\n            return unpackRGBAToDepth(texture2D(tDepth, c));\n        }\n    #endif\n}\n\n#if defined(dIncludeTransparent)\n    vec2 getMappedDepthTransparentWithAlpha(const in vec2 coords, const in vec2 selfCoords) {\n        vec2 c = vec2(clamp(coords.x, uBounds.x, uBounds.z), clamp(coords.y, uBounds.y, uBounds.w));\n        float d = distance(coords, selfCoords);\n        if (d > dQuarterThreshold) {\n            return unpackRGBAToDepthWithAlpha(texture2D(tDepthQuarterTransparent, c));\n        } else if (d > dHalfThreshold) {\n            return unpackRGBAToDepthWithAlpha(texture2D(tDepthHalfTransparent, c));\n        } else {\n            return unpackRGBAToDepthWithAlpha(texture2D(tDepthTransparent, c));\n        }\n    }\n#endif\n\n// adapted from https://gist.github.com/bgolus/a07ed65602c009d5e2f753826e8078a0\nvec3 viewNormalAtPixelPositionAccurate(const in vec2 vpos, const in int transparentFlag) {\n    // current pixel's depth\n    float c = getDepth(vpos, transparentFlag);\n\n    // get current pixel's view space position\n    vec3 viewSpacePos_c = screenSpaceToViewSpace(vec3(vpos, c), uInvProjection);\n\n    // get view space position at 1 pixel offsets in each major direction\n    vec3 viewSpacePos_l = screenSpaceToViewSpace(vec3(vpos + vec2(-1.0, 0.0) / uTexSize, getDepth(vpos + vec2(-1.0, 0.0) / uTexSize, transparentFlag)), uInvProjection);\n    vec3 viewSpacePos_r = screenSpaceToViewSpace(vec3(vpos + vec2( 1.0, 0.0) / uTexSize, getDepth(vpos + vec2( 1.0, 0.0) / uTexSize, transparentFlag)), uInvProjection);\n    vec3 viewSpacePos_d = screenSpaceToViewSpace(vec3(vpos + vec2( 0.0,-1.0) / uTexSize, getDepth(vpos + vec2( 0.0,-1.0) / uTexSize, transparentFlag)), uInvProjection);\n    vec3 viewSpacePos_u = screenSpaceToViewSpace(vec3(vpos + vec2( 0.0, 1.0) / uTexSize, getDepth(vpos + vec2( 0.0, 1.0) / uTexSize, transparentFlag)), uInvProjection);\n\n    // get the difference between the current and each offset position\n    vec3 l = viewSpacePos_c - viewSpacePos_l;\n    vec3 r = viewSpacePos_r - viewSpacePos_c;\n    vec3 d = viewSpacePos_c - viewSpacePos_d;\n    vec3 u = viewSpacePos_u - viewSpacePos_c;\n\n    // get depth values at 1 & 2 pixels offsets from current along the horizontal axis\n    vec4 H = vec4(\n        getDepth(vpos + vec2(-1.0, 0.0) / uTexSize, transparentFlag),\n        getDepth(vpos + vec2( 1.0, 0.0) / uTexSize, transparentFlag),\n        getDepth(vpos + vec2(-2.0, 0.0) / uTexSize, transparentFlag),\n        getDepth(vpos + vec2( 2.0, 0.0) / uTexSize, transparentFlag)\n    );\n\n    // get depth values at 1 & 2 pixels offsets from current along the vertical axis\n    vec4 V = vec4(\n        getDepth(vpos + vec2(0.0,-1.0) / uTexSize, transparentFlag),\n        getDepth(vpos + vec2(0.0, 1.0) / uTexSize, transparentFlag),\n        getDepth(vpos + vec2(0.0,-2.0) / uTexSize, transparentFlag),\n        getDepth(vpos + vec2(0.0, 2.0) / uTexSize, transparentFlag)\n    );\n\n    // current pixel's depth difference from slope of offset depth samples\n    // differs from original article because we're using non-linear depth values\n    // see article's comments\n    vec2 he = abs((2.0 * H.xy - H.zw) - c);\n    vec2 ve = abs((2.0 * V.xy - V.zw) - c);\n\n    // pick horizontal and vertical diff with the smallest depth difference from slopes\n    vec3 hDeriv = he.x < he.y ? l : r;\n    vec3 vDeriv = ve.x < ve.y ? d : u;\n\n    // get view space normal from the cross product of the best derivatives\n    vec3 viewNormal = normalize(cross(hDeriv, vDeriv));\n\n    return viewNormal;\n}\n\nfloat getPixelSize(const in vec2 coords, const in float depth) {\n    vec3 viewPos0 = screenSpaceToViewSpace(vec3(coords, depth), uInvProjection);\n    vec3 viewPos1 = screenSpaceToViewSpace(vec3(coords + vec2(1.0, 0.0) / uTexSize, depth), uInvProjection);\n    return distance(viewPos0, viewPos1);\n}\n\n// StarCraft II Ambient Occlusion by [Filion and McNaughton 2008]\nvoid main(void) {\n    vec2 invTexSize = 1.0 / uTexSize;\n    vec2 selfCoords = gl_FragCoord.xy * invTexSize;\n    float selfDepth = getDepth(selfCoords, uTransparencyFlag);\n    vec2 selfPackedDepth = packUnitIntervalToRG(selfDepth);\n\n    if (isBackground(selfDepth)) {\n        gl_FragColor = vec4(packUnitIntervalToRG(1.0), selfPackedDepth);\n        return;\n    }\n\n    vec3 selfViewNormal = viewNormalAtPixelPositionAccurate(selfCoords, uTransparencyFlag);\n    vec3 selfViewPos = screenSpaceToViewSpace(vec3(selfCoords, selfDepth), uInvProjection);\n\n    vec3 randomVec = normalize(vec3(getNoiseVec2(selfCoords) * 2.0 - 1.0, 0.0));\n    vec3 tangent = normalize(randomVec - selfViewNormal * dot(randomVec, selfViewNormal));\n    vec3 bitangent = cross(selfViewNormal, tangent);\n    mat3 TBN = mat3(tangent, bitangent, selfViewNormal);\n\n    float occlusion = 0.0;\n    #ifdef dMultiScale\n        float pixelSize = getPixelSize(selfCoords, selfDepth);\n\n        for(int l = 0; l < dLevels; l++) {\n            // TODO: smooth transition\n            if (pixelSize * uNearThreshold > uLevelRadius[l]) continue;\n            if (pixelSize * uFarThreshold < uLevelRadius[l]) continue;\n\n            float levelOcclusion = 0.0;\n            for(int i = 0; i < dNSamples; i++) {\n                // get sample position:\n                vec3 sampleViewPos = TBN * uSamples[i];\n                sampleViewPos = selfViewPos + sampleViewPos * uLevelRadius[l];\n\n                // project sample position:\n                vec4 offset = vec4(sampleViewPos, 1.0);\n                offset = uProjection * offset;\n                offset.xyz = (offset.xyz / offset.w) * 0.5 + 0.5;\n\n                // get sample depth:\n                float sampleOcc = 0.0;\n                #ifdef dIllumination\n                    if (uTransparencyFlag == 1) {\n                #endif\n                    float sampleDepth = getMappedDepth(offset.xy, selfCoords);\n                    float sampleViewZ = screenSpaceToViewSpace(vec3(offset.xy, sampleDepth), uInvProjection).z;\n\n                    sampleOcc = step(sampleViewPos.z + 0.025, sampleViewZ) * smootherstep(0.0, 1.0, uLevelRadius[l] / abs(selfViewPos.z - sampleViewZ)) * uLevelBias[l];\n                #ifdef dIllumination\n                    }\n                #endif\n                #if defined(dIncludeTransparent)\n                    vec2 sampleDepthWithAlpha = getMappedDepthTransparentWithAlpha(offset.xy, selfCoords);\n                    if (!isBackground(sampleDepthWithAlpha.x)) {\n                        float sampleViewZ = screenSpaceToViewSpace(vec3(offset.xy, sampleDepthWithAlpha.x), uInvProjection).z;\n                        sampleOcc = max(sampleOcc, step(sampleViewPos.z + 0.025, sampleViewZ) * smootherstep(0.0, 1.0, uLevelRadius[l] / abs(selfViewPos.z - sampleViewZ)) * uLevelBias[l] * sampleDepthWithAlpha.y);\n                    }\n                #endif\n\n                levelOcclusion += sampleOcc;\n            }\n            occlusion = max(occlusion, levelOcclusion);\n        }\n    #else\n        for(int i = 0; i < dNSamples; i++) {\n            vec3 sampleViewPos = TBN * uSamples[i];\n            sampleViewPos = selfViewPos + sampleViewPos * uRadius;\n\n            vec4 offset = vec4(sampleViewPos, 1.0);\n            offset = uProjection * offset;\n            offset.xyz = (offset.xyz / offset.w) * 0.5 + 0.5;\n\n            float sampleOcc = 0.0;\n            #ifdef dIllumination\n                if (uTransparencyFlag == 1) {\n            #endif\n                    // NOTE: using getMappedDepth here causes issues on some mobile devices\n                    float sampleDepth = getDepth(offset.xy, 0);\n                    float sampleViewZ = screenSpaceToViewSpace(vec3(offset.xy, sampleDepth), uInvProjection).z;\n\n                    sampleOcc = step(sampleViewPos.z + 0.025, sampleViewZ) * smootherstep(0.0, 1.0, uRadius / abs(selfViewPos.z - sampleViewZ));\n            #ifdef dIllumination\n                }\n            #endif\n            #if defined(dIncludeTransparent)\n                vec2 sampleDepthWithAlpha = getDepthTransparentWithAlpha(offset.xy);\n                if (!isBackground(sampleDepthWithAlpha.x)) {\n                    float sampleViewZ = screenSpaceToViewSpace(vec3(offset.xy, sampleDepthWithAlpha.x), uInvProjection).z;\n                    sampleOcc = max(sampleOcc, step(sampleViewPos.z + 0.025, sampleViewZ) * smootherstep(0.0, 1.0, uRadius / abs(selfViewPos.z - sampleViewZ)) * sampleDepthWithAlpha.y);\n                }\n            #endif\n\n            occlusion += sampleOcc;\n        }\n    #endif\n    occlusion = 1.0 - (uBias * occlusion / float(dNSamples));\n\n    vec2 packedOcclusion = packUnitIntervalToRG(clamp(occlusion, 0.01, 1.0));\n\n    gl_FragColor = vec4(packedOcclusion, selfPackedDepth);\n}\n";
