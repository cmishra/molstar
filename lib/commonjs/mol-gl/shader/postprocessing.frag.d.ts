/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Áron Samuel Kovács <aron.kovacs@mail.muni.cz>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
export declare const postprocessing_frag = "\nprecision highp float;\nprecision highp int;\nprecision highp sampler2D;\n\nuniform sampler2D tSsaoDepth;\nuniform sampler2D tSsaoDepthTransparent;\nuniform sampler2D tColor;\nuniform sampler2D tTransparentColor;\nuniform sampler2D tDepthOpaque;\nuniform sampler2D tDepthTransparent;\nuniform sampler2D tShadows;\nuniform sampler2D tOutlines;\nuniform vec2 uTexSize;\n\nuniform float uNear;\nuniform float uFar;\nuniform float uFogNear;\nuniform float uFogFar;\nuniform vec3 uFogColor;\nuniform vec3 uOutlineColor;\nuniform vec3 uOcclusionColor;\nuniform bool uTransparentBackground;\nuniform vec2 uOcclusionOffset;\n\n#include common\n\nfloat getViewZ(const in float depth) {\n    #if dOrthographic == 1\n        return orthographicDepthToViewZ(depth, uNear, uFar);\n    #else\n        return perspectiveDepthToViewZ(depth, uNear, uFar);\n    #endif\n}\n\nfloat getDepthOpaque(const in vec2 coords) {\n    #ifdef depthTextureSupport\n        return texture2D(tDepthOpaque, coords).r;\n    #else\n        return unpackRGBAToDepth(texture2D(tDepthOpaque, coords));\n    #endif\n}\n\nfloat getDepthTransparent(const in vec2 coords) {\n    return unpackRGBAToDepthWithAlpha(texture2D(tDepthTransparent, coords)).x;\n}\n\nbool isBackground(const in float depth) {\n    return depth > 0.999; // handle depth packing precision issues\n}\n\nint squaredOutlineScale = dOutlineScale * dOutlineScale;\nfloat getOutline(const in vec2 coords, const in float opaqueDepth, const in float transparentDepth, out float closestTexel, out float isTransparent) {\n    vec2 invTexSize = 1.0 / uTexSize;\n\n    float outline = 1.0;\n    closestTexel = 1.0;\n    isTransparent = 0.0;\n    for (int y = -dOutlineScale; y <= dOutlineScale; y++) {\n        for (int x = -dOutlineScale; x <= dOutlineScale; x++) {\n            if (x * x + y * y > squaredOutlineScale) {\n                continue;\n            }\n\n            vec2 sampleCoords = coords + vec2(float(x), float(y)) * invTexSize;\n\n            vec4 sampleOutlineCombined = texture2D(tOutlines, sampleCoords);\n            float sampleOutline = sampleOutlineCombined.r;\n            float sampleOutlineDepth = unpackRGToUnitInterval(sampleOutlineCombined.gb);\n\n            if (sampleOutline == 0.0 && sampleOutlineDepth < closestTexel) {\n                outline = 0.0;\n                closestTexel = sampleOutlineDepth;\n                isTransparent = sampleOutlineCombined.a;\n            }\n        }\n    }\n    return isTransparent == 0.0 ? outline : (closestTexel > opaqueDepth && closestTexel < transparentDepth) ? 1.0 : outline;\n}\n\nfloat getSsao(vec2 coords) {\n    float rawSsao = unpackRGToUnitInterval(texture2D(tSsaoDepth, coords).xy);\n    if (rawSsao > 0.999) {\n        return 1.0;\n    } else if (rawSsao > 0.001) {\n        return rawSsao;\n    }\n    // treat values close to 0.0 as errors and return no occlusion\n    return 1.0;\n}\n\nfloat getSsaoTransparent(vec2 coords) {\n    float rawSsao = unpackRGToUnitInterval(texture2D(tSsaoDepthTransparent, coords).xy);\n    if (rawSsao > 0.999) {\n        return 1.0;\n    } else if (rawSsao > 0.001) {\n        return rawSsao;\n    }\n    // treat values close to 0.0 as errors and return no occlusion\n    return 1.0;\n}\n\nvoid main(void) {\n    vec2 coords = gl_FragCoord.xy / uTexSize;\n    vec4 color = texture2D(tColor, coords);\n\n    float opaqueDepth = getDepthOpaque(coords);\n    float transparentDepth = 1.0;\n    #ifdef dBlendTransparency\n        bool blendTransparency = true;\n        vec4 transparentColor = texture2D(tTransparentColor, coords);\n\n        #if defined(dOutlineEnable) || defined(dOcclusionEnable) && defined(dOcclusionIncludeTransparency)\n            transparentDepth = getDepthTransparent(coords);\n        #endif\n    #endif\n\n    #if defined(dOcclusionEnable) || defined(dShadowEnable)\n        bool isOpaqueBackground = isBackground(opaqueDepth);\n        float viewDist = abs(getViewZ(opaqueDepth));\n        float fogFactor = smoothstep(uFogNear, uFogFar, viewDist);\n    #endif\n\n    #if defined(dOcclusionEnable)\n        if (!isOpaqueBackground) {\n            float occlusionFactor = getSsao(coords + uOcclusionOffset);\n\n            if (!uTransparentBackground) {\n                color.rgb = mix(mix(uOcclusionColor, uFogColor, fogFactor), color.rgb, occlusionFactor);\n            } else {\n                color.rgb = mix(uOcclusionColor * (1.0 - fogFactor), color.rgb, occlusionFactor);\n            }\n        }\n        #if defined(dBlendTransparency) && defined(dOcclusionIncludeTransparency)\n            if (!isBackground(transparentDepth)) {\n                float viewDist = abs(getViewZ(transparentDepth));\n                float fogFactor = smoothstep(uFogNear, uFogFar, viewDist);\n                float occlusionFactor = getSsaoTransparent(coords + uOcclusionOffset);\n                transparentColor.rgb = mix(uOcclusionColor * (1.0 - fogFactor), transparentColor.rgb, occlusionFactor);\n            }\n        #endif\n    #endif\n\n    #ifdef dShadowEnable\n        if (!isOpaqueBackground) {\n            vec4 shadow = texture2D(tShadows, coords);\n            if (!uTransparentBackground) {\n                color.rgb = mix(mix(vec3(0), uFogColor, fogFactor), color.rgb, shadow.a);\n            } else {\n                color.rgb = mix(vec3(0) * (1.0 - fogFactor), color.rgb, shadow.a);\n            }\n        }\n    #endif\n\n    // outline needs to be handled after occlusion and shadow to keep them clean\n    #ifdef dOutlineEnable\n        float closestTexel;\n        float isTransparentOutline;\n        float outline = getOutline(coords, opaqueDepth, transparentDepth, closestTexel, isTransparentOutline);\n        if (outline == 0.0) {\n            float viewDist = abs(getViewZ(closestTexel));\n            float fogFactor = smoothstep(uFogNear, uFogFar, viewDist);\n            if (!uTransparentBackground) {\n                    color.rgb = mix(uOutlineColor, uFogColor, fogFactor);\n            } else {\n                color.a = 1.0 - fogFactor;\n                color.rgb = mix(uOutlineColor, vec3(0.0), fogFactor);\n            }\n            #ifdef dBlendTransparency\n                if (isTransparentOutline == 1.0 || transparentDepth > closestTexel) {\n                    blendTransparency = false;\n                }\n            #endif\n        }\n    #endif\n\n    #ifdef dBlendTransparency\n        if (blendTransparency) {\n            float alpha = transparentColor.a;\n            if (alpha != 0.0) {\n                // blending\n                color = transparentColor + color * (1.0 - alpha);\n            }\n        }\n    #endif\n\n    gl_FragColor = color;\n}\n";
