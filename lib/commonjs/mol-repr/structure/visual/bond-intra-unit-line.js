"use strict";
/**
 * Copyright (c) 2020-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureIntraUnitBondLineParams = exports.IntraUnitBondLineParams = void 0;
exports.IntraUnitBondLineVisual = IntraUnitBondLineVisual;
exports.StructureIntraUnitBondLineVisual = StructureIntraUnitBondLineVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const structure_1 = require("../../../mol-model/structure");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const mol_util_1 = require("../../../mol-util");
const link_1 = require("./util/link");
const units_visual_1 = require("../units-visual");
const types_1 = require("../../../mol-model/structure/model/types");
const bond_1 = require("./util/bond");
const geometry_1 = require("../../../mol-math/geometry");
const lines_1 = require("../../../mol-geo/geometry/lines/lines");
const graph_1 = require("../../../mol-math/graph");
const array_1 = require("../../../mol-util/array");
const complex_visual_1 = require("../complex-visual");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const isBondType = types_1.BondType.is;
function getIntraUnitBondLineBuilderProps(unit, structure, theme, props) {
    const location = structure_1.StructureElement.Location.create(structure, unit);
    const elements = unit.elements;
    const bonds = unit.bonds;
    const { edgeCount, a, b, edgeProps, offset } = bonds;
    const { order: _order, flags: _flags } = edgeProps;
    const { sizeFactor, aromaticBonds, includeTypes, excludeTypes, multipleBonds } = props;
    const mbOff = multipleBonds === 'off';
    const mbSymmetric = multipleBonds === 'symmetric';
    const include = types_1.BondType.fromNames(includeTypes);
    const exclude = types_1.BondType.fromNames(excludeTypes);
    const ignoreComputedAromatic = (0, bond_1.ignoreBondType)(include, exclude, 32 /* BondType.Flag.Computed */);
    const vRef = (0, linear_algebra_1.Vec3)();
    const c = unit.conformation;
    const { elementRingIndices, elementAromaticRingIndices } = unit.rings;
    const deloTriplets = aromaticBonds ? unit.resonance.delocalizedTriplets : undefined;
    return {
        linkCount: edgeCount * 2,
        referencePosition: (edgeIndex) => {
            let aI = a[edgeIndex], bI = b[edgeIndex];
            const rI = deloTriplets === null || deloTriplets === void 0 ? void 0 : deloTriplets.getThirdElement(aI, bI);
            if (rI !== undefined)
                return c.invariantPosition(elements[rI], vRef);
            if (aI > bI)
                [aI, bI] = [bI, aI];
            if (offset[aI + 1] - offset[aI] === 1)
                [aI, bI] = [bI, aI];
            const aR = elementAromaticRingIndices.get(aI) || elementRingIndices.get(aI);
            let maxSize = 0;
            for (let i = offset[aI], il = offset[aI + 1]; i < il; ++i) {
                const _bI = b[i];
                if (_bI !== bI && _bI !== aI) {
                    if (aR) {
                        const _bR = elementAromaticRingIndices.get(_bI) || elementRingIndices.get(_bI);
                        if (!_bR)
                            continue;
                        const size = (0, array_1.arrayIntersectionSize)(aR, _bR);
                        if (size > maxSize) {
                            maxSize = size;
                            c.invariantPosition(elements[_bI], vRef);
                        }
                    }
                    else {
                        return c.invariantPosition(elements[_bI], vRef);
                    }
                }
            }
            return maxSize > 0 ? vRef : null;
        },
        position: (posA, posB, edgeIndex, _adjust) => {
            c.invariantPosition(elements[a[edgeIndex]], posA);
            c.invariantPosition(elements[b[edgeIndex]], posB);
        },
        style: (edgeIndex) => {
            const o = _order[edgeIndex];
            const f = _flags[edgeIndex];
            if (isBondType(f, 2 /* BondType.Flag.MetallicCoordination */) || isBondType(f, 4 /* BondType.Flag.HydrogenBond */)) {
                // show metallic coordinations and hydrogen bonds with dashed lines
                return 1 /* LinkStyle.Dashed */;
            }
            else if (o === 3) {
                return mbOff ? 0 /* LinkStyle.Solid */ :
                    mbSymmetric ? 4 /* LinkStyle.Triple */ :
                        5 /* LinkStyle.OffsetTriple */;
            }
            else if (aromaticBonds) {
                const aI = a[edgeIndex], bI = b[edgeIndex];
                const aR = elementAromaticRingIndices.get(aI);
                const bR = elementAromaticRingIndices.get(bI);
                const arCount = (aR && bR) ? (0, array_1.arrayIntersectionSize)(aR, bR) : 0;
                if (isBondType(f, 16 /* BondType.Flag.Aromatic */) || (arCount && !ignoreComputedAromatic)) {
                    if (arCount === 2) {
                        return 8 /* LinkStyle.MirroredAromatic */;
                    }
                    else {
                        return 7 /* LinkStyle.Aromatic */;
                    }
                }
            }
            return (o !== 2 || mbOff) ? 0 /* LinkStyle.Solid */ :
                mbSymmetric ? 2 /* LinkStyle.Double */ :
                    3 /* LinkStyle.OffsetDouble */;
        },
        radius: (edgeIndex) => {
            location.element = elements[a[edgeIndex]];
            const sizeA = theme.size.size(location);
            location.element = elements[b[edgeIndex]];
            const sizeB = theme.size.size(location);
            return Math.min(sizeA, sizeB) * sizeFactor;
        },
        ignore: (0, bond_1.makeIntraBondIgnoreTest)(structure, unit, props)
    };
}
function createIntraUnitBondLines(ctx, unit, structure, theme, props, lines) {
    if (!structure_1.Unit.isAtomic(unit))
        return lines_1.Lines.createEmpty(lines);
    if (!(0, bond_1.hasUnitVisibleBonds)(unit, props))
        return lines_1.Lines.createEmpty(lines);
    if (!unit.bonds.edgeCount)
        return lines_1.Lines.createEmpty(lines);
    const { child } = structure;
    const childUnit = child === null || child === void 0 ? void 0 : child.unitMap.get(unit.id);
    if (child && !childUnit)
        return lines_1.Lines.createEmpty(lines);
    const builderProps = getIntraUnitBondLineBuilderProps(unit, structure, theme, props);
    const { lines: l, boundingSphere } = (0, link_1.createLinkLines)(ctx, builderProps, props, lines);
    if (boundingSphere) {
        l.setBoundingSphere(boundingSphere);
    }
    else if (l.lineCount > 0) {
        const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), (childUnit !== null && childUnit !== void 0 ? childUnit : unit).boundary.sphere, 1 * props.sizeFactor);
        l.setBoundingSphere(sphere);
    }
    return l;
}
exports.IntraUnitBondLineParams = {
    ...units_visual_1.UnitsLinesParams,
    ...bond_1.BondLineParams,
    includeParent: param_definition_1.ParamDefinition.Boolean(false),
};
function IntraUnitBondLineVisual(materialId) {
    return (0, units_visual_1.UnitsLinesVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.IntraUnitBondLineParams),
        createGeometry: createIntraUnitBondLines,
        createLocationIterator: (structureGroup) => bond_1.BondIterator.fromGroup(structureGroup),
        getLoci: bond_1.getIntraBondLoci,
        eachLocation: bond_1.eachIntraBond,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.linkScale !== currentProps.linkScale ||
                newProps.linkSpacing !== currentProps.linkSpacing ||
                newProps.aromaticDashCount !== currentProps.aromaticDashCount ||
                newProps.dashCount !== currentProps.dashCount ||
                newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant ||
                !(0, mol_util_1.arrayEqual)(newProps.includeTypes, currentProps.includeTypes) ||
                !(0, mol_util_1.arrayEqual)(newProps.excludeTypes, currentProps.excludeTypes) ||
                newProps.aromaticBonds !== currentProps.aromaticBonds ||
                newProps.multipleBonds !== currentProps.multipleBonds);
            const newUnit = newStructureGroup.group.units[0];
            const currentUnit = currentStructureGroup.group.units[0];
            if (structure_1.Unit.isAtomic(newUnit) && structure_1.Unit.isAtomic(currentUnit)) {
                if (!graph_1.IntAdjacencyGraph.areEqual(newUnit.bonds, currentUnit.bonds)) {
                    state.createGeometry = true;
                    state.updateTransform = true;
                    state.updateColor = true;
                    state.updateSize = true;
                }
            }
        }
    }, materialId);
}
//
function getStructureIntraUnitBondLineBuilderProps(structure, theme, props) {
    const intraUnitProps = [];
    const { bondCount, unitIndex, unitEdgeIndex, unitGroupIndex } = structure.intraUnitBondMapping;
    const { child } = structure;
    for (const ug of structure.unitSymmetryGroups) {
        const unit = ug.units[0];
        const childUnit = child === null || child === void 0 ? void 0 : child.unitMap.get(unit.id);
        const p = structure_1.Unit.isAtomic(unit) && !(child && !childUnit)
            ? getIntraUnitBondLineBuilderProps(unit, structure, theme, props)
            : link_1.EmptyLinkBuilderProps;
        intraUnitProps.push({ group: ug, props: p });
    }
    return {
        linkCount: bondCount,
        referencePosition: (edgeIndex) => {
            const { group, props } = intraUnitProps[unitIndex[edgeIndex]];
            if (!props.referencePosition)
                return null;
            const v = props.referencePosition(unitEdgeIndex[edgeIndex]);
            if (!v)
                return null;
            const u = group.units[unitGroupIndex[edgeIndex]];
            linear_algebra_1.Vec3.transformMat4(v, v, u.conformation.operator.matrix);
            return v;
        },
        position: (posA, posB, edgeIndex, adjust) => {
            const { group, props } = intraUnitProps[unitIndex[edgeIndex]];
            props.position(posA, posB, unitEdgeIndex[edgeIndex], adjust);
            const u = group.units[unitGroupIndex[edgeIndex]];
            linear_algebra_1.Vec3.transformMat4(posA, posA, u.conformation.operator.matrix);
            linear_algebra_1.Vec3.transformMat4(posB, posB, u.conformation.operator.matrix);
        },
        style: (edgeIndex) => {
            const { props } = intraUnitProps[unitIndex[edgeIndex]];
            return props.style ? props.style(unitEdgeIndex[edgeIndex]) : 0 /* LinkStyle.Solid */;
        },
        radius: (edgeIndex) => {
            const { props } = intraUnitProps[unitIndex[edgeIndex]];
            return props.radius(unitEdgeIndex[edgeIndex]);
        },
        ignore: (edgeIndex) => {
            const { props } = intraUnitProps[unitIndex[edgeIndex]];
            return props.ignore ? props.ignore(unitEdgeIndex[edgeIndex]) : false;
        },
        stub: (edgeIndex) => {
            const { props } = intraUnitProps[unitIndex[edgeIndex]];
            return props.stub ? props.stub(unitEdgeIndex[edgeIndex]) : false;
        }
    };
}
function createStructureIntraUnitBondLines(ctx, structure, theme, props, lines) {
    if (!(0, bond_1.hasStructureVisibleBonds)(structure, props))
        return lines_1.Lines.createEmpty(lines);
    if (!structure.intraUnitBondMapping.bondCount)
        return lines_1.Lines.createEmpty(lines);
    const builderProps = getStructureIntraUnitBondLineBuilderProps(structure, theme, props);
    const { lines: l, boundingSphere } = (0, link_1.createLinkLines)(ctx, builderProps, props, lines);
    if (boundingSphere) {
        l.setBoundingSphere(boundingSphere);
    }
    else if (l.lineCount > 0) {
        const { child } = structure;
        const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), (child !== null && child !== void 0 ? child : structure).boundary.sphere, 1 * props.sizeFactor);
        l.setBoundingSphere(sphere);
    }
    return l;
}
exports.StructureIntraUnitBondLineParams = {
    ...complex_visual_1.ComplexLinesParams,
    ...bond_1.BondLineParams,
    includeParent: param_definition_1.ParamDefinition.Boolean(false),
};
function StructureIntraUnitBondLineVisual(materialId) {
    return (0, complex_visual_1.ComplexLinesVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.StructureIntraUnitBondLineParams),
        createGeometry: createStructureIntraUnitBondLines,
        createLocationIterator: (structure, props) => {
            return !(0, bond_1.hasStructureVisibleBonds)(structure, props)
                ? location_iterator_1.EmptyLocationIterator
                : bond_1.BondIterator.fromStructureGroups(structure);
        },
        getLoci: bond_1.getStructureGroupsBondLoci,
        eachLocation: bond_1.eachStructureGroupsBond,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.linkScale !== currentProps.linkScale ||
                newProps.linkSpacing !== currentProps.linkSpacing ||
                newProps.aromaticDashCount !== currentProps.aromaticDashCount ||
                newProps.dashCount !== currentProps.dashCount ||
                newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant ||
                !(0, mol_util_1.arrayEqual)(newProps.includeTypes, currentProps.includeTypes) ||
                !(0, mol_util_1.arrayEqual)(newProps.excludeTypes, currentProps.excludeTypes) ||
                newProps.multipleBonds !== currentProps.multipleBonds);
            if ((0, bond_1.hasStructureVisibleBonds)(newStructure, newProps) && newStructure.interUnitBonds !== currentStructure.interUnitBonds) {
                state.createGeometry = true;
                state.updateTransform = true;
                state.updateColor = true;
                state.updateSize = true;
            }
        }
    }, materialId);
}
