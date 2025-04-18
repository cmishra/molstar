/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Representation } from '../../../mol-repr/representation';
import { Structure } from '../../../mol-model/structure';
import { UnitsRepresentation, StructureRepresentationStateBuilder, StructureRepresentationProvider, ComplexRepresentation } from '../../../mol-repr/structure/representation';
import { EllipsoidMeshParams, EllipsoidMeshVisual, StructureEllipsoidMeshVisual } from '../visual/ellipsoid-mesh';
import { AtomSiteAnisotrop } from '../../../mol-model-formats/structure/property/anisotropic';
import { IntraUnitBondCylinderParams, IntraUnitBondCylinderVisual, StructureIntraUnitBondCylinderVisual } from '../visual/bond-intra-unit-cylinder';
import { InterUnitBondCylinderVisual, InterUnitBondCylinderParams } from '../visual/bond-inter-unit-cylinder';
import { getUnitKindsParam } from '../params';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
const EllipsoidVisuals = {
    'ellipsoid-mesh': (ctx, getParams) => UnitsRepresentation('Ellipsoid Mesh', ctx, getParams, EllipsoidMeshVisual),
    'intra-bond': (ctx, getParams) => UnitsRepresentation('Intra-unit bond cylinder', ctx, getParams, IntraUnitBondCylinderVisual),
    'inter-bond': (ctx, getParams) => ComplexRepresentation('Inter-unit bond cylinder', ctx, getParams, InterUnitBondCylinderVisual),
    'structure-ellipsoid-mesh': (ctx, getParams) => ComplexRepresentation('Structure Ellipsoid Mesh', ctx, getParams, StructureEllipsoidMeshVisual),
    'structure-intra-bond': (ctx, getParams) => ComplexRepresentation('Structure intra-unit bond cylinder', ctx, getParams, StructureIntraUnitBondCylinderVisual),
};
export const EllipsoidParams = {
    ...EllipsoidMeshParams,
    ...IntraUnitBondCylinderParams,
    ...InterUnitBondCylinderParams,
    includeParent: PD.Boolean(false),
    adjustCylinderLength: PD.Boolean(false, { isHidden: true }), // not useful here
    unitKinds: getUnitKindsParam(['atomic']),
    sizeFactor: PD.Numeric(1, { min: 0.01, max: 10, step: 0.01 }),
    sizeAspectRatio: PD.Numeric(0.1, { min: 0.01, max: 3, step: 0.01 }),
    linkCap: PD.Boolean(true),
    visuals: PD.MultiSelect(['ellipsoid-mesh', 'intra-bond', 'inter-bond'], PD.objectToOptions(EllipsoidVisuals)),
    bumpFrequency: PD.Numeric(0, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory),
};
export function getEllipsoidParams(ctx, structure) {
    let params = EllipsoidParams;
    const size = Structure.getSize(structure);
    if (size >= Structure.Size.Huge) {
        params = PD.clone(params);
        params.visuals.defaultValue = ['ellipsoid-mesh', 'intra-bond'];
    }
    else if (structure.unitSymmetryGroups.length > 5000) {
        params = PD.clone(params);
        params.visuals.defaultValue = ['structure-ellipsoid-mesh', 'structure-intra-bond'];
    }
    return params;
}
export function EllipsoidRepresentation(ctx, getParams) {
    return Representation.createMulti('Ellipsoid', ctx, getParams, StructureRepresentationStateBuilder, EllipsoidVisuals);
}
export const EllipsoidRepresentationProvider = StructureRepresentationProvider({
    name: 'ellipsoid',
    label: 'Ellipsoid',
    description: 'Displays anisotropic displacement ellipsoids of atomic elements plus bonds as cylinders.',
    factory: EllipsoidRepresentation,
    getParams: getEllipsoidParams,
    defaultValues: PD.getDefaultValues(EllipsoidParams),
    defaultColorTheme: { name: 'element-symbol' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.elementCount > 0 && structure.models.some(m => AtomSiteAnisotrop.Provider.isApplicable(m)),
    getData: (structure, props) => {
        return props.includeParent ? structure.asParent() : structure;
    },
    mustRecreate: (oldProps, newProps) => {
        return oldProps.includeParent !== newProps.includeParent;
    }
});
