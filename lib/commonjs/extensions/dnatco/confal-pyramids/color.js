"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfalPyramidsColorThemeProvider = exports.ConfalPyramidsColorThemeParams = void 0;
exports.getConfalPyramidsColorThemeParams = getConfalPyramidsColorThemeParams;
exports.ConfalPyramidsColorTheme = ConfalPyramidsColorTheme;
const color_1 = require("../color");
const property_1 = require("./property");
const types_1 = require("./types");
const property_2 = require("../property");
const color_2 = require("../../../mol-util/color");
const params_1 = require("../../../mol-util/color/params");
const param_definition_1 = require("../../../mol-util/param-definition");
const legend_1 = require("../../../mol-util/legend");
const type_helpers_1 = require("../../../mol-util/type-helpers");
const categories_1 = require("../../../mol-theme/color/categories");
const Description = 'Assigns colors to confal pyramids';
const PyramidsColors = (0, color_2.ColorMap)({ ...color_1.NtCColors });
exports.ConfalPyramidsColorThemeParams = {
    colors: param_definition_1.ParamDefinition.MappedStatic('default', {
        'default': param_definition_1.ParamDefinition.EmptyGroup(),
        'custom': param_definition_1.ParamDefinition.Group((0, params_1.getColorMapParams)(PyramidsColors))
    }),
};
function getConfalPyramidsColorThemeParams(ctx) {
    return param_definition_1.ParamDefinition.clone(exports.ConfalPyramidsColorThemeParams);
}
function ConfalPyramidsColorTheme(ctx, props) {
    const colorMap = props.colors.name === 'default' ? PyramidsColors : props.colors.params;
    function color(location, isSecondary) {
        var _a;
        if (types_1.ConfalPyramidsTypes.isLocation(location)) {
            const { step, isLower } = location.data;
            const key = step.NtC + `_${isLower ? 'Lwr' : 'Upr'}`;
            return (_a = colorMap[key]) !== null && _a !== void 0 ? _a : color_1.ErrorColor;
        }
        return color_1.ErrorColor;
    }
    return {
        factory: ConfalPyramidsColorTheme,
        granularity: 'group',
        color,
        props,
        description: Description,
        legend: (0, legend_1.TableLegend)((0, type_helpers_1.ObjectKeys)(colorMap).map(k => [k.replace('_', ' '), colorMap[k]]).concat([['Error', color_1.ErrorColor]])),
    };
}
exports.ConfalPyramidsColorThemeProvider = {
    name: 'confal-pyramids',
    label: 'Confal Pyramids',
    category: categories_1.ColorThemeCategory.Residue,
    factory: ConfalPyramidsColorTheme,
    getParams: getConfalPyramidsColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.ConfalPyramidsColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure && ctx.structure.models.some(m => property_2.Dnatco.isApplicable(m)),
    ensureCustomProperties: {
        attach: (ctx, data) => data.structure ? property_1.ConfalPyramidsProvider.attach(ctx, data.structure.models[0], void 0, true) : Promise.resolve(),
        detach: (data) => data.structure && property_1.ConfalPyramidsProvider.ref(data.structure.models[0], false)
    }
};
