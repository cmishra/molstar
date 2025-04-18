/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from '../../mol-util/color';
import type { ColorTheme } from '../color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../theme';
export declare const IllustrativeColorThemeParams: {
    style: PD.Mapped<PD.NamedParams<PD.Normalize<{
        value: Color;
        saturation: number;
        lightness: number;
    }>, "uniform"> | PD.NamedParams<PD.Normalize<{
        palette: PD.NamedParams<PD.Normalize<{
            maxCount: /*elided*/ any;
            hue: /*elided*/ any;
            chroma: /*elided*/ any;
            luminance: /*elided*/ any;
            sort: /*elided*/ any;
            clusteringStepCount: /*elided*/ any;
            minSampleCount: /*elided*/ any;
            sampleCountFactor: /*elided*/ any;
        }>, "generate"> | PD.NamedParams<PD.Normalize<{
            list: /*elided*/ any;
        }>, "colors">;
        asymId: "label" | "auth";
    }>, "chain-id"> | PD.NamedParams<PD.Normalize<{
        overrideWater: boolean;
        waterColor: Color;
        palette: PD.NamedParams<PD.Normalize<{
            maxCount: /*elided*/ any;
            hue: /*elided*/ any;
            chroma: /*elided*/ any;
            luminance: /*elided*/ any;
            sort: /*elided*/ any;
            clusteringStepCount: /*elided*/ any;
            minSampleCount: /*elided*/ any;
            sampleCountFactor: /*elided*/ any;
        }>, "generate"> | PD.NamedParams<PD.Normalize<{
            list: /*elided*/ any;
        }>, "colors">;
    }>, "entity-id"> | PD.NamedParams<PD.Normalize<{
        palette: PD.NamedParams<PD.Normalize<{
            maxCount: /*elided*/ any;
            hue: /*elided*/ any;
            chroma: /*elided*/ any;
            luminance: /*elided*/ any;
            sort: /*elided*/ any;
            clusteringStepCount: /*elided*/ any;
            minSampleCount: /*elided*/ any;
            sampleCountFactor: /*elided*/ any;
        }>, "generate"> | PD.NamedParams<PD.Normalize<{
            list: /*elided*/ any;
        }>, "colors">;
    }>, "entity-source"> | PD.NamedParams<PD.Normalize<{
        palette: PD.NamedParams<PD.Normalize<{
            maxCount: /*elided*/ any;
            hue: /*elided*/ any;
            chroma: /*elided*/ any;
            luminance: /*elided*/ any;
            sort: /*elided*/ any;
            clusteringStepCount: /*elided*/ any;
            minSampleCount: /*elided*/ any;
            sampleCountFactor: /*elided*/ any;
        }>, "generate"> | PD.NamedParams<PD.Normalize<{
            list: /*elided*/ any;
        }>, "colors">;
    }>, "model-index"> | PD.NamedParams<PD.Normalize<{
        palette: PD.NamedParams<PD.Normalize<{
            maxCount: /*elided*/ any;
            hue: /*elided*/ any;
            chroma: /*elided*/ any;
            luminance: /*elided*/ any;
            sort: /*elided*/ any;
            clusteringStepCount: /*elided*/ any;
            minSampleCount: /*elided*/ any;
            sampleCountFactor: /*elided*/ any;
        }>, "generate"> | PD.NamedParams<PD.Normalize<{
            list: /*elided*/ any;
        }>, "colors">;
    }>, "structure-index"> | PD.NamedParams<PD.Normalize<{
        palette: PD.NamedParams<PD.Normalize<{
            maxCount: /*elided*/ any;
            hue: /*elided*/ any;
            chroma: /*elided*/ any;
            luminance: /*elided*/ any;
            sort: /*elided*/ any;
            clusteringStepCount: /*elided*/ any;
            minSampleCount: /*elided*/ any;
            sampleCountFactor: /*elided*/ any;
        }>, "generate"> | PD.NamedParams<PD.Normalize<{
            list: /*elided*/ any;
        }>, "colors">;
    }>, "trajectory-index"> | PD.NamedParams<PD.Normalize<{
        saturation: number;
        lightness: number;
        colors: PD.NamedParams<PD.Normalize<unknown>, "default"> | PD.NamedParams<PD.Normalize<{
            water: /*elided*/ any;
            ion: /*elided*/ any;
            protein: /*elided*/ any;
            RNA: /*elided*/ any;
            DNA: /*elided*/ any;
            PNA: /*elided*/ any;
            saccharide: /*elided*/ any;
        }>, "custom">;
    }>, "molecule-type">>;
    carbonLightness: PD.Numeric;
};
export type IllustrativeColorThemeParams = typeof IllustrativeColorThemeParams;
export declare function getIllustrativeColorThemeParams(ctx: ThemeDataContext): {
    style: PD.Mapped<PD.NamedParams<PD.Normalize<{
        value: Color;
        saturation: number;
        lightness: number;
    }>, "uniform"> | PD.NamedParams<PD.Normalize<{
        palette: PD.NamedParams<PD.Normalize<{
            maxCount: /*elided*/ any;
            hue: /*elided*/ any;
            chroma: /*elided*/ any;
            luminance: /*elided*/ any;
            sort: /*elided*/ any;
            clusteringStepCount: /*elided*/ any;
            minSampleCount: /*elided*/ any;
            sampleCountFactor: /*elided*/ any;
        }>, "generate"> | PD.NamedParams<PD.Normalize<{
            list: /*elided*/ any;
        }>, "colors">;
        asymId: "label" | "auth";
    }>, "chain-id"> | PD.NamedParams<PD.Normalize<{
        overrideWater: boolean;
        waterColor: Color;
        palette: PD.NamedParams<PD.Normalize<{
            maxCount: /*elided*/ any;
            hue: /*elided*/ any;
            chroma: /*elided*/ any;
            luminance: /*elided*/ any;
            sort: /*elided*/ any;
            clusteringStepCount: /*elided*/ any;
            minSampleCount: /*elided*/ any;
            sampleCountFactor: /*elided*/ any;
        }>, "generate"> | PD.NamedParams<PD.Normalize<{
            list: /*elided*/ any;
        }>, "colors">;
    }>, "entity-id"> | PD.NamedParams<PD.Normalize<{
        palette: PD.NamedParams<PD.Normalize<{
            maxCount: /*elided*/ any;
            hue: /*elided*/ any;
            chroma: /*elided*/ any;
            luminance: /*elided*/ any;
            sort: /*elided*/ any;
            clusteringStepCount: /*elided*/ any;
            minSampleCount: /*elided*/ any;
            sampleCountFactor: /*elided*/ any;
        }>, "generate"> | PD.NamedParams<PD.Normalize<{
            list: /*elided*/ any;
        }>, "colors">;
    }>, "entity-source"> | PD.NamedParams<PD.Normalize<{
        palette: PD.NamedParams<PD.Normalize<{
            maxCount: /*elided*/ any;
            hue: /*elided*/ any;
            chroma: /*elided*/ any;
            luminance: /*elided*/ any;
            sort: /*elided*/ any;
            clusteringStepCount: /*elided*/ any;
            minSampleCount: /*elided*/ any;
            sampleCountFactor: /*elided*/ any;
        }>, "generate"> | PD.NamedParams<PD.Normalize<{
            list: /*elided*/ any;
        }>, "colors">;
    }>, "model-index"> | PD.NamedParams<PD.Normalize<{
        palette: PD.NamedParams<PD.Normalize<{
            maxCount: /*elided*/ any;
            hue: /*elided*/ any;
            chroma: /*elided*/ any;
            luminance: /*elided*/ any;
            sort: /*elided*/ any;
            clusteringStepCount: /*elided*/ any;
            minSampleCount: /*elided*/ any;
            sampleCountFactor: /*elided*/ any;
        }>, "generate"> | PD.NamedParams<PD.Normalize<{
            list: /*elided*/ any;
        }>, "colors">;
    }>, "structure-index"> | PD.NamedParams<PD.Normalize<{
        palette: PD.NamedParams<PD.Normalize<{
            maxCount: /*elided*/ any;
            hue: /*elided*/ any;
            chroma: /*elided*/ any;
            luminance: /*elided*/ any;
            sort: /*elided*/ any;
            clusteringStepCount: /*elided*/ any;
            minSampleCount: /*elided*/ any;
            sampleCountFactor: /*elided*/ any;
        }>, "generate"> | PD.NamedParams<PD.Normalize<{
            list: /*elided*/ any;
        }>, "colors">;
    }>, "trajectory-index"> | PD.NamedParams<PD.Normalize<{
        saturation: number;
        lightness: number;
        colors: PD.NamedParams<PD.Normalize<unknown>, "default"> | PD.NamedParams<PD.Normalize<{
            water: /*elided*/ any;
            ion: /*elided*/ any;
            protein: /*elided*/ any;
            RNA: /*elided*/ any;
            DNA: /*elided*/ any;
            PNA: /*elided*/ any;
            saccharide: /*elided*/ any;
        }>, "custom">;
    }>, "molecule-type">>;
    carbonLightness: PD.Numeric;
};
export declare function IllustrativeColorTheme(ctx: ThemeDataContext, props: PD.Values<IllustrativeColorThemeParams>): ColorTheme<IllustrativeColorThemeParams>;
export declare const IllustrativeColorThemeProvider: ColorTheme.Provider<IllustrativeColorThemeParams, 'illustrative'>;
