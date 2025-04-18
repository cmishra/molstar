"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpacefillRepresentationProvider = exports.SpacefillParams = void 0;
exports.getSpacefillParams = getSpacefillParams;
exports.SpacefillRepresentation = SpacefillRepresentation;
const element_sphere_1 = require("../visual/element-sphere");
const units_representation_1 = require("../units-representation");
const param_definition_1 = require("../../../mol-util/param-definition");
const representation_1 = require("../representation");
const representation_2 = require("../../../mol-repr/representation");
const base_1 = require("../../../mol-geo/geometry/base");
const SpacefillVisuals = {
    'element-sphere': (ctx, getParams) => (0, units_representation_1.UnitsRepresentation)('Sphere mesh/impostor', ctx, getParams, element_sphere_1.ElementSphereVisual),
    'structure-element-sphere': (ctx, getParams) => (0, representation_1.ComplexRepresentation)('Structure sphere mesh/impostor', ctx, getParams, element_sphere_1.StructureElementSphereVisual),
};
exports.SpacefillParams = {
    ...element_sphere_1.ElementSphereParams,
    bumpFrequency: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
    density: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, base_1.BaseGeometry.ShadingCategory),
    visuals: param_definition_1.ParamDefinition.MultiSelect(['element-sphere'], param_definition_1.ParamDefinition.objectToOptions(SpacefillVisuals)),
};
let CoarseGrainedSpacefillParams;
function getSpacefillParams(ctx, structure) {
    let params = exports.SpacefillParams;
    if (structure.isCoarseGrained) {
        if (!CoarseGrainedSpacefillParams) {
            CoarseGrainedSpacefillParams = param_definition_1.ParamDefinition.clone(exports.SpacefillParams);
            CoarseGrainedSpacefillParams.sizeFactor.defaultValue = 2;
        }
        params = CoarseGrainedSpacefillParams;
    }
    if (structure.unitSymmetryGroups.length > 5000) {
        params = param_definition_1.ParamDefinition.clone(params);
        params.visuals.defaultValue = ['structure-element-sphere'];
    }
    return params;
}
function SpacefillRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Spacefill', ctx, getParams, representation_1.StructureRepresentationStateBuilder, SpacefillVisuals);
}
exports.SpacefillRepresentationProvider = (0, representation_1.StructureRepresentationProvider)({
    name: 'spacefill',
    label: 'Spacefill',
    description: 'Displays atomic/coarse elements as spheres.',
    factory: SpacefillRepresentation,
    getParams: getSpacefillParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.SpacefillParams),
    defaultColorTheme: { name: 'element-symbol' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0
});
