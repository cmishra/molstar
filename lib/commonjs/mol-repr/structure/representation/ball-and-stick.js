"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BallAndStickRepresentationProvider = exports.BallAndStickParams = void 0;
exports.getBallAndStickParams = getBallAndStickParams;
exports.BallAndStickRepresentation = BallAndStickRepresentation;
const bond_intra_unit_cylinder_1 = require("../visual/bond-intra-unit-cylinder");
const bond_inter_unit_cylinder_1 = require("../visual/bond-inter-unit-cylinder");
const element_sphere_1 = require("../visual/element-sphere");
const param_definition_1 = require("../../../mol-util/param-definition");
const units_representation_1 = require("../units-representation");
const complex_representation_1 = require("../complex-representation");
const representation_1 = require("../representation");
const representation_2 = require("../../../mol-repr/representation");
const structure_1 = require("../../../mol-model/structure");
const params_1 = require("../params");
const base_1 = require("../../../mol-geo/geometry/base");
const BallAndStickVisuals = {
    'element-sphere': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Element sphere', ctx, getParams, element_sphere_1.ElementSphereVisual),
    'intra-bond': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Intra-unit bond cylinder', ctx, getParams, bond_intra_unit_cylinder_1.IntraUnitBondCylinderVisual),
    'inter-bond': (ctx, getParams) => (0, complex_representation_1.ComplexRepresentation)('Inter-unit bond cylinder', ctx, getParams, bond_inter_unit_cylinder_1.InterUnitBondCylinderVisual),
    'structure-element-sphere': (ctx, getParams) => (0, complex_representation_1.ComplexRepresentation)('Structure element sphere', ctx, getParams, element_sphere_1.StructureElementSphereVisual),
    'structure-intra-bond': (ctx, getParams) => (0, complex_representation_1.ComplexRepresentation)('Structure intra-unit bond cylinder', ctx, getParams, bond_intra_unit_cylinder_1.StructureIntraUnitBondCylinderVisual),
};
exports.BallAndStickParams = {
    ...element_sphere_1.ElementSphereParams,
    traceOnly: param_definition_1.ParamDefinition.Boolean(false, { isHidden: true }), // not useful here
    ...bond_intra_unit_cylinder_1.IntraUnitBondCylinderParams,
    ...bond_inter_unit_cylinder_1.InterUnitBondCylinderParams,
    includeParent: param_definition_1.ParamDefinition.Boolean(false),
    unitKinds: (0, params_1.getUnitKindsParam)(['atomic']),
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.15, { min: 0.01, max: 10, step: 0.01 }),
    sizeAspectRatio: param_definition_1.ParamDefinition.Numeric(2 / 3, { min: 0.01, max: 3, step: 0.01 }),
    visuals: param_definition_1.ParamDefinition.MultiSelect(['element-sphere', 'intra-bond', 'inter-bond'], param_definition_1.ParamDefinition.objectToOptions(BallAndStickVisuals)),
    bumpFrequency: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
    density: param_definition_1.ParamDefinition.Numeric(0.1, { min: 0, max: 1, step: 0.01 }, base_1.BaseGeometry.ShadingCategory),
};
function getBallAndStickParams(ctx, structure) {
    let params = exports.BallAndStickParams;
    const size = structure_1.Structure.getSize(structure);
    if (size >= structure_1.Structure.Size.Huge) {
        params = param_definition_1.ParamDefinition.clone(params);
        params.visuals.defaultValue = ['element-sphere', 'intra-bond'];
    }
    else if (structure.unitSymmetryGroups.length > 5000) {
        params = param_definition_1.ParamDefinition.clone(params);
        params.visuals.defaultValue = ['structure-element-sphere', 'structure-intra-bond'];
    }
    return params;
}
function BallAndStickRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Ball & Stick', ctx, getParams, representation_1.StructureRepresentationStateBuilder, BallAndStickVisuals);
}
exports.BallAndStickRepresentationProvider = (0, representation_1.StructureRepresentationProvider)({
    name: 'ball-and-stick',
    label: 'Ball & Stick',
    description: 'Displays atoms as spheres and bonds as cylinders.',
    factory: BallAndStickRepresentation,
    getParams: getBallAndStickParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.BallAndStickParams),
    defaultColorTheme: { name: 'element-symbol' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0,
    getData: (structure, props) => {
        return props.includeParent ? structure.asParent() : structure;
    },
    mustRecreate: (oldProps, newProps) => {
        return oldProps.includeParent !== newProps.includeParent;
    }
});
