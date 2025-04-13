export declare const clip_instance = "\n#if defined(dClipVariant_instance) && dClipObjectCount != 0\n    vec3 mCenter = (uModel * aTransform * vec4(uInvariantBoundingSphere.xyz, 1.0)).xyz;\n    if (clipTest(mCenter)) {\n        // move out of [ -w, +w ] to 'discard' in vert shader\n        gl_Position.z = 2.0 * gl_Position.w;\n    }\n#endif\n";
