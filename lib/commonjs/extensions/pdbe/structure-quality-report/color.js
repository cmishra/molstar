"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureQualityReportColorThemeProvider = exports.StructureQualityReportColorThemeParams = void 0;
exports.StructureQualityReportColorTheme = StructureQualityReportColorTheme;
const prop_1 = require("./prop");
const structure_1 = require("../../../mol-model/structure");
const color_1 = require("../../../mol-util/color");
const legend_1 = require("../../../mol-util/legend");
const param_definition_1 = require("../../../mol-util/param-definition");
const categories_1 = require("../../../mol-theme/color/categories");
const ValidationColors = [
    color_1.Color.fromRgb(170, 170, 170), // not applicable
    color_1.Color.fromRgb(0, 255, 0), // 0 issues
    color_1.Color.fromRgb(255, 255, 0), // 1
    color_1.Color.fromRgb(255, 128, 0), // 2
    color_1.Color.fromRgb(255, 0, 0), // 3 or more
];
const ValidationColorTable = [
    ['No Issues', ValidationColors[1]],
    ['One Issue', ValidationColors[2]],
    ['Two Issues', ValidationColors[3]],
    ['Three Or More Issues', ValidationColors[4]],
    ['Not Applicable', ValidationColors[9]]
];
exports.StructureQualityReportColorThemeParams = {
    type: param_definition_1.ParamDefinition.MappedStatic('issue-count', {
        'issue-count': param_definition_1.ParamDefinition.Group({}),
        'specific-issue': param_definition_1.ParamDefinition.Group({
            kind: param_definition_1.ParamDefinition.Text()
        })
    })
};
function StructureQualityReportColorTheme(ctx, props) {
    let color;
    if (ctx.structure && !ctx.structure.isEmpty && ctx.structure.models[0].customProperties.has(prop_1.StructureQualityReportProvider.descriptor)) {
        const getIssues = prop_1.StructureQualityReport.getIssues;
        const l = structure_1.StructureElement.Location.create(ctx.structure);
        if (props.type.name === 'issue-count') {
            color = (location) => {
                if (structure_1.StructureElement.Location.is(location)) {
                    return ValidationColors[Math.min(3, getIssues(location).length) + 1];
                }
                else if (structure_1.Bond.isLocation(location)) {
                    l.unit = location.aUnit;
                    l.element = location.aUnit.elements[location.aIndex];
                    return ValidationColors[Math.min(3, getIssues(l).length) + 1];
                }
                return ValidationColors[0];
            };
        }
        else {
            const issue = props.type.params.kind;
            color = (location) => {
                if (structure_1.StructureElement.Location.is(location) && getIssues(location).indexOf(issue) >= 0) {
                    return ValidationColors[4];
                }
                else if (structure_1.Bond.isLocation(location)) {
                    l.unit = location.aUnit;
                    l.element = location.aUnit.elements[location.aIndex];
                    return ValidationColors[Math.min(3, getIssues(l).length) + 1];
                }
                return ValidationColors[0];
            };
        }
    }
    else {
        color = () => ValidationColors[0];
    }
    return {
        factory: StructureQualityReportColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color: color,
        props: props,
        description: 'Assigns residue colors according to the number of quality issues or a specific quality issue. Data from wwPDB Validation Report, obtained via PDBe.',
        legend: (0, legend_1.TableLegend)(ValidationColorTable)
    };
}
exports.StructureQualityReportColorThemeProvider = {
    name: 'pdbe-structure-quality-report',
    label: 'Structure Quality Report',
    category: categories_1.ColorThemeCategory.Validation,
    factory: StructureQualityReportColorTheme,
    getParams: ctx => {
        const issueTypes = prop_1.StructureQualityReport.getIssueTypes(ctx.structure);
        if (issueTypes.length === 0) {
            return {
                type: param_definition_1.ParamDefinition.MappedStatic('issue-count', {
                    'issue-count': param_definition_1.ParamDefinition.Group({})
                })
            };
        }
        return {
            type: param_definition_1.ParamDefinition.MappedStatic('issue-count', {
                'issue-count': param_definition_1.ParamDefinition.Group({}),
                'specific-issue': param_definition_1.ParamDefinition.Group({
                    kind: param_definition_1.ParamDefinition.Select(issueTypes[0], param_definition_1.ParamDefinition.arrayToOptions(issueTypes))
                }, { isFlat: true })
            })
        };
    },
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.StructureQualityReportColorThemeParams),
    isApplicable: (ctx) => { var _a; return prop_1.StructureQualityReport.isApplicable((_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.models[0]); },
    ensureCustomProperties: {
        attach: (ctx, data) => data.structure ? prop_1.StructureQualityReportProvider.attach(ctx, data.structure.models[0], void 0, true) : Promise.resolve(),
        detach: (data) => data.structure && prop_1.StructureQualityReportProvider.ref(data.structure.models[0], false)
    }
};
