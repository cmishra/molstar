/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { ElementSymbol } from '../../mol-model/structure/model/types';
import { Color, ColorMap } from '../../mol-util/color';
import type { ColorTheme } from '../color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../theme';
export declare const ElementSymbolColors: ColorMap<{
    H: number;
    D: number;
    T: number;
    HE: number;
    LI: number;
    BE: number;
    B: number;
    C: number;
    N: number;
    O: number;
    F: number;
    NE: number;
    NA: number;
    MG: number;
    AL: number;
    SI: number;
    P: number;
    S: number;
    CL: number;
    AR: number;
    K: number;
    CA: number;
    SC: number;
    TI: number;
    V: number;
    CR: number;
    MN: number;
    FE: number;
    CO: number;
    NI: number;
    CU: number;
    ZN: number;
    GA: number;
    GE: number;
    AS: number;
    SE: number;
    BR: number;
    KR: number;
    RB: number;
    SR: number;
    Y: number;
    ZR: number;
    NB: number;
    MO: number;
    TC: number;
    RU: number;
    RH: number;
    PD: number;
    AG: number;
    CD: number;
    IN: number;
    SN: number;
    SB: number;
    TE: number;
    I: number;
    XE: number;
    CS: number;
    BA: number;
    LA: number;
    CE: number;
    PR: number;
    ND: number;
    PM: number;
    SM: number;
    EU: number;
    GD: number;
    TB: number;
    DY: number;
    HO: number;
    ER: number;
    TM: number;
    YB: number;
    LU: number;
    HF: number;
    TA: number;
    W: number;
    RE: number;
    OS: number;
    IR: number;
    PT: number;
    AU: number;
    HG: number;
    TL: number;
    PB: number;
    BI: number;
    PO: number;
    AT: number;
    RN: number;
    FR: number;
    RA: number;
    AC: number;
    TH: number;
    PA: number;
    U: number;
    NP: number;
    PU: number;
    AM: number;
    CM: number;
    BK: number;
    CF: number;
    ES: number;
    FM: number;
    MD: number;
    NO: number;
    LR: number;
    RF: number;
    DB: number;
    SG: number;
    BH: number;
    HS: number;
    MT: number;
    DS: number;
    RG: number;
    CN: number;
    UUT: number;
    FL: number;
    UUP: number;
    LV: number;
    UUH: number;
}>;
export type ElementSymbolColors = typeof ElementSymbolColors;
export declare const ElementSymbolColorThemeParams: {
    carbonColor: PD.Mapped<PD.NamedParams<PD.Normalize<{
        value: Color;
        saturation: number;
        lightness: number;
    }>, "uniform"> | PD.NamedParams<PD.Normalize<unknown>, "element-symbol"> | PD.NamedParams<PD.Normalize<{
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
    }>, "operator-name"> | PD.NamedParams<PD.Normalize<{
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
    }>, "unit-index"> | PD.NamedParams<PD.Normalize<{
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
    }>, "trajectory-index">>;
    saturation: PD.Numeric;
    lightness: PD.Numeric;
    colors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "default"> | PD.NamedParams<PD.Normalize<{
        H: Color;
        D: Color;
        T: Color;
        HE: Color;
        LI: Color;
        BE: Color;
        B: Color;
        C: Color;
        N: Color;
        O: Color;
        F: Color;
        NE: Color;
        NA: Color;
        MG: Color;
        AL: Color;
        SI: Color;
        P: Color;
        S: Color;
        CL: Color;
        AR: Color;
        K: Color;
        CA: Color;
        SC: Color;
        TI: Color;
        V: Color;
        CR: Color;
        MN: Color;
        FE: Color;
        CO: Color;
        NI: Color;
        CU: Color;
        ZN: Color;
        GA: Color;
        GE: Color;
        AS: Color;
        SE: Color;
        BR: Color;
        KR: Color;
        RB: Color;
        SR: Color;
        Y: Color;
        ZR: Color;
        NB: Color;
        MO: Color;
        TC: Color;
        RU: Color;
        RH: Color;
        PD: Color;
        AG: Color;
        CD: Color;
        IN: Color;
        SN: Color;
        SB: Color;
        TE: Color;
        I: Color;
        XE: Color;
        CS: Color;
        BA: Color;
        LA: Color;
        CE: Color;
        PR: Color;
        ND: Color;
        PM: Color;
        SM: Color;
        EU: Color;
        GD: Color;
        TB: Color;
        DY: Color;
        HO: Color;
        ER: Color;
        TM: Color;
        YB: Color;
        LU: Color;
        HF: Color;
        TA: Color;
        W: Color;
        RE: Color;
        OS: Color;
        IR: Color;
        PT: Color;
        AU: Color;
        HG: Color;
        TL: Color;
        PB: Color;
        BI: Color;
        PO: Color;
        AT: Color;
        RN: Color;
        FR: Color;
        RA: Color;
        AC: Color;
        TH: Color;
        PA: Color;
        U: Color;
        NP: Color;
        PU: Color;
        AM: Color;
        CM: Color;
        BK: Color;
        CF: Color;
        ES: Color;
        FM: Color;
        MD: Color;
        NO: Color;
        LR: Color;
        RF: Color;
        DB: Color;
        SG: Color;
        BH: Color;
        HS: Color;
        MT: Color;
        DS: Color;
        RG: Color;
        CN: Color;
        UUT: Color;
        FL: Color;
        UUP: Color;
        LV: Color;
        UUH: Color;
    }>, "custom">>;
};
export type ElementSymbolColorThemeParams = typeof ElementSymbolColorThemeParams;
export declare function getElementSymbolColorThemeParams(ctx: ThemeDataContext): {
    carbonColor: PD.Mapped<PD.NamedParams<PD.Normalize<{
        value: Color;
        saturation: number;
        lightness: number;
    }>, "uniform"> | PD.NamedParams<PD.Normalize<unknown>, "element-symbol"> | PD.NamedParams<PD.Normalize<{
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
    }>, "operator-name"> | PD.NamedParams<PD.Normalize<{
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
    }>, "unit-index"> | PD.NamedParams<PD.Normalize<{
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
    }>, "trajectory-index">>;
    saturation: PD.Numeric;
    lightness: PD.Numeric;
    colors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "default"> | PD.NamedParams<PD.Normalize<{
        H: Color;
        D: Color;
        T: Color;
        HE: Color;
        LI: Color;
        BE: Color;
        B: Color;
        C: Color;
        N: Color;
        O: Color;
        F: Color;
        NE: Color;
        NA: Color;
        MG: Color;
        AL: Color;
        SI: Color;
        P: Color;
        S: Color;
        CL: Color;
        AR: Color;
        K: Color;
        CA: Color;
        SC: Color;
        TI: Color;
        V: Color;
        CR: Color;
        MN: Color;
        FE: Color;
        CO: Color;
        NI: Color;
        CU: Color;
        ZN: Color;
        GA: Color;
        GE: Color;
        AS: Color;
        SE: Color;
        BR: Color;
        KR: Color;
        RB: Color;
        SR: Color;
        Y: Color;
        ZR: Color;
        NB: Color;
        MO: Color;
        TC: Color;
        RU: Color;
        RH: Color;
        PD: Color;
        AG: Color;
        CD: Color;
        IN: Color;
        SN: Color;
        SB: Color;
        TE: Color;
        I: Color;
        XE: Color;
        CS: Color;
        BA: Color;
        LA: Color;
        CE: Color;
        PR: Color;
        ND: Color;
        PM: Color;
        SM: Color;
        EU: Color;
        GD: Color;
        TB: Color;
        DY: Color;
        HO: Color;
        ER: Color;
        TM: Color;
        YB: Color;
        LU: Color;
        HF: Color;
        TA: Color;
        W: Color;
        RE: Color;
        OS: Color;
        IR: Color;
        PT: Color;
        AU: Color;
        HG: Color;
        TL: Color;
        PB: Color;
        BI: Color;
        PO: Color;
        AT: Color;
        RN: Color;
        FR: Color;
        RA: Color;
        AC: Color;
        TH: Color;
        PA: Color;
        U: Color;
        NP: Color;
        PU: Color;
        AM: Color;
        CM: Color;
        BK: Color;
        CF: Color;
        ES: Color;
        FM: Color;
        MD: Color;
        NO: Color;
        LR: Color;
        RF: Color;
        DB: Color;
        SG: Color;
        BH: Color;
        HS: Color;
        MT: Color;
        DS: Color;
        RG: Color;
        CN: Color;
        UUT: Color;
        FL: Color;
        UUP: Color;
        LV: Color;
        UUH: Color;
    }>, "custom">>;
};
export declare function elementSymbolColor(colorMap: ElementSymbolColors, element: ElementSymbol): Color;
export declare function ElementSymbolColorTheme(ctx: ThemeDataContext, props: PD.Values<ElementSymbolColorThemeParams>): ColorTheme<ElementSymbolColorThemeParams>;
export declare const ElementSymbolColorThemeProvider: ColorTheme.Provider<ElementSymbolColorThemeParams, 'element-symbol'>;
