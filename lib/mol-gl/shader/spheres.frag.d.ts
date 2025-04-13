/**
 * Copyright (c) 2019-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const spheres_frag = "\nprecision highp float;\nprecision highp int;\n\n#define bumpEnabled\n\n#include common\n#include common_frag_params\n#include color_frag_params\n#include light_frag_params\n#include common_clip\n\nuniform mat4 uInvView;\nuniform float uAlphaThickness;\n\nvarying float vRadius;\nvarying vec3 vPoint;\nvarying vec3 vPointViewPosition;\n\n#ifdef dSolidInterior\n    const bool solidInterior = true;\n#else\n    const bool solidInterior = false;\n#endif\n\nbool SphereImpostor(out vec3 modelPos, out vec3 cameraPos, out vec3 cameraNormal, out bool interior, out float fragmentDepth){\n    vec3 cameraSpherePos = -vPointViewPosition;\n\n    vec3 rayOrigin = mix(vec3(0.0, 0.0, 0.0), vPoint, uIsOrtho);\n    vec3 rayDirection = mix(normalize(vPoint), vec3(0.0, 0.0, 1.0), uIsOrtho);\n    vec3 cameraSphereDir = mix(cameraSpherePos, rayOrigin - cameraSpherePos, uIsOrtho);\n\n    float B = dot(rayDirection, cameraSphereDir);\n    float det = B * B + vRadius * vRadius - dot(cameraSphereDir, cameraSphereDir);\n\n    if (det < 0.0) return false;\n\n    float sqrtDet = sqrt(det);\n    float posT = mix(B + sqrtDet, B - sqrtDet, uIsOrtho);\n    float negT = mix(B - sqrtDet, B + sqrtDet, uIsOrtho);\n\n    cameraPos = rayDirection * negT + rayOrigin;\n    modelPos = (uInvView * vec4(cameraPos, 1.0)).xyz;\n    fragmentDepth = calcDepth(cameraPos);\n\n    bool objectClipped = false;\n\n    #if !defined(dClipPrimitive) && defined(dClipVariant_pixel) && dClipObjectCount != 0\n        if (clipTest(modelPos)) {\n            objectClipped = true;\n            fragmentDepth = -1.0;\n        }\n    #endif\n\n    if (fragmentDepth > 0.0) {\n        cameraNormal = normalize(cameraPos - cameraSpherePos);\n        interior = false;\n        return true;\n    } else if (uDoubleSided || solidInterior) {\n        cameraPos = rayDirection * posT + rayOrigin;\n        modelPos = (uInvView * vec4(cameraPos, 1.0)).xyz;\n        fragmentDepth = calcDepth(cameraPos);\n        cameraNormal = -normalize(cameraPos - cameraSpherePos);\n        interior = true;\n        if (fragmentDepth > 0.0) {\n            #ifdef dSolidInterior\n                if (!objectClipped) {\n                    fragmentDepth = 0.0 + (0.0000001 / vRadius);\n                    cameraNormal = -mix(normalize(vPoint), vec3(0.0, 0.0, -1.0), uIsOrtho);\n                }\n            #endif\n            return true;\n        }\n    }\n\n    return false;\n}\n\nvoid main(void){\n    vec3 cameraNormal;\n    float fragmentDepth;\n\n    #ifdef dApproximate\n        vec3 pointDir = -vPointViewPosition - vPoint;\n        if (dot(pointDir, pointDir) > vRadius * vRadius) discard;\n        vec3 vViewPosition = -vPointViewPosition;\n        fragmentDepth = gl_FragCoord.z;\n        #if !defined(dIgnoreLight) || defined(dXrayShaded) || defined(dRenderVariant_tracing)\n            pointDir.z -= cos(length(pointDir));\n            cameraNormal = -normalize(pointDir);\n        #endif\n        interior = false;\n    #else\n        vec3 modelPos;\n        vec3 cameraPos;\n        bool hit = SphereImpostor(modelPos, cameraPos, cameraNormal, interior, fragmentDepth);\n        if (!hit) discard;\n\n        if (fragmentDepth < 0.0) discard;\n        if (fragmentDepth > 1.0) discard;\n\n        gl_FragDepthEXT = fragmentDepth;\n\n        vec3 vModelPosition = modelPos;\n        vec3 vViewPosition = cameraPos;\n    #endif\n\n    #include fade_lod\n    #if !defined(dClipPrimitive) && defined(dClipVariant_pixel) && dClipObjectCount != 0\n        #include clip_pixel\n    #endif\n\n    #ifdef dNeedsNormal\n        vec3 normal = -cameraNormal;\n    #endif\n\n    #include assign_material_color\n\n    #if defined(dRenderVariant_color) || defined(dRenderVariant_tracing)\n        if (uRenderMask == MaskTransparent && uAlphaThickness > 0.0) {\n            material.a *= min(1.0, vRadius / uAlphaThickness);\n        }\n    #endif\n\n    #include check_transparency\n\n    #if defined(dRenderVariant_pick)\n        #include check_picking_alpha\n        #ifdef requiredDrawBuffers\n            gl_FragColor = vObject;\n            gl_FragData[1] = vInstance;\n            gl_FragData[2] = vGroup;\n            gl_FragData[3] = packDepthToRGBA(fragmentDepth);\n        #else\n            gl_FragColor = vColor;\n        #endif\n    #elif defined(dRenderVariant_depth)\n        gl_FragColor = material;\n    #elif defined(dRenderVariant_marking)\n        gl_FragColor = material;\n    #elif defined(dRenderVariant_emissive)\n        gl_FragColor = material;\n    #elif defined(dRenderVariant_color) || defined(dRenderVariant_tracing)\n        #include apply_light_color\n        #include apply_interior_color\n        #include apply_marker_color\n\n        #if defined(dRenderVariant_color)\n            #include apply_fog\n            #include wboit_write\n            #include dpoit_write\n        #elif defined(dRenderVariant_tracing)\n            gl_FragData[1] = vec4(normal, emissive);\n            gl_FragData[2] = vec4(material.rgb, uDensity);\n        #endif\n    #endif\n}\n";
