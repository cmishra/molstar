/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
export function splitValues(schema, values) {
    const attributeValues = {};
    const defineValues = {};
    const textureValues = {};
    const materialTextureValues = {};
    const uniformValues = {};
    const materialUniformValues = {};
    const bufferedUniformValues = {};
    Object.keys(schema).forEach(k => {
        const spec = schema[k];
        if (spec.type === 'attribute')
            attributeValues[k] = values[k];
        if (spec.type === 'define')
            defineValues[k] = values[k];
        // check if k exists in values to exclude global textures
        if (spec.type === 'texture' && values[k] !== undefined) {
            if (spec.variant === 'material')
                materialTextureValues[k] = values[k];
            else
                textureValues[k] = values[k];
        }
        // check if k exists in values to exclude global uniforms
        if (spec.type === 'uniform' && values[k] !== undefined) {
            if (spec.variant === 'material')
                materialUniformValues[k] = values[k];
            else if (spec.variant === 'buffered')
                bufferedUniformValues[k] = values[k];
            else
                uniformValues[k] = values[k];
        }
    });
    return { attributeValues, defineValues, textureValues, materialTextureValues, uniformValues, materialUniformValues, bufferedUniformValues };
}
export function getValueVersions(values) {
    const versions = {};
    Object.keys(values).forEach(k => {
        versions[k] = values[k].ref.version;
    });
    return versions;
}
export function AttributeSpec(kind, itemSize, divisor) {
    return { type: 'attribute', kind, itemSize, divisor };
}
export function UniformSpec(kind, variant) {
    return { type: 'uniform', kind, variant };
}
export function TextureSpec(kind, format, dataType, filter, variant) {
    return { type: 'texture', kind, format, dataType, filter, variant };
}
export function ElementsSpec(kind) {
    return { type: 'elements', kind };
}
export function DefineSpec(kind, options) {
    return { type: 'define', kind, options };
}
export function ValueSpec(kind) {
    return { type: 'value', kind };
}
//
export const GlobalUniformSchema = {
    uDrawId: UniformSpec('i'),
    uModel: UniformSpec('m4'),
    uView: UniformSpec('m4'),
    uInvView: UniformSpec('m4'),
    uModelView: UniformSpec('m4'),
    uInvModelView: UniformSpec('m4'),
    uProjection: UniformSpec('m4'),
    uInvProjection: UniformSpec('m4'),
    uModelViewProjection: UniformSpec('m4'),
    uInvModelViewProjection: UniformSpec('m4'),
    uIsOrtho: UniformSpec('f'),
    uPixelRatio: UniformSpec('f'),
    uViewport: UniformSpec('v4'),
    uViewOffset: UniformSpec('v2'),
    uDrawingBufferSize: UniformSpec('v2'),
    uCameraPosition: UniformSpec('v3'),
    uCameraDir: UniformSpec('v3'),
    uCameraPlane: UniformSpec('v4'),
    uNear: UniformSpec('f'),
    uFar: UniformSpec('f'),
    uFog: UniformSpec('b'),
    uFogNear: UniformSpec('f'),
    uFogFar: UniformSpec('f'),
    uFogColor: UniformSpec('v3'),
    uTransparentBackground: UniformSpec('b'),
    uLightDirection: UniformSpec('v3[]'),
    uLightColor: UniformSpec('v3[]'),
    uAmbientColor: UniformSpec('v3'),
    uPickingAlphaThreshold: UniformSpec('f'),
    uInteriorDarkening: UniformSpec('f'),
    uInteriorColorFlag: UniformSpec('b'),
    uInteriorColor: UniformSpec('v3'),
    uHighlightColor: UniformSpec('v3'),
    uSelectColor: UniformSpec('v3'),
    uDimColor: UniformSpec('v3'),
    uHighlightStrength: UniformSpec('f'),
    uSelectStrength: UniformSpec('f'),
    uDimStrength: UniformSpec('f'),
    uMarkerPriority: UniformSpec('i'),
    uMarkerAverage: UniformSpec('f'),
    uXrayEdgeFalloff: UniformSpec('f'),
    uCelSteps: UniformSpec('f'),
    uExposure: UniformSpec('f'),
    uRenderMask: UniformSpec('i'),
    uMarkingDepthTest: UniformSpec('b'),
    uMarkingType: UniformSpec('i'),
    uPickType: UniformSpec('i'),
};
export const GlobalTextureSchema = {
    tDepth: TextureSpec('texture', 'depth', 'ushort', 'nearest'),
    // dpoit
    tDpoitDepth: TextureSpec('texture', 'rg', 'float', 'nearest'),
    tDpoitFrontColor: TextureSpec('texture', 'rgba', 'float', 'nearest'),
    tDpoitBackColor: TextureSpec('texture', 'rgba', 'float', 'nearest')
};
export const InternalSchema = {
    uObjectId: UniformSpec('i'),
};
export const ColorSchema = {
    // aColor: AttributeSpec('float32', 3, 0), // TODO
    uColor: UniformSpec('v3', 'material'),
    uColorTexDim: UniformSpec('v2'),
    uColorGridDim: UniformSpec('v3'),
    uColorGridTransform: UniformSpec('v4'),
    uPaletteDomain: UniformSpec('v2'),
    uPaletteDefault: UniformSpec('v3'),
    tColor: TextureSpec('image-uint8', 'rgb', 'ubyte', 'nearest'),
    tPalette: TextureSpec('image-uint8', 'rgb', 'ubyte', 'nearest'),
    tColorGrid: TextureSpec('texture', 'rgb', 'ubyte', 'linear'),
    dColorType: DefineSpec('string', ['uniform', 'attribute', 'instance', 'group', 'groupInstance', 'vertex', 'vertexInstance', 'volume', 'volumeInstance', 'direct']),
    dUsePalette: DefineSpec('boolean'),
};
export const SizeSchema = {
    // aSize: AttributeSpec('float32', 1, 0), // TODO
    uSize: UniformSpec('f', 'material'),
    uSizeTexDim: UniformSpec('v2'),
    tSize: TextureSpec('image-uint8', 'rgb', 'ubyte', 'nearest'),
    dSizeType: DefineSpec('string', ['uniform', 'attribute', 'instance', 'group', 'groupInstance']),
    uSizeFactor: UniformSpec('f', 'material'),
};
export const MarkerSchema = {
    uMarker: UniformSpec('f'),
    uMarkerTexDim: UniformSpec('v2'),
    tMarker: TextureSpec('image-uint8', 'alpha', 'ubyte', 'nearest'),
    markerAverage: ValueSpec('number'),
    markerStatus: ValueSpec('number'),
    dMarkerType: DefineSpec('string', ['instance', 'groupInstance']),
};
export const OverpaintSchema = {
    uOverpaintTexDim: UniformSpec('v2'),
    tOverpaint: TextureSpec('image-uint8', 'rgba', 'ubyte', 'nearest'),
    dOverpaint: DefineSpec('boolean'),
    uOverpaintGridDim: UniformSpec('v3'),
    uOverpaintGridTransform: UniformSpec('v4'),
    tOverpaintGrid: TextureSpec('texture', 'rgba', 'ubyte', 'linear'),
    dOverpaintType: DefineSpec('string', ['instance', 'groupInstance', 'volumeInstance']),
    uOverpaintStrength: UniformSpec('f', 'material'),
};
export const TransparencySchema = {
    uTransparencyTexDim: UniformSpec('v2'),
    tTransparency: TextureSpec('image-uint8', 'alpha', 'ubyte', 'nearest'),
    dTransparency: DefineSpec('boolean'),
    transparencyAverage: ValueSpec('number'),
    transparencyMin: ValueSpec('number'),
    uTransparencyGridDim: UniformSpec('v3'),
    uTransparencyGridTransform: UniformSpec('v4'),
    tTransparencyGrid: TextureSpec('texture', 'alpha', 'ubyte', 'linear'),
    dTransparencyType: DefineSpec('string', ['instance', 'groupInstance', 'volumeInstance']),
    uTransparencyStrength: UniformSpec('f', 'material'),
};
export const EmissiveSchema = {
    uEmissiveTexDim: UniformSpec('v2'),
    tEmissive: TextureSpec('image-uint8', 'alpha', 'ubyte', 'nearest'),
    dEmissive: DefineSpec('boolean'),
    emissiveAverage: ValueSpec('number'),
    uEmissiveGridDim: UniformSpec('v3'),
    uEmissiveGridTransform: UniformSpec('v4'),
    tEmissiveGrid: TextureSpec('texture', 'alpha', 'ubyte', 'linear'),
    dEmissiveType: DefineSpec('string', ['instance', 'groupInstance', 'volumeInstance']),
    uEmissiveStrength: UniformSpec('f', 'material'),
};
export const SubstanceSchema = {
    uSubstanceTexDim: UniformSpec('v2'),
    tSubstance: TextureSpec('image-uint8', 'rgba', 'ubyte', 'nearest'),
    dSubstance: DefineSpec('boolean'),
    uSubstanceGridDim: UniformSpec('v3'),
    uSubstanceGridTransform: UniformSpec('v4'),
    tSubstanceGrid: TextureSpec('texture', 'rgba', 'ubyte', 'linear'),
    dSubstanceType: DefineSpec('string', ['instance', 'groupInstance', 'volumeInstance']),
    uSubstanceStrength: UniformSpec('f', 'material'),
};
export const ClippingSchema = {
    uClippingTexDim: UniformSpec('v2'),
    tClipping: TextureSpec('image-uint8', 'alpha', 'ubyte', 'nearest'),
    dClipping: DefineSpec('boolean'),
    dClippingType: DefineSpec('string', ['instance', 'groupInstance']),
};
export const BaseSchema = {
    dGeometryType: DefineSpec('string', ['cylinders', 'directVolume', 'image', 'lines', 'mesh', 'points', 'spheres', 'text', 'textureMesh']),
    ...ColorSchema,
    ...MarkerSchema,
    ...OverpaintSchema,
    ...TransparencySchema,
    ...EmissiveSchema,
    ...SubstanceSchema,
    ...ClippingSchema,
    dLightCount: DefineSpec('number'),
    dColorMarker: DefineSpec('boolean'),
    dClipObjectCount: DefineSpec('number'),
    dClipVariant: DefineSpec('string', ['instance', 'pixel']),
    uClipObjectType: UniformSpec('i[]', 'material'),
    uClipObjectInvert: UniformSpec('b[]', 'material'),
    uClipObjectPosition: UniformSpec('v3[]', 'material'),
    uClipObjectRotation: UniformSpec('v4[]', 'material'),
    uClipObjectScale: UniformSpec('v3[]', 'material'),
    uClipObjectTransform: UniformSpec('m4[]', 'material'),
    aInstance: AttributeSpec('float32', 1, 1),
    /**
     * final per-instance transform calculated for instance `i` as
     * `aTransform[i] = matrix * transform[i] * extraTransform[i]`
     */
    aTransform: AttributeSpec('float32', 16, 1),
    /**
     * final alpha, calculated as `values.alpha * state.alpha`
     */
    uAlpha: UniformSpec('f', 'material'),
    uMetalness: UniformSpec('f', 'material'),
    uRoughness: UniformSpec('f', 'material'),
    uBumpiness: UniformSpec('f', 'material'),
    uEmissive: UniformSpec('f', 'material'),
    /** density value to estimate object thickness */
    uDensity: UniformSpec('f', 'material'),
    uVertexCount: UniformSpec('i'),
    uInstanceCount: UniformSpec('i'),
    uGroupCount: UniformSpec('i'),
    uInvariantBoundingSphere: UniformSpec('v4'),
    uLod: UniformSpec('v4'),
    drawCount: ValueSpec('number'),
    instanceCount: ValueSpec('number'),
    /** base alpha, see uAlpha  */
    alpha: ValueSpec('number'),
    /** global transform, see aTransform */
    matrix: ValueSpec('m4'),
    /** base per-instance transform, see aTransform */
    transform: ValueSpec('float32'),
    /** additional per-instance transform, see aTransform */
    extraTransform: ValueSpec('float32'),
    /** denotes reflection in transform */
    hasReflection: ValueSpec('boolean'),
    /** use instance granularity for marker, transparency, clipping, overpaint, substance */
    instanceGranularity: ValueSpec('boolean'),
    /** bounding sphere taking aTransform into account and encompases all instances */
    boundingSphere: ValueSpec('sphere'),
    /** bounding sphere NOT taking aTransform into account */
    invariantBoundingSphere: ValueSpec('sphere'),
    instanceGrid: ValueSpec('instanceGrid'),
};
