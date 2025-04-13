/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Volume } from '../../mol-model/volume';
import { VisualContext } from '../visual';
import { Theme, ThemeRegistryContext } from '../../mol-theme/theme';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { VolumeVisual, VolumeRepresentation, VolumeRepresentationProvider } from './representation';
import { Lines } from '../../mol-geo/geometry/lines/lines';
import { RepresentationContext, RepresentationParamsGetter } from '../representation';
import { Loci } from '../../mol-model/loci';
import { Interval } from '../../mol-data/int';
import { WebGLContext } from '../../mol-gl/webgl/context';
export declare const VolumeIsosurfaceParams: {
    isoValue: PD.Conditioned<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>, PD.Base<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>>, {
        absolute: PD.Converted<Readonly<{
            kind: "absolute";
            absoluteValue: number;
        }>, number>;
        relative: PD.Converted<Readonly<{
            kind: "relative";
            relativeValue: number;
        }>, number>;
    }>;
};
export type VolumeIsosurfaceParams = typeof VolumeIsosurfaceParams;
export type VolumeIsosurfaceProps = PD.Values<VolumeIsosurfaceParams>;
export declare const VolumeIsosurfaceTextureParams: {
    isoValue: PD.Conditioned<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>, PD.Base<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>>, {
        absolute: PD.Converted<Readonly<{
            kind: "absolute";
            absoluteValue: number;
        }>, number>;
        relative: PD.Converted<Readonly<{
            kind: "relative";
            relativeValue: number;
        }>, number>;
    }>;
    tryUseGpu: PD.BooleanParam;
    gpuDataType: PD.Select<"float" | "byte" | "halfFloat">;
};
export type VolumeIsosurfaceGpuParams = typeof VolumeIsosurfaceTextureParams;
export type VolumeIsosurfaceGpuProps = PD.Values<VolumeIsosurfaceGpuParams>;
export declare function IsosurfaceVisual(materialId: number, volume: Volume, key: number, props: PD.Values<IsosurfaceMeshParams>, webgl?: WebGLContext): VolumeVisual<{
    quality: {
        isEssential: boolean;
        type: "select";
        options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
        cycle?: boolean;
        isOptional?: boolean;
        defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
        label?: string;
        description?: string;
        legend?: import("../../mol-util/legend").Legend;
        fieldLabels?: {
            [name: string]: string;
        };
        isHidden?: boolean;
        shortLabel?: boolean;
        twoColumns?: boolean;
        category?: string;
        hideIf?: (currentGroup: any) => boolean;
        help?: (value: any) => {
            description?: string;
            legend?: import("../../mol-util/legend").Legend;
        };
    };
    isoValue: PD.Conditioned<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>, PD.Base<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>>, {
        absolute: PD.Converted<Readonly<{
            kind: "absolute";
            absoluteValue: number;
        }>, number>;
        relative: PD.Converted<Readonly<{
            kind: "relative";
            relativeValue: number;
        }>, number>;
    }>;
    tryUseGpu: PD.BooleanParam;
    gpuDataType: PD.Select<"float" | "byte" | "halfFloat">;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    bumpFrequency: PD.Numeric;
    bumpAmplitude: PD.Numeric;
    alpha: PD.Numeric;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    emissive: PD.Numeric;
    density: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
}>;
export declare function eachIsosurface(loci: Loci, volume: Volume, key: number, props: VolumeIsosurfaceProps, apply: (interval: Interval) => boolean): boolean;
export declare function createVolumeIsosurfaceMesh(ctx: VisualContext, volume: Volume, key: number, theme: Theme, props: VolumeIsosurfaceProps, mesh?: Mesh): Promise<Mesh>;
export declare const IsosurfaceMeshParams: {
    quality: {
        isEssential: boolean;
        type: "select";
        options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
        cycle?: boolean;
        isOptional?: boolean;
        defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
        label?: string;
        description?: string;
        legend?: import("../../mol-util/legend").Legend;
        fieldLabels?: {
            [name: string]: string;
        };
        isHidden?: boolean;
        shortLabel?: boolean;
        twoColumns?: boolean;
        category?: string;
        hideIf?: (currentGroup: any) => boolean;
        help?: (value: any) => {
            description?: string;
            legend?: import("../../mol-util/legend").Legend;
        };
    };
    isoValue: PD.Conditioned<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>, PD.Base<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>>, {
        absolute: PD.Converted<Readonly<{
            kind: "absolute";
            absoluteValue: number;
        }>, number>;
        relative: PD.Converted<Readonly<{
            kind: "relative";
            relativeValue: number;
        }>, number>;
    }>;
    tryUseGpu: PD.BooleanParam;
    gpuDataType: PD.Select<"float" | "byte" | "halfFloat">;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    bumpFrequency: PD.Numeric;
    bumpAmplitude: PD.Numeric;
    alpha: PD.Numeric;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    emissive: PD.Numeric;
    density: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
};
export type IsosurfaceMeshParams = typeof IsosurfaceMeshParams;
export declare function IsosurfaceMeshVisual(materialId: number): VolumeVisual<IsosurfaceMeshParams>;
export declare function IsosurfaceTextureMeshVisual(materialId: number): VolumeVisual<IsosurfaceMeshParams>;
export declare function createVolumeIsosurfaceWireframe(ctx: VisualContext, volume: Volume, key: number, theme: Theme, props: VolumeIsosurfaceProps, lines?: Lines): Promise<Lines>;
export declare const IsosurfaceWireframeParams: {
    quality: {
        isEssential: boolean;
        type: "select";
        options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
        cycle?: boolean;
        isOptional?: boolean;
        defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
        label?: string;
        description?: string;
        legend?: import("../../mol-util/legend").Legend;
        fieldLabels?: {
            [name: string]: string;
        };
        isHidden?: boolean;
        shortLabel?: boolean;
        twoColumns?: boolean;
        category?: string;
        hideIf?: (currentGroup: any) => boolean;
        help?: (value: any) => {
            description?: string;
            legend?: import("../../mol-util/legend").Legend;
        };
    };
    sizeFactor: PD.Numeric;
    isoValue: PD.Conditioned<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>, PD.Base<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>>, {
        absolute: PD.Converted<Readonly<{
            kind: "absolute";
            absoluteValue: number;
        }>, number>;
        relative: PD.Converted<Readonly<{
            kind: "relative";
            relativeValue: number;
        }>, number>;
    }>;
    lineSizeAttenuation: PD.BooleanParam;
    alpha: PD.Numeric;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    emissive: PD.Numeric;
    density: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
};
export type IsosurfaceWireframeParams = typeof IsosurfaceWireframeParams;
export declare function IsosurfaceWireframeVisual(materialId: number): VolumeVisual<IsosurfaceWireframeParams>;
export declare const IsosurfaceParams: {
    visuals: PD.MultiSelect<"solid" | "wireframe">;
    bumpFrequency: PD.Numeric;
    quality: {
        isEssential: boolean;
        type: "select";
        options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
        cycle?: boolean;
        isOptional?: boolean;
        defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
        label?: string;
        description?: string;
        legend?: import("../../mol-util/legend").Legend;
        fieldLabels?: {
            [name: string]: string;
        };
        isHidden?: boolean;
        shortLabel?: boolean;
        twoColumns?: boolean;
        category?: string;
        hideIf?: (currentGroup: any) => boolean;
        help?: (value: any) => {
            description?: string;
            legend?: import("../../mol-util/legend").Legend;
        };
    };
    sizeFactor: PD.Numeric;
    isoValue: PD.Conditioned<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>, PD.Base<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>>, {
        absolute: PD.Converted<Readonly<{
            kind: "absolute";
            absoluteValue: number;
        }>, number>;
        relative: PD.Converted<Readonly<{
            kind: "relative";
            relativeValue: number;
        }>, number>;
    }>;
    lineSizeAttenuation: PD.BooleanParam;
    alpha: PD.Numeric;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    emissive: PD.Numeric;
    density: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
    tryUseGpu: PD.BooleanParam;
    gpuDataType: PD.Select<"float" | "byte" | "halfFloat">;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    bumpAmplitude: PD.Numeric;
};
export type IsosurfaceParams = typeof IsosurfaceParams;
export declare function getIsosurfaceParams(ctx: ThemeRegistryContext, volume: Volume): {
    visuals: PD.MultiSelect<"solid" | "wireframe">;
    bumpFrequency: PD.Numeric;
    quality: {
        isEssential: boolean;
        type: "select";
        options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
        cycle?: boolean;
        isOptional?: boolean;
        defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
        label?: string;
        description?: string;
        legend?: import("../../mol-util/legend").Legend;
        fieldLabels?: {
            [name: string]: string;
        };
        isHidden?: boolean;
        shortLabel?: boolean;
        twoColumns?: boolean;
        category?: string;
        hideIf?: (currentGroup: any) => boolean;
        help?: (value: any) => {
            description?: string;
            legend?: import("../../mol-util/legend").Legend;
        };
    };
    sizeFactor: PD.Numeric;
    isoValue: PD.Conditioned<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>, PD.Base<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>>, {
        absolute: PD.Converted<Readonly<{
            kind: "absolute";
            absoluteValue: number;
        }>, number>;
        relative: PD.Converted<Readonly<{
            kind: "relative";
            relativeValue: number;
        }>, number>;
    }>;
    lineSizeAttenuation: PD.BooleanParam;
    alpha: PD.Numeric;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    emissive: PD.Numeric;
    density: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
    tryUseGpu: PD.BooleanParam;
    gpuDataType: PD.Select<"float" | "byte" | "halfFloat">;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    bumpAmplitude: PD.Numeric;
};
export type IsosurfaceRepresentation = VolumeRepresentation<IsosurfaceParams>;
export declare function IsosurfaceRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Volume, IsosurfaceParams>): IsosurfaceRepresentation;
export declare const IsosurfaceRepresentationProvider: VolumeRepresentationProvider<{
    visuals: PD.MultiSelect<"solid" | "wireframe">;
    bumpFrequency: PD.Numeric;
    quality: {
        isEssential: boolean;
        type: "select";
        options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
        cycle?: boolean;
        isOptional?: boolean;
        defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
        label?: string;
        description?: string;
        legend?: import("../../mol-util/legend").Legend;
        fieldLabels?: {
            [name: string]: string;
        };
        isHidden?: boolean;
        shortLabel?: boolean;
        twoColumns?: boolean;
        category?: string;
        hideIf?: (currentGroup: any) => boolean;
        help?: (value: any) => {
            description?: string;
            legend?: import("../../mol-util/legend").Legend;
        };
    };
    sizeFactor: PD.Numeric;
    isoValue: PD.Conditioned<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>, PD.Base<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>>, {
        absolute: PD.Converted<Readonly<{
            kind: "absolute";
            absoluteValue: number;
        }>, number>;
        relative: PD.Converted<Readonly<{
            kind: "relative";
            relativeValue: number;
        }>, number>;
    }>;
    lineSizeAttenuation: PD.BooleanParam;
    alpha: PD.Numeric;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    emissive: PD.Numeric;
    density: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
    tryUseGpu: PD.BooleanParam;
    gpuDataType: PD.Select<"float" | "byte" | "halfFloat">;
    doubleSided: PD.BooleanParam;
    flipSided: PD.BooleanParam;
    flatShaded: PD.BooleanParam;
    ignoreLight: PD.BooleanParam;
    celShaded: PD.BooleanParam;
    xrayShaded: PD.Select<boolean | "inverted">;
    transparentBackfaces: PD.Select<"off" | "on" | "opaque">;
    bumpAmplitude: PD.Numeric;
}, "isosurface">;
