/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Renderable, RenderableState } from '../renderable';
import { WebGLContext } from '../webgl/context';
import { Transparency } from '../webgl/render-item';
import { Values, ValueSpec, DefineSpec, UniformSpec, TextureSpec } from './schema';
export declare const SpheresSchema: {
    uTexDim: UniformSpec<"v2">;
    tPositionGroup: TextureSpec<"image-float32">;
    padding: ValueSpec<"number">;
    uDoubleSided: UniformSpec<"b">;
    dIgnoreLight: DefineSpec<"boolean">;
    dCelShaded: DefineSpec<"boolean">;
    dXrayShaded: DefineSpec<"string">;
    dTransparentBackfaces: DefineSpec<"string">;
    dSolidInterior: DefineSpec<"boolean">;
    dClipPrimitive: DefineSpec<"boolean">;
    dApproximate: DefineSpec<"boolean">;
    uAlphaThickness: UniformSpec<"f">;
    uBumpFrequency: UniformSpec<"f">;
    uBumpAmplitude: UniformSpec<"f">;
    lodLevels: ValueSpec<"unknown">;
    centerBuffer: ValueSpec<"float32">;
    groupBuffer: ValueSpec<"float32">;
    uSize: UniformSpec<"f">;
    uSizeTexDim: UniformSpec<"v2">;
    tSize: TextureSpec<"image-uint8">;
    dSizeType: DefineSpec<"string">;
    uSizeFactor: UniformSpec<"f">;
    dLightCount: DefineSpec<"number">;
    dColorMarker: DefineSpec<"boolean">;
    dClipObjectCount: DefineSpec<"number">;
    dClipVariant: DefineSpec<"string">;
    uClipObjectType: UniformSpec<"i[]">;
    uClipObjectInvert: UniformSpec<"b[]">;
    uClipObjectPosition: UniformSpec<"v3[]">;
    uClipObjectRotation: UniformSpec<"v4[]">;
    uClipObjectScale: UniformSpec<"v3[]">;
    uClipObjectTransform: UniformSpec<"m4[]">;
    aInstance: import("./schema").AttributeSpec<"float32">;
    aTransform: import("./schema").AttributeSpec<"float32">;
    uAlpha: UniformSpec<"f">;
    uMetalness: UniformSpec<"f">;
    uRoughness: UniformSpec<"f">;
    uBumpiness: UniformSpec<"f">;
    uEmissive: UniformSpec<"f">;
    uDensity: UniformSpec<"f">;
    uVertexCount: UniformSpec<"i">;
    uInstanceCount: UniformSpec<"i">;
    uGroupCount: UniformSpec<"i">;
    uInvariantBoundingSphere: UniformSpec<"v4">;
    uLod: UniformSpec<"v4">;
    drawCount: ValueSpec<"number">;
    instanceCount: ValueSpec<"number">;
    alpha: ValueSpec<"number">;
    matrix: ValueSpec<"m4">;
    transform: ValueSpec<"float32">;
    extraTransform: ValueSpec<"float32">;
    hasReflection: ValueSpec<"boolean">;
    instanceGranularity: ValueSpec<"boolean">;
    boundingSphere: ValueSpec<"sphere">;
    invariantBoundingSphere: ValueSpec<"sphere">;
    instanceGrid: ValueSpec<"instanceGrid">;
    uClippingTexDim: UniformSpec<"v2">;
    tClipping: TextureSpec<"image-uint8">;
    dClipping: DefineSpec<"boolean">;
    dClippingType: DefineSpec<"string">;
    uSubstanceTexDim: UniformSpec<"v2">;
    tSubstance: TextureSpec<"image-uint8">;
    dSubstance: DefineSpec<"boolean">;
    uSubstanceGridDim: UniformSpec<"v3">;
    uSubstanceGridTransform: UniformSpec<"v4">;
    tSubstanceGrid: TextureSpec<"texture">;
    dSubstanceType: DefineSpec<"string">;
    uSubstanceStrength: UniformSpec<"f">;
    uEmissiveTexDim: UniformSpec<"v2">;
    tEmissive: TextureSpec<"image-uint8">;
    dEmissive: DefineSpec<"boolean">;
    emissiveAverage: ValueSpec<"number">;
    uEmissiveGridDim: UniformSpec<"v3">;
    uEmissiveGridTransform: UniformSpec<"v4">;
    tEmissiveGrid: TextureSpec<"texture">;
    dEmissiveType: DefineSpec<"string">;
    uEmissiveStrength: UniformSpec<"f">;
    uTransparencyTexDim: UniformSpec<"v2">;
    tTransparency: TextureSpec<"image-uint8">;
    dTransparency: DefineSpec<"boolean">;
    transparencyAverage: ValueSpec<"number">;
    transparencyMin: ValueSpec<"number">;
    uTransparencyGridDim: UniformSpec<"v3">;
    uTransparencyGridTransform: UniformSpec<"v4">;
    tTransparencyGrid: TextureSpec<"texture">;
    dTransparencyType: DefineSpec<"string">;
    uTransparencyStrength: UniformSpec<"f">;
    uOverpaintTexDim: UniformSpec<"v2">;
    tOverpaint: TextureSpec<"image-uint8">;
    dOverpaint: DefineSpec<"boolean">;
    uOverpaintGridDim: UniformSpec<"v3">;
    uOverpaintGridTransform: UniformSpec<"v4">;
    tOverpaintGrid: TextureSpec<"texture">;
    dOverpaintType: DefineSpec<"string">;
    uOverpaintStrength: UniformSpec<"f">;
    uMarker: UniformSpec<"f">;
    uMarkerTexDim: UniformSpec<"v2">;
    tMarker: TextureSpec<"image-uint8">;
    markerAverage: ValueSpec<"number">;
    markerStatus: ValueSpec<"number">;
    dMarkerType: DefineSpec<"string">;
    uColor: UniformSpec<"v3">;
    uColorTexDim: UniformSpec<"v2">;
    uColorGridDim: UniformSpec<"v3">;
    uColorGridTransform: UniformSpec<"v4">;
    uPaletteDomain: UniformSpec<"v2">;
    uPaletteDefault: UniformSpec<"v3">;
    tColor: TextureSpec<"image-uint8">;
    tPalette: TextureSpec<"image-uint8">;
    tColorGrid: TextureSpec<"texture">;
    dColorType: DefineSpec<"string">;
    dUsePalette: DefineSpec<"boolean">;
    dGeometryType: DefineSpec<"string">;
};
export type SpheresSchema = typeof SpheresSchema;
export type SpheresValues = Values<SpheresSchema>;
export declare function SpheresRenderable(ctx: WebGLContext, id: number, values: SpheresValues, state: RenderableState, materialId: number, transparency: Transparency): Renderable<SpheresValues>;
