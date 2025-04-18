"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EllipsoidRepresentationProvider = exports.EllipsoidParams = void 0;
exports.getEllipsoidParams = getEllipsoidParams;
exports.EllipsoidRepresentation = EllipsoidRepresentation;
const param_definition_1 = require("../../../mol-util/param-definition");
const representation_1 = require("../../../mol-repr/representation");
const structure_1 = require("../../../mol-model/structure");
const representation_2 = require("../../../mol-repr/structure/representation");
const ellipsoid_mesh_1 = require("../visual/ellipsoid-mesh");
const anisotropic_1 = require("../../../mol-model-formats/structure/property/anisotropic");
const bond_intra_unit_cylinder_1 = require("../visual/bond-intra-unit-cylinder");
const bond_inter_unit_cylinder_1 = require("../visual/bond-inter-unit-cylinder");
const params_1 = require("../params");
const base_1 = require("../../../mol-geo/geometry/base");
const EllipsoidVisuals = {
    'ellipsoid-mesh': (ctx, getParams) => (0, representation_2.UnitsRepresentation)('Ellipsoid Mesh', ctx, getParams, ellipsoid_mesh_1.EllipsoidMeshVisual),
    'intra-bond': (ctx, getParams) => (0, representation_2.UnitsRepresentation)('Intra-unit bond cylinder', ctx, getParams, bond_intra_unit_cylinder_1.IntraUnitBondCylinderVisual),
    'inter-bond': (ctx, getParams) => (0, representation_2.ComplexRepresentation)('Inter-unit bond cylinder', ctx, getParams, bond_inter_unit_cylinder_1.InterUnitBondCylinderVisual),
    'structure-ellipsoid-mesh': (ctx, getParams) => (0, representation_2.ComplexRepresentation)('Structure Ellipsoid Mesh', ctx, getParams, ellipsoid_mesh_1.StructureEllipsoidMeshVisual),
    'structure-intra-bond': (ctx, getParams) => (0, representation_2.ComplexRepresentation)('Structure intra-unit bond cylinder', ctx, getParams, bond_intra_unit_cylinder_1.StructureIntraUnitBondCylinderVisual),
};
exports.EllipsoidParams = {
    ...ellipsoid_mesh_1.EllipsoidMeshParams,
    ...bond_intra_unit_cylinder_1.IntraUnitBondCylinderParams,
    ...bond_inter_unit_cylinder_1.InterUnitBondCylinderParams,
    includeParent: param_definition_1.ParamDefinition.Boolean(false),
    adjustCylinderLength: param_definition_1.ParamDefinition.Boolean(false, { isHidden: true }), // not useful here
    unitKinds: (0, params_1.getUnitKindsParam)(['atomic']),
    sizeFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0.01, max: 10, step: 0.01 }),
    sizeAspectRatio: param_definition_1.ParamDefinition.Numeric(0.1, { min: 0.01, max: 3, step: 0.01 }),
    linkCap: param_definition_1.ParamDefinition.Boolean(true),
    visuals: param_definition_1.ParamDefinition.MultiSelect(['ellipsoid-mesh', 'intra-bond', 'inter-bond'], param_definition_1.ParamDefinition.objectToOptions(EllipsoidVisuals)),
    bumpFrequency: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
};
function getEllipsoidParams(ctx, structure) {
    let params = exports.EllipsoidParams;
    const size = structure_1.Structure.getSize(structure);
    if (size >= structure_1.Structure.Size.Huge) {
        params = param_definition_1.ParamDefinition.clone(params);
        params.visuals.defaultValue = ['ellipsoid-mesh', 'intra-bond'];
    }
    else if (structure.unitSymmetryGroups.length > 5000) {
        params = param_definition_1.ParamDefinition.clone(params);
        params.visuals.defaultValue = ['structure-ellipsoid-mesh', 'structure-intra-bond'];
    }
    return params;
}
function EllipsoidRepresentation(ctx, getParams) {
    return representation_1.Representation.createMulti('Ellipsoid', ctx, getParams, representation_2.StructureRepresentationStateBuilder, EllipsoidVisuals);
}
exports.EllipsoidRepresentationProvider = (0, representation_2.StructureRepresentationProvider)({
    name: 'ellipsoid',
    label: 'Ellipsoid',
    description: 'Displays anisotropic displacement ellipsoids of atomic elements plus bonds as cylinders.',
    factory: EllipsoidRepresentation,
    getParams: getEllipsoidParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.EllipsoidParams),
    defaultColorTheme: { name: 'element-symbol' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.elementCount > 0 && structure.models.some(m => anisotropic_1.AtomSiteAnisotrop.Provider.isApplicable(m)),
    getData: (structure, props) => {
        return props.includeParent ? structure.asParent() : structure;
    },
    mustRecreate: (oldProps, newProps) => {
        return oldProps.includeParent !== newProps.includeParent;
    }
});
