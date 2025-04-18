/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Structure } from '../../../../mol-model/structure';
import { RepresentationContext, RepresentationParamsGetter } from '../../../../mol-repr/representation';
import { StructureRepresentation, StructureRepresentationProvider } from '../../../../mol-repr/structure/representation';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
/** Parameter definition for representation type "Custom Label" */
export type CustomLabelParams = typeof CustomLabelParams;
export declare const CustomLabelParams: {
    visuals: PD.MultiSelect<"label-text">;
    borderColor: {
        defaultValue: import("../../../../mol-util/color").Color;
        type: "color";
        isExpanded?: boolean;
        isOptional?: boolean;
        label?: string;
        description?: string;
        legend?: import("../../../../mol-util/legend").Legend;
        fieldLabels?: {
            [name: string]: string;
        };
        isHidden?: boolean;
        shortLabel?: boolean;
        twoColumns?: boolean;
        isEssential?: boolean;
        category?: string;
        hideIf?: (currentGroup: any) => boolean;
        help?: (value: any) => {
            description?: string;
            legend?: import("../../../../mol-util/legend").Legend;
        };
    };
    clip: PD.Group<PD.Normalize<{
        variant: import("../../../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    alpha: PD.Numeric;
    backgroundColor: PD.Color;
    fontFamily: PD.Select<import("../../../../mol-geo/geometry/text/font-atlas").FontFamily>;
    fontStyle: PD.Select<import("../../../../mol-geo/geometry/text/font-atlas").FontStyle>;
    fontVariant: PD.Select<import("../../../../mol-geo/geometry/text/font-atlas").FontVariant>;
    fontWeight: PD.Select<import("../../../../mol-geo/geometry/text/font-atlas").FontWeight>;
    background: PD.BooleanParam;
    borderWidth: PD.Numeric;
    emissive: PD.Numeric;
    batchSize: PD.Numeric;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    instanceGranularity: PD.BooleanParam;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    density: PD.Numeric;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    sizeFactor: PD.Numeric;
    offsetX: PD.Numeric;
    offsetY: PD.Numeric;
    offsetZ: PD.Numeric;
    backgroundMargin: PD.Numeric;
    backgroundOpacity: PD.Numeric;
    tether: PD.BooleanParam;
    tetherLength: PD.Numeric;
    tetherBaseWidth: PD.Numeric;
    attachment: PD.Select<"middle-center" | "bottom-left" | "bottom-center" | "bottom-right" | "middle-left" | "middle-right" | "top-left" | "top-center" | "top-right">;
    fontQuality: PD.Select<number>;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    includeParent: PD.BooleanParam;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    items: PD.ObjectList<PD.Normalize<{
        text: string;
        position: PD.NamedParams<PD.Normalize<{
            selector: /*elided*/ any;
        }>, "selection"> | PD.NamedParams<PD.Normalize<{
            x: /*elided*/ any;
            y: /*elided*/ any;
            z: /*elided*/ any;
            scale: /*elided*/ any;
        }>, "x_y_z">;
    }>>;
};
/** Parameter values for representation type "Custom Label" */
export type CustomLabelProps = PD.ValuesFor<CustomLabelParams>;
/** Structure representation type "Custom Label", allowing user-defined labels at at user-defined positions */
export type CustomLabelRepresentation = StructureRepresentation<CustomLabelParams>;
export declare function CustomLabelRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, CustomLabelParams>): CustomLabelRepresentation;
/** A thingy that is needed to register representation type "Custom Label", allowing user-defined labels at at user-defined positions */
export declare const CustomLabelRepresentationProvider: StructureRepresentationProvider<{
    visuals: PD.MultiSelect<"label-text">;
    borderColor: {
        defaultValue: import("../../../../mol-util/color").Color;
        type: "color";
        isExpanded?: boolean;
        isOptional?: boolean;
        label?: string;
        description?: string;
        legend?: import("../../../../mol-util/legend").Legend;
        fieldLabels?: {
            [name: string]: string;
        };
        isHidden?: boolean;
        shortLabel?: boolean;
        twoColumns?: boolean;
        isEssential?: boolean;
        category?: string;
        hideIf?: (currentGroup: any) => boolean;
        help?: (value: any) => {
            description?: string;
            legend?: import("../../../../mol-util/legend").Legend;
        };
    };
    clip: PD.Group<PD.Normalize<{
        variant: import("../../../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    alpha: PD.Numeric;
    backgroundColor: PD.Color;
    fontFamily: PD.Select<import("../../../../mol-geo/geometry/text/font-atlas").FontFamily>;
    fontStyle: PD.Select<import("../../../../mol-geo/geometry/text/font-atlas").FontStyle>;
    fontVariant: PD.Select<import("../../../../mol-geo/geometry/text/font-atlas").FontVariant>;
    fontWeight: PD.Select<import("../../../../mol-geo/geometry/text/font-atlas").FontWeight>;
    background: PD.BooleanParam;
    borderWidth: PD.Numeric;
    emissive: PD.Numeric;
    batchSize: PD.Numeric;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    instanceGranularity: PD.BooleanParam;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    density: PD.Numeric;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    sizeFactor: PD.Numeric;
    offsetX: PD.Numeric;
    offsetY: PD.Numeric;
    offsetZ: PD.Numeric;
    backgroundMargin: PD.Numeric;
    backgroundOpacity: PD.Numeric;
    tether: PD.BooleanParam;
    tetherLength: PD.Numeric;
    tetherBaseWidth: PD.Numeric;
    attachment: PD.Select<"middle-center" | "bottom-left" | "bottom-center" | "bottom-right" | "middle-left" | "middle-right" | "top-left" | "top-center" | "top-right">;
    fontQuality: PD.Select<number>;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    includeParent: PD.BooleanParam;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    items: PD.ObjectList<PD.Normalize<{
        text: string;
        position: PD.NamedParams<PD.Normalize<{
            selector: /*elided*/ any;
        }>, "selection"> | PD.NamedParams<PD.Normalize<{
            x: /*elided*/ any;
            y: /*elided*/ any;
            z: /*elided*/ any;
            scale: /*elided*/ any;
        }>, "x_y_z">;
    }>>;
}, "mvs-custom-label">;
