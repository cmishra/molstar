/**
 * Copyright (c) 2021-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
import type { ColorTheme } from '../color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../../mol-theme/theme';
export declare const EntityIdColorThemeParams: {
    overrideWater: PD.BooleanParam;
    waterColor: PD.Color;
    palette: PD.Mapped<PD.NamedParams<PD.Normalize<{
        maxCount: number;
        hue: [number, number];
        chroma: [number, number];
        luminance: [number, number];
        sort: "none" | "contrast";
        clusteringStepCount: number;
        minSampleCount: number;
        sampleCountFactor: number;
    }>, "generate"> | PD.NamedParams<PD.Normalize<{
        list: {
            kind: "interpolate" | "set";
            colors: import("../../mol-util/color/color").ColorListEntry[];
        };
    }>, "colors">>;
};
export type EntityIdColorThemeParams = typeof EntityIdColorThemeParams;
export declare function getEntityIdColorThemeParams(ctx: ThemeDataContext): {
    overrideWater: PD.BooleanParam;
    waterColor: PD.Color;
    palette: PD.Mapped<PD.NamedParams<PD.Normalize<{
        maxCount: number;
        hue: [number, number];
        chroma: [number, number];
        luminance: [number, number];
        sort: "none" | "contrast";
        clusteringStepCount: number;
        minSampleCount: number;
        sampleCountFactor: number;
    }>, "generate"> | PD.NamedParams<PD.Normalize<{
        list: {
            kind: "interpolate" | "set";
            colors: import("../../mol-util/color/color").ColorListEntry[];
        };
    }>, "colors">>;
};
export declare function EntityIdColorTheme(ctx: ThemeDataContext, props: PD.Values<EntityIdColorThemeParams>): ColorTheme<EntityIdColorThemeParams>;
export declare const EntityIdColorThemeProvider: ColorTheme.Provider<EntityIdColorThemeParams, 'entity-id'>;
