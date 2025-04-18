"use strict";
/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineRepresentationProvider = exports.LineParams = void 0;
exports.getLineParams = getLineParams;
exports.LineRepresentation = LineRepresentation;
const bond_intra_unit_line_1 = require("../visual/bond-intra-unit-line");
const bond_inter_unit_line_1 = require("../visual/bond-inter-unit-line");
const param_definition_1 = require("../../../mol-util/param-definition");
const units_representation_1 = require("../units-representation");
const complex_representation_1 = require("../complex-representation");
const representation_1 = require("../representation");
const representation_2 = require("../../../mol-repr/representation");
const structure_1 = require("../../../mol-model/structure");
const params_1 = require("../params");
const element_point_1 = require("../visual/element-point");
const element_cross_1 = require("../visual/element-cross");
const points_1 = require("../../../mol-geo/geometry/points/points");
const base_1 = require("../../../mol-geo/geometry/base");
const LineVisuals = {
    'intra-bond': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Intra-unit bond line', ctx, getParams, bond_intra_unit_line_1.IntraUnitBondLineVisual),
    'inter-bond': (ctx, getParams) => (0, complex_representation_1.ComplexRepresentation)('Inter-unit bond line', ctx, getParams, bond_inter_unit_line_1.InterUnitBondLineVisual),
    'element-point': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Points', ctx, getParams, element_point_1.ElementPointVisual),
    'element-cross': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Crosses', ctx, getParams, element_cross_1.ElementCrossVisual),
    'structure-intra-bond': (ctx, getParams) => (0, complex_representation_1.ComplexRepresentation)('Structure intra-unit bond line', ctx, getParams, bond_intra_unit_line_1.StructureIntraUnitBondLineVisual),
    'structure-element-point': (ctx, getParams) => (0, complex_representation_1.ComplexRepresentation)('Structure element points', ctx, getParams, element_point_1.StructureElementPointVisual),
    'structure-element-cross': (ctx, getParams) => (0, complex_representation_1.ComplexRepresentation)('Structure element crosses', ctx, getParams, element_cross_1.StructureElementCrossVisual),
};
exports.LineParams = {
    ...bond_intra_unit_line_1.IntraUnitBondLineParams,
    ...bond_inter_unit_line_1.InterUnitBondLineParams,
    ...element_point_1.ElementPointParams,
    ...element_cross_1.ElementCrossParams,
    pointStyle: param_definition_1.ParamDefinition.Select('circle', param_definition_1.ParamDefinition.objectToOptions(points_1.Points.StyleTypes)),
    multipleBonds: param_definition_1.ParamDefinition.Select('offset', param_definition_1.ParamDefinition.arrayToOptions(['off', 'symmetric', 'offset'])),
    includeParent: param_definition_1.ParamDefinition.Boolean(false),
    sizeFactor: param_definition_1.ParamDefinition.Numeric(2, { min: 0.01, max: 10, step: 0.01 }),
    unitKinds: (0, params_1.getUnitKindsParam)(['atomic']),
    visuals: param_definition_1.ParamDefinition.MultiSelect(['intra-bond', 'inter-bond', 'element-point', 'element-cross'], param_definition_1.ParamDefinition.objectToOptions(LineVisuals)),
    density: param_definition_1.ParamDefinition.Numeric(0.1, { min: 0, max: 1, step: 0.01 }, base_1.BaseGeometry.ShadingCategory),
};
function getLineParams(ctx, structure) {
    let params = exports.LineParams;
    const size = structure_1.Structure.getSize(structure);
    if (size >= structure_1.Structure.Size.Huge) {
        params = param_definition_1.ParamDefinition.clone(params);
        params.visuals.defaultValue = ['intra-bond', 'element-point', 'element-cross'];
    }
    else if (structure.unitSymmetryGroups.length > 5000) {
        params = param_definition_1.ParamDefinition.clone(params);
        params.visuals.defaultValue = ['structure-intra-bond', 'structure-element-point', 'structure-element-cross'];
    }
    return params;
}
function LineRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Line', ctx, getParams, representation_1.StructureRepresentationStateBuilder, LineVisuals);
}
exports.LineRepresentationProvider = (0, representation_1.StructureRepresentationProvider)({
    name: 'line',
    label: 'Line',
    description: 'Displays bonds as lines and atoms as points or croses.',
    factory: LineRepresentation,
    getParams: getLineParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.LineParams),
    defaultColorTheme: { name: 'element-symbol' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.elementCount > 0,
    getData: (structure, props) => {
        return props.includeParent ? structure.asParent() : structure;
    },
    mustRecreate: (oldProps, newProps) => {
        return oldProps.includeParent !== newProps.includeParent;
    }
});
