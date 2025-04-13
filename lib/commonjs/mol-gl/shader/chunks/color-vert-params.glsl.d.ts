export declare const color_vert_params = "\nuniform float uMetalness;\nuniform float uRoughness;\nuniform float uBumpiness;\n\n#if defined(dRenderVariant_color) || defined(dRenderVariant_tracing)\n    #if defined(dColorType_uniform)\n        uniform vec3 uColor;\n    #elif defined(dColorType_attribute)\n        varying vec4 vColor;\n        attribute vec3 aColor;\n    #elif defined(dColorType_texture)\n        varying vec4 vColor;\n        uniform vec2 uColorTexDim;\n        uniform sampler2D tColor;\n    #elif defined(dColorType_grid)\n        varying vec4 vColor;\n        uniform vec2 uColorTexDim;\n        uniform vec3 uColorGridDim;\n        uniform vec4 uColorGridTransform;\n        uniform sampler2D tColorGrid;\n    #elif defined(dColorType_direct)\n        varying vec4 vColor;\n    #endif\n\n    #ifdef dUsePalette\n        varying float vPaletteV;\n    #endif\n\n    #ifdef dOverpaint\n        #if defined(dOverpaintType_instance) || defined(dOverpaintType_groupInstance) || defined(dOverpaintType_vertexInstance)\n            varying vec4 vOverpaint;\n            uniform vec2 uOverpaintTexDim;\n            uniform sampler2D tOverpaint;\n        #elif defined(dOverpaintType_volumeInstance)\n            varying vec4 vOverpaint;\n            uniform vec2 uOverpaintTexDim;\n            uniform vec3 uOverpaintGridDim;\n            uniform vec4 uOverpaintGridTransform;\n            uniform sampler2D tOverpaintGrid;\n        #endif\n        uniform float uOverpaintStrength;\n    #endif\n\n    #ifdef dEmissive\n        #if defined(dEmissiveType_instance) || defined(dEmissiveType_groupInstance) || defined(dEmissiveType_vertexInstance)\n            varying float vEmissive;\n            uniform vec2 uEmissiveTexDim;\n            uniform sampler2D tEmissive;\n        #elif defined(dEmissiveType_volumeInstance)\n            varying float vEmissive;\n            uniform vec2 uEmissiveTexDim;\n            uniform vec3 uEmissiveGridDim;\n            uniform vec4 uEmissiveGridTransform;\n            uniform sampler2D tEmissiveGrid;\n        #endif\n        uniform float uEmissiveStrength;\n    #endif\n\n    #ifdef dSubstance\n        #if defined(dSubstanceType_instance) || defined(dSubstanceType_groupInstance) || defined(dSubstanceType_vertexInstance)\n            varying vec4 vSubstance;\n            uniform vec2 uSubstanceTexDim;\n            uniform sampler2D tSubstance;\n        #elif defined(dSubstanceType_volumeInstance)\n            varying vec4 vSubstance;\n            uniform vec2 uSubstanceTexDim;\n            uniform vec3 uSubstanceGridDim;\n            uniform vec4 uSubstanceGridTransform;\n            uniform sampler2D tSubstanceGrid;\n        #endif\n        uniform float uSubstanceStrength;\n    #endif\n#elif defined(dRenderVariant_emissive)\n    #ifdef dEmissive\n        #if defined(dEmissiveType_instance) || defined(dEmissiveType_groupInstance) || defined(dEmissiveType_vertexInstance)\n            varying float vEmissive;\n            uniform vec2 uEmissiveTexDim;\n            uniform sampler2D tEmissive;\n        #elif defined(dEmissiveType_volumeInstance)\n            varying float vEmissive;\n            uniform vec2 uEmissiveTexDim;\n            uniform vec3 uEmissiveGridDim;\n            uniform vec4 uEmissiveGridTransform;\n            uniform sampler2D tEmissiveGrid;\n        #endif\n        uniform float uEmissiveStrength;\n    #endif\n#elif defined(dRenderVariant_pick)\n    #if __VERSION__ == 100 || !defined(dVaryingGroup)\n        #ifdef requiredDrawBuffers\n            varying vec4 vObject;\n            varying vec4 vInstance;\n            varying vec4 vGroup;\n        #else\n            varying vec4 vColor;\n        #endif\n    #else\n        #ifdef requiredDrawBuffers\n            flat out vec4 vObject;\n            flat out vec4 vInstance;\n            flat out vec4 vGroup;\n        #else\n            flat out vec4 vColor;\n        #endif\n    #endif\n#endif\n\n#ifdef dTransparency\n    #if defined(dTransparencyType_instance) || defined(dTransparencyType_groupInstance) || defined(dTransparencyType_vertexInstance)\n        varying float vTransparency;\n        uniform vec2 uTransparencyTexDim;\n        uniform sampler2D tTransparency;\n    #elif defined(dTransparencyType_volumeInstance)\n        varying float vTransparency;\n        uniform vec2 uTransparencyTexDim;\n        uniform vec3 uTransparencyGridDim;\n        uniform vec4 uTransparencyGridTransform;\n        uniform sampler2D tTransparencyGrid;\n    #endif\n    uniform float uTransparencyStrength;\n#endif\n";
