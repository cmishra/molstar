export declare const cas_frag = "\nprecision mediump float;\nprecision mediump sampler2D;\n\nuniform sampler2D tColor;\nuniform vec2 uTexSizeInv;\n\nuniform float uSharpness;\n\n// adapted from https://www.shadertoy.com/view/stXSWB\n\n/*\n* FidelityFX Super Resolution scales up a low resolution\n* image, while adding fine detail.\n*\n* MIT Open License\n*\n* https://gpuopen.com/fsr\n*\n* Left: FSR processed\n* Right: Original texture, bilinear interpolation\n*\n* Mouse at top: Sharpness 0 stops (maximum)\n* Mouse at bottom: Sharpness 2 stops (minimum)\n*\n* It works in two passes-\n*   EASU upsamples the image with a clamped Lanczos kernel.\n*   RCAS sharpens the image at the target resolution.\n*\n* I needed to make a few changes to improve readability and\n* WebGL compatibility in an algorithm I don't fully understand.\n* Expect bugs.\n*\n* Shader not currently running for WebGL1 targets (eg. mobile Safari)\n*\n* There is kind of no point to using FSR in Shadertoy, as it renders buffers\n* at full target resolution. But this might be useful for WebGL based demos\n* running smaller-than-target render buffers.\n*\n* For sharpening with a full resolution render buffer,\n* FidelityFX CAS is a better option.\n* https://www.shadertoy.com/view/ftsXzM\n*\n* For readability and compatibility, these optimisations have been removed:\n*   * Fast approximate inverse and inversesqrt\n*   * textureGather fetches (not WebGL compatible)\n*   * Multiplying by reciprocal instead of division\n*\n* Apologies to AMD for the numerous slowdowns and errors I have introduced.\n*\n*/\n\n/***** RCAS *****/\n#define FSR_RCAS_LIMIT (0.25-(1.0/16.0))\n\n// Input callback prototypes that need to be implemented by calling shader\nvec4 FsrRcasLoadF(vec2 p);\n//------------------------------------------------------------------------------------------------------------------------------\nvoid FsrRcasCon(\n    out float con,\n    // The scale is {0.0 := maximum, to N>0, where N is the number of stops (halving) of the reduction of sharpness}.\n    float sharpness\n) {\n    // Transform from stops to linear value.\n    con = exp2(-sharpness);\n}\n\nvec3 FsrRcasF(\n    vec2 ip, // Integer pixel position in output.\n    float con\n) {\n    // Constant generated by RcasSetup().\n    // Algorithm uses minimal 3x3 pixel neighborhood.\n    //    b\n    //  d e f\n    //    h\n    vec2 sp = vec2(ip);\n    vec3 b = FsrRcasLoadF(sp + vec2( 0,-1)).rgb;\n    vec3 d = FsrRcasLoadF(sp + vec2(-1, 0)).rgb;\n    vec3 e = FsrRcasLoadF(sp).rgb;\n    vec3 f = FsrRcasLoadF(sp + vec2( 1, 0)).rgb;\n    vec3 h = FsrRcasLoadF(sp + vec2( 0, 1)).rgb;\n\n    // Luma times 2.\n    float bL = b.g + .5 * (b.b + b.r);\n    float dL = d.g + .5 * (d.b + d.r);\n    float eL = e.g + .5 * (e.b + e.r);\n    float fL = f.g + .5 * (f.b + f.r);\n    float hL = h.g + .5 * (h.b + h.r);\n\n    // Noise detection.\n    #ifdef dDenoise\n        float nz = .25 * (bL + dL + fL + hL) - eL;\n        nz=clamp(\n            abs(nz)\n            /(\n                max(max(bL,dL),max(eL,max(fL,hL)))\n                -min(min(bL,dL),min(eL,min(fL,hL)))\n            ),\n            0., 1.\n        );\n        nz=1.-.5*nz;\n    #endif\n\n    // Min and max of ring.\n    vec3 mn4 = min(b, min(f, h));\n    vec3 mx4 = max(b, max(f, h));\n\n    // Immediate constants for peak range.\n    vec2 peakC = vec2(1., -4.);\n\n    // Limiters, these need to be high precision RCPs.\n    vec3 hitMin = mn4 / (4. * mx4);\n    vec3 hitMax = (peakC.x - mx4) / (4.* mn4 + peakC.y);\n    vec3 lobeRGB = max(-hitMin, hitMax);\n    float lobe = max(\n        -FSR_RCAS_LIMIT,\n        min(max(lobeRGB.r, max(lobeRGB.g, lobeRGB.b)), 0.)\n    )*con;\n\n    // Apply noise removal.\n    #ifdef dDenoise\n        lobe *= nz;\n    #endif\n\n    // Resolve, which needs the medium precision rcp approximation to avoid visible tonality changes.\n    return (lobe * (b + d + h + f) + e) / (4. * lobe + 1.);\n}\n\n\nvec4 FsrRcasLoadF(vec2 p) {\n    return texture2D(tColor, p * uTexSizeInv);\n}\n\nvoid main() {\n    // Set up constants\n    float con;\n    FsrRcasCon(con, uSharpness);\n\n    // Perform RCAS pass\n    vec3 col = FsrRcasF(gl_FragCoord.xy, con);\n\n    gl_FragColor = vec4(col, FsrRcasLoadF(gl_FragCoord.xy).a);\n}\n";
