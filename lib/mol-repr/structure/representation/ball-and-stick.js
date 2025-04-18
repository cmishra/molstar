/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { IntraUnitBondCylinderVisual, IntraUnitBondCylinderParams, StructureIntraUnitBondCylinderVisual } from '../visual/bond-intra-unit-cylinder';
import { InterUnitBondCylinderParams, InterUnitBondCylinderVisual } from '../visual/bond-inter-unit-cylinder';
import { ElementSphereVisual, ElementSphereParams, StructureElementSphereVisual } from '../visual/element-sphere';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsRepresentation } from '../units-representation';
import { ComplexRepresentation } from '../complex-representation';
import { StructureRepresentationProvider, StructureRepresentationStateBuilder } from '../representation';
import { Representation } from '../../../mol-repr/representation';
import { Structure } from '../../../mol-model/structure';
import { getUnitKindsParam } from '../params';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
const BallAndStickVisuals = {
    'element-sphere': (ctx, getParams) => UnitsRepresentation('Element sphere', ctx, getParams, ElementSphereVisual),
    'intra-bond': (ctx, getParams) => UnitsRepresentation('Intra-unit bond cylinder', ctx, getParams, IntraUnitBondCylinderVisual),
    'inter-bond': (ctx, getParams) => ComplexRepresentation('Inter-unit bond cylinder', ctx, getParams, InterUnitBondCylinderVisual),
    'structure-element-sphere': (ctx, getParams) => ComplexRepresentation('Structure element sphere', ctx, getParams, StructureElementSphereVisual),
    'structure-intra-bond': (ctx, getParams) => ComplexRepresentation('Structure intra-unit bond cylinder', ctx, getParams, StructureIntraUnitBondCylinderVisual),
};
export const BallAndStickParams = {
    ...ElementSphereParams,
    traceOnly: PD.Boolean(false, { isHidden: true }), // not useful here
    ...IntraUnitBondCylinderParams,
    ...InterUnitBondCylinderParams,
    includeParent: PD.Boolean(false),
    unitKinds: getUnitKindsParam(['atomic']),
    sizeFactor: PD.Numeric(0.15, { min: 0.01, max: 10, step: 0.01 }),
    sizeAspectRatio: PD.Numeric(2 / 3, { min: 0.01, max: 3, step: 0.01 }),
    visuals: PD.MultiSelect(['element-sphere', 'intra-bond', 'inter-bond'], PD.objectToOptions(BallAndStickVisuals)),
    bumpFrequency: PD.Numeric(0, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory),
    density: PD.Numeric(0.1, { min: 0, max: 1, step: 0.01 }, BaseGeometry.ShadingCategory),
};
export function getBallAndStickParams(ctx, structure) {
    let params = BallAndStickParams;
    const size = Structure.getSize(structure);
    if (size >= Structure.Size.Huge) {
        params = PD.clone(params);
        params.visuals.defaultValue = ['element-sphere', 'intra-bond'];
    }
    else if (structure.unitSymmetryGroups.length > 5000) {
        params = PD.clone(params);
        params.visuals.defaultValue = ['structure-element-sphere', 'structure-intra-bond'];
    }
    return params;
}
export function BallAndStickRepresentation(ctx, getParams) {
    return Representation.createMulti('Ball & Stick', ctx, getParams, StructureRepresentationStateBuilder, BallAndStickVisuals);
}
export const BallAndStickRepresentationProvider = StructureRepresentationProvider({
    name: 'ball-and-stick',
    label: 'Ball & Stick',
    description: 'Displays atoms as spheres and bonds as cylinders.',
    factory: BallAndStickRepresentation,
    getParams: getBallAndStickParams,
    defaultValues: PD.getDefaultValues(BallAndStickParams),
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
