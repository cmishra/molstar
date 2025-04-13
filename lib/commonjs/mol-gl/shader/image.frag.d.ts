/**
 * Copyright (c) 2020-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const image_frag = "\nprecision highp float;\nprecision highp int;\n\n#include common\n#include read_from_texture\n#include common_frag_params\n#include common_clip\n\nuniform float uEmissive;\n\n// Density value to estimate object thickness\nuniform float uDensity;\n\n#if defined(dRenderVariant_color) || defined(dRenderVariant_tracing)\n    #ifdef dOverpaint\n        #if defined(dOverpaintType_instance) || defined(dOverpaintType_groupInstance)\n            varying vec4 vOverpaint;\n            uniform vec2 uOverpaintTexDim;\n            uniform sampler2D tOverpaint;\n        #endif\n        uniform float uOverpaintStrength;\n    #endif\n#endif\n\n#if defined(dRenderVariant_color) || defined(dRenderVariant_tracing) || defined(dRenderVariant_emissive)\n    #ifdef dEmissive\n        #if defined(dEmissiveType_instance) || defined(dEmissiveType_groupInstance)\n            varying float vEmissive;\n            uniform vec2 uEmissiveTexDim;\n            uniform sampler2D tEmissive;\n        #endif\n        uniform float uEmissiveStrength;\n    #endif\n#endif\n\n#ifdef dTransparency\n    #if defined(dTransparencyType_instance) || defined(dTransparencyType_groupInstance)\n        varying float vTransparency;\n        uniform vec2 uTransparencyTexDim;\n        uniform sampler2D tTransparency;\n    #endif\n    uniform float uTransparencyStrength;\n#endif\n\nuniform vec2 uImageTexDim;\nuniform sampler2D tImageTex;\nuniform sampler2D tGroupTex;\nuniform sampler2D tValueTex;\n\nuniform vec2 uMarkerTexDim;\nuniform sampler2D tMarker;\n\nvarying vec2 vUv;\nvarying float vInstance;\n\n#ifdef dUsePalette\n    uniform sampler2D tPalette;\n    uniform vec3 uPaletteDefault;\n#endif\n\nuniform int uTrimType;\nuniform vec3 uTrimCenter;\nuniform vec4 uTrimRotation;\nuniform vec3 uTrimScale;\nuniform mat4 uTrimTransform;\n\nuniform float uIsoLevel;\n\n#if defined(dInterpolation_catmulrom) || defined(dInterpolation_mitchell) || defined(dInterpolation_bspline)\n    #define dInterpolation_cubic\n#endif\n\n#if defined(dInterpolation_cubic)\n    #if defined(dInterpolation_catmulrom) || defined(dInterpolation_mitchell)\n        #if defined(dInterpolation_catmulrom)\n            const float B = 0.0;\n            const float C = 0.5;\n        #elif defined(dInterpolation_mitchell)\n            const float B = 0.333;\n            const float C = 0.333;\n        #endif\n\n        float cubicFilter(float x){\n            float f = x;\n            if (f < 0.0) {\n                f = -f;\n            }\n            if (f < 1.0) {\n                return ((12.0 - 9.0 * B - 6.0 * C) * (f * f * f) +\n                    (-18.0 + 12.0 * B + 6.0 * C) * (f * f) +\n                    (6.0 - 2.0 * B)) / 6.0;\n            }else if (f >= 1.0 && f < 2.0){\n                return ((-B - 6.0 * C) * ( f * f * f)\n                    + (6.0 * B + 30.0 * C) * (f * f) +\n                    (-(12.0 * B) - 48.0 * C) * f +\n                    8.0 * B + 24.0 * C) / 6.0;\n            }else{\n                return 0.0;\n            }\n        }\n    #elif defined(dInterpolation_bspline)\n        float cubicFilter(float x) {\n            float f = x;\n            if (f < 0.0) {\n                f = -f;\n            }\n            if (f >= 0.0 && f <= 1.0){\n                return (2.0 / 3.0) + (0.5) * (f * f * f) - (f * f);\n            } else if (f > 1.0 && f <= 2.0) {\n                return 1.0 / 6.0 * pow((2.0 - f), 3.0);\n            }\n            return 1.0;\n        }\n    #endif\n\n    vec4 biCubic(sampler2D tex, vec2 texCoord) {\n        vec2 texelSize = 1.0 / uImageTexDim;\n        texCoord -= texelSize / 2.0;\n        vec4 nSum = vec4(0.0);\n        float nDenom = 0.0;\n        vec2 cell = fract(texCoord * uImageTexDim);\n        for (float m = -1.0; m <= 2.0; ++m) {\n            for (float n = -1.0; n <= 2.0; ++n) {\n                vec4 vecData = texture2D(tex, texCoord + texelSize * vec2(m, n));\n                float c = abs(cubicFilter(m - cell.x) * cubicFilter(-n + cell.y));\n                nSum += vecData * c;\n                nDenom += c;\n            }\n        }\n        return nSum / nDenom;\n    }\n#endif\n\nvoid main() {\n    if (uTrimType != 0 && getSignedDistance(vModelPosition, uTrimType, uTrimCenter, uTrimRotation, uTrimScale, uTrimTransform) > 0.0) discard;\n\n    #include fade_lod\n    #include clip_pixel\n\n    #if defined(dInterpolation_cubic)\n        #ifdef dUsePalette\n            vec4 material = texture2D(tImageTex, vUv);\n            if (material.rgb != vec3(1.0)) {\n                material = biCubic(tImageTex, vUv);\n            }\n        #else\n            vec4 material = biCubic(tImageTex, vUv);\n        #endif\n    #else\n        vec4 material = texture2D(tImageTex, vUv);\n    #endif\n\n    if (uIsoLevel >= 0.0) {\n        if (texture2D(tValueTex, vUv).r < uIsoLevel) discard;\n\n        material.a = uAlpha;\n    } else {\n        if (material.a == 0.0) discard;\n\n        material.a *= uAlpha;\n    }\n\n    float fragmentDepth = gl_FragCoord.z;\n\n    vec3 packedGroup = texture2D(tGroupTex, vUv).rgb;\n    float group = packedGroup == vec3(0.0) ? -1.0 : unpackRGBToInt(packedGroup);\n\n    // apply per-group transparency\n    #if defined(dTransparency) && (defined(dRenderVariant_pick) || defined(dRenderVariant_color) || defined(dRenderVariant_emissive) || defined(dRenderVariant_tracing))\n        float transparency = 0.0;\n        #if defined(dTransparencyType_instance)\n            transparency = readFromTexture(tTransparency, vInstance, uTransparencyTexDim).a;\n        #elif defined(dTransparencyType_groupInstance)\n            transparency = readFromTexture(tTransparency, vInstance * float(uGroupCount) + group, uTransparencyTexDim).a;\n        #endif\n        transparency *= uTransparencyStrength;\n\n        float ta = 1.0 - transparency;\n        if (transparency < 0.09) ta = 1.0; // hard cutoff looks better\n\n        #if defined(dRenderVariant_pick)\n            if (ta * uAlpha < uPickingAlphaThreshold)\n                discard; // ignore so the element below can be picked\n        #elif defined(dRenderVariant_emissive)\n            if (ta < 1.0)\n                discard; // emissive not supported with transparency\n        #elif defined(dRenderVariant_color) || defined(dRenderVariant_tracing)\n            material.a *= ta;\n        #endif\n    #endif\n\n    if ((uRenderMask == MaskOpaque && material.a < 1.0) ||\n        (uRenderMask == MaskTransparent && material.a == 1.0)\n    ) {\n        discard;\n    }\n\n    #if defined(dNeedsMarker)\n        float marker = uMarker;\n        if (group == -1.0) {\n            marker = 0.0;\n        } else if (uMarker == -1.0) {\n            marker = readFromTexture(tMarker, vInstance * float(uGroupCount) + group, uMarkerTexDim).a;\n            marker = floor(marker * 255.0 + 0.5); // rounding required to work on some cards on win\n        }\n    #endif\n\n    #if defined(dRenderVariant_color) || defined(dRenderVariant_tracing) || defined(dRenderVariant_emissive)\n        float emissive = uEmissive;\n        if (group == -1.0) {\n            emissive = 0.0;\n        } else {\n            #ifdef dEmissive\n                #if defined(dEmissiveType_instance)\n                    emissive += readFromTexture(tEmissive, vInstance, uEmissiveTexDim).a * uEmissiveStrength;\n                #elif defined(dEmissiveType_groupInstance)\n                    emissive += readFromTexture(tEmissive, vInstance * float(uGroupCount) + group, uEmissiveTexDim).a * uEmissiveStrength;\n                #endif\n            #endif\n        }\n    #endif\n\n    #if defined(dRenderVariant_pick)\n        if (group == -1.0) discard;\n\n        #include check_picking_alpha\n        #ifdef requiredDrawBuffers\n            gl_FragColor = vec4(packIntToRGB(float(uObjectId)), 1.0);\n            gl_FragData[1] = vec4(packIntToRGB(vInstance), 1.0);\n            gl_FragData[2] = vec4(packIntToRGB(group), 1.0);\n            gl_FragData[3] = packDepthToRGBA(fragmentDepth);\n        #else\n            gl_FragColor = vColor;\n            if (uPickType == 1) {\n                gl_FragColor = vec4(packIntToRGB(float(uObjectId)), 1.0);\n            } else if (uPickType == 2) {\n                gl_FragColor = vec4(packIntToRGB(vInstance), 1.0);\n            } else {\n                gl_FragColor = vec4(packIntToRGB(group), 1.0);\n            }\n        #endif\n    #elif defined(dRenderVariant_depth)\n        if (uRenderMask == MaskOpaque) {\n            gl_FragColor = packDepthToRGBA(fragmentDepth);\n        } else if (uRenderMask == MaskTransparent) {\n            gl_FragColor = packDepthWithAlphaToRGBA(fragmentDepth, material.a);\n        }\n    #elif defined(dRenderVariant_marking)\n        if (uMarkingType == 1) {\n            if (marker > 0.0)\n                discard;\n            gl_FragColor = packDepthToRGBA(fragmentDepth);\n        } else {\n            if (marker == 0.0)\n                discard;\n            float depthTest = 1.0;\n            if (uMarkingDepthTest) {\n                depthTest = (fragmentDepth >= getDepthPacked(gl_FragCoord.xy / uDrawingBufferSize)) ? 1.0 : 0.0;\n            }\n            bool isHighlight = intMod(marker, 2.0) > 0.1;\n            float viewZ = depthToViewZ(uIsOrtho, fragmentDepth, uNear, uFar);\n            float fogFactor = smoothstep(uFogNear, uFogFar, abs(viewZ));\n            if (fogFactor == 1.0)\n                discard;\n            gl_FragColor = vec4(0.0, depthTest, isHighlight ? 1.0 : 0.0, 1.0 - fogFactor);\n        }\n    #elif defined(dRenderVariant_emissive)\n        gl_FragColor = vec4(emissive);\n    #elif defined(dRenderVariant_color) || defined(dRenderVariant_tracing)\n        #ifdef dUsePalette\n            if (material.rgb == vec3(1.0)) {\n                material.rgb = uPaletteDefault;\n            } else {\n                float v = ((material.r * 256.0 * 256.0 * 255.0 + material.g * 256.0 * 255.0 + material.b * 255.0) - 1.0) / PALETTE_SCALE;\n                material.rgb = texture2D(tPalette, vec2(v, 0.0)).rgb;\n            }\n        #endif\n\n        // mix material with overpaint\n        #if defined(dOverpaint)\n            vec4 overpaint = vec4(0.0);\n            if (group != -1.0) {\n                #if defined(dOverpaintType_instance)\n                    overpaint = readFromTexture(tOverpaint, vInstance, uOverpaintTexDim);\n                #elif defined(dOverpaintType_groupInstance)\n                    overpaint = readFromTexture(tOverpaint, vInstance * float(uGroupCount) + group, uOverpaintTexDim);\n                #endif\n                overpaint *= uOverpaintStrength;\n            }\n            material.rgb = mix(material.rgb, overpaint.rgb, overpaint.a);\n        #endif\n\n        gl_FragColor = material;\n        #include apply_marker_color\n\n        #if defined(dRenderVariant_color)\n            #include apply_fog\n            #include wboit_write\n            #include dpoit_write\n        #elif defined(dRenderVariant_tracing)\n            gl_FragData[1] = vec4(normalize(vViewPosition), emissive);\n            gl_FragData[2] = vec4(material.rgb, uDensity);\n        #endif\n    #endif\n}\n";
