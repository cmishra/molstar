"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BondIterator = exports.DefaultBondLineProps = exports.BondLineParams = exports.DefaultBondCylinderProps = exports.BondCylinderParams = exports.DefaultBondProps = exports.BondParams = void 0;
exports.ignoreBondType = ignoreBondType;
exports.makeIntraBondIgnoreTest = makeIntraBondIgnoreTest;
exports.makeInterBondIgnoreTest = makeInterBondIgnoreTest;
exports.hasUnitVisibleBonds = hasUnitVisibleBonds;
exports.hasStructureVisibleBonds = hasStructureVisibleBonds;
exports.getIntraBondLoci = getIntraBondLoci;
exports.eachIntraBond = eachIntraBond;
exports.getInterBondLoci = getInterBondLoci;
exports.eachInterBond = eachInterBond;
exports.getStructureGroupsBondLoci = getStructureGroupsBondLoci;
exports.eachStructureGroupsBond = eachStructureGroupsBond;
const types_1 = require("../../../../mol-model/structure/model/types");
const structure_1 = require("../../../../mol-model/structure");
const param_definition_1 = require("../../../../mol-util/param-definition");
const location_iterator_1 = require("../../../../mol-geo/util/location-iterator");
const link_1 = require("./link");
const type_helpers_1 = require("../../../../mol-util/type-helpers");
const loci_1 = require("../../../../mol-model/loci");
const int_1 = require("../../../../mol-data/int");
const common_1 = require("./common");
exports.BondParams = {
    includeTypes: param_definition_1.ParamDefinition.MultiSelect((0, type_helpers_1.ObjectKeys)(types_1.BondType.Names), param_definition_1.ParamDefinition.objectToOptions(types_1.BondType.Names)),
    excludeTypes: param_definition_1.ParamDefinition.MultiSelect([], param_definition_1.ParamDefinition.objectToOptions(types_1.BondType.Names)),
    ignoreHydrogens: param_definition_1.ParamDefinition.Boolean(false),
    ignoreHydrogensVariant: param_definition_1.ParamDefinition.Select('all', param_definition_1.ParamDefinition.arrayToOptions(['all', 'non-polar'])),
    aromaticBonds: param_definition_1.ParamDefinition.Boolean(true, { description: 'Display aromatic bonds with dashes' }),
    multipleBonds: param_definition_1.ParamDefinition.Select('symmetric', param_definition_1.ParamDefinition.arrayToOptions(['off', 'symmetric', 'offset'])),
};
exports.DefaultBondProps = param_definition_1.ParamDefinition.getDefaultValues(exports.BondParams);
exports.BondCylinderParams = {
    ...link_1.LinkCylinderParams,
    ...exports.BondParams,
    adjustCylinderLength: param_definition_1.ParamDefinition.Boolean(false, { description: 'Shorten cylinders to reduce overlap with spheres. Useful for for transparent bonds. Not working well with aromatic bonds.' })
};
exports.DefaultBondCylinderProps = param_definition_1.ParamDefinition.getDefaultValues(exports.BondCylinderParams);
exports.BondLineParams = {
    ...link_1.LinkLineParams,
    ...exports.BondParams
};
exports.DefaultBondLineProps = param_definition_1.ParamDefinition.getDefaultValues(exports.BondLineParams);
function ignoreBondType(include, exclude, f) {
    return !types_1.BondType.is(include, f) || types_1.BondType.is(exclude, f);
}
function makeIntraBondIgnoreTest(structure, unit, props) {
    const elements = unit.elements;
    const bonds = unit.bonds;
    const { a, b, edgeProps } = bonds;
    const { flags: _flags } = edgeProps;
    const { ignoreHydrogens, ignoreHydrogensVariant, includeTypes, excludeTypes } = props;
    const include = types_1.BondType.fromNames(includeTypes);
    const exclude = types_1.BondType.fromNames(excludeTypes);
    const allBondTypes = types_1.BondType.isAll(include) && 0 /* BondType.Flag.None */ === exclude;
    const { child } = structure;
    const childUnit = child === null || child === void 0 ? void 0 : child.unitMap.get(unit.id);
    if (child && !childUnit)
        throw new Error('expected childUnit to exist if child exists');
    if (allBondTypes && !ignoreHydrogens && !child)
        return;
    return (edgeIndex) => {
        const aI = a[edgeIndex];
        const bI = b[edgeIndex];
        if ((!!childUnit && !int_1.SortedArray.has(childUnit.elements, elements[aI]))) {
            return true;
        }
        if (!allBondTypes && ignoreBondType(include, exclude, _flags[edgeIndex])) {
            return true;
        }
        if (!ignoreHydrogens)
            return false;
        if ((0, common_1.isHydrogen)(structure, unit, elements[aI], ignoreHydrogensVariant) || (0, common_1.isHydrogen)(structure, unit, elements[bI], ignoreHydrogensVariant))
            return true;
        return false;
    };
}
function makeInterBondIgnoreTest(structure, props) {
    const bonds = structure.interUnitBonds;
    const { edges } = bonds;
    const { ignoreHydrogens, ignoreHydrogensVariant, includeTypes, excludeTypes } = props;
    const include = types_1.BondType.fromNames(includeTypes);
    const exclude = types_1.BondType.fromNames(excludeTypes);
    const allBondTypes = types_1.BondType.isAll(include) && 0 /* BondType.Flag.None */ === exclude;
    const { child } = structure;
    if (allBondTypes && !ignoreHydrogens && !child)
        return;
    return (edgeIndex) => {
        if (child) {
            const b = edges[edgeIndex];
            const childUnitA = child.unitMap.get(b.unitA);
            if (!childUnitA)
                return true;
            const unitA = structure.unitMap.get(b.unitA);
            const eA = unitA.elements[b.indexA];
            if (!int_1.SortedArray.has(childUnitA.elements, eA))
                return true;
        }
        if (ignoreHydrogens) {
            const b = edges[edgeIndex];
            const uA = structure.unitMap.get(b.unitA);
            const uB = structure.unitMap.get(b.unitB);
            if ((0, common_1.isHydrogen)(structure, uA, uA.elements[b.indexA], ignoreHydrogensVariant) || (0, common_1.isHydrogen)(structure, uB, uB.elements[b.indexB], ignoreHydrogensVariant))
                return true;
        }
        if (!allBondTypes) {
            if (ignoreBondType(include, exclude, edges[edgeIndex].props.flag))
                return true;
        }
        return false;
    };
}
function hasUnitVisibleBonds(unit, props) {
    if (structure_1.Unit.Traits.is(unit.traits, structure_1.Unit.Trait.Water)) {
        return !props.ignoreHydrogens || props.ignoreHydrogensVariant === 'non-polar';
    }
    return true;
}
function hasStructureVisibleBonds(structure, props) {
    for (const { units } of structure.unitSymmetryGroups) {
        if (structure_1.Unit.isAtomic(units[0]) && hasUnitVisibleBonds(units[0], props))
            return true;
    }
    return false;
}
var BondIterator;
(function (BondIterator) {
    function fromGroup(structureGroup, props) {
        const { group, structure } = structureGroup;
        const unit = group.units[0];
        const groupCount = structure_1.Unit.isAtomic(unit) ? unit.bonds.edgeCount * 2 : 0;
        const instanceCount = group.units.length;
        const location = structure_1.Bond.Location(structure, undefined, undefined, structure, undefined, undefined);
        const getLocation = (groupIndex, instanceIndex) => {
            const unit = group.units[instanceIndex];
            location.aUnit = unit;
            location.bUnit = unit;
            location.aIndex = unit.bonds.a[groupIndex];
            location.bIndex = unit.bonds.b[groupIndex];
            return location;
        };
        if (props === null || props === void 0 ? void 0 : props.includeLocation2) {
            const location2 = structure_1.Bond.Location(structure, undefined, undefined, structure, undefined, undefined);
            const getLocation2 = (groupIndex, instanceIndex) => {
                const unit = group.units[instanceIndex];
                location2.aUnit = unit;
                location2.bUnit = unit;
                location2.aIndex = unit.bonds.b[groupIndex];
                location2.bIndex = unit.bonds.a[groupIndex];
                return location2;
            };
            return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation, false, () => false, getLocation2);
        }
        return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation);
    }
    BondIterator.fromGroup = fromGroup;
    function fromStructure(structure, props) {
        const groupCount = structure.interUnitBonds.edgeCount;
        const instanceCount = 1;
        const location = structure_1.Bond.Location(structure, undefined, undefined, structure, undefined, undefined);
        const getLocation = (groupIndex) => {
            const bond = structure.interUnitBonds.edges[groupIndex];
            location.aUnit = structure.unitMap.get(bond.unitA);
            location.aIndex = bond.indexA;
            location.bUnit = structure.unitMap.get(bond.unitB);
            location.bIndex = bond.indexB;
            return location;
        };
        if (props === null || props === void 0 ? void 0 : props.includeLocation2) {
            const location2 = structure_1.Bond.Location(structure, undefined, undefined, structure, undefined, undefined);
            const getLocation2 = (groupIndex) => {
                const bond = structure.interUnitBonds.edges[groupIndex];
                location2.aUnit = structure.unitMap.get(bond.unitB);
                location2.aIndex = bond.indexB;
                location2.bUnit = structure.unitMap.get(bond.unitA);
                location2.bIndex = bond.indexA;
                return location2;
            };
            return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation, true, () => false, getLocation2);
        }
        ;
        return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation, true);
    }
    BondIterator.fromStructure = fromStructure;
    function fromStructureGroups(structure, props) {
        const { bondCount, unitIndex, unitGroupIndex, unitEdgeIndex } = structure.intraUnitBondMapping;
        const groupCount = bondCount;
        const instanceCount = 1;
        const location = structure_1.Bond.Location(structure, undefined, undefined, structure, undefined, undefined);
        const getLocation = (groupIndex) => {
            const ug = structure.unitSymmetryGroups[unitIndex[groupIndex]];
            const unit = ug.units[unitGroupIndex[groupIndex]];
            const edgeIndex = unitEdgeIndex[groupIndex];
            location.aUnit = unit;
            location.bUnit = unit;
            location.aIndex = unit.bonds.a[edgeIndex];
            location.bIndex = unit.bonds.b[edgeIndex];
            return location;
        };
        if (props === null || props === void 0 ? void 0 : props.includeLocation2) {
            const location2 = structure_1.Bond.Location(structure, undefined, undefined, structure, undefined, undefined);
            const getLocation2 = (groupIndex) => {
                const ug = structure.unitSymmetryGroups[unitIndex[groupIndex]];
                const unit = ug.units[unitGroupIndex[groupIndex]];
                const edgeIndex = unitEdgeIndex[groupIndex];
                location2.aUnit = unit;
                location2.bUnit = unit;
                location2.aIndex = unit.bonds.b[edgeIndex];
                location2.bIndex = unit.bonds.a[edgeIndex];
                return location2;
            };
            return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation, true, () => false, getLocation2);
        }
        ;
        return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation, true);
    }
    BondIterator.fromStructureGroups = fromStructureGroups;
})(BondIterator || (exports.BondIterator = BondIterator = {}));
//
function getIntraBondLoci(pickingId, structureGroup, id) {
    const { objectId, instanceId, groupId } = pickingId;
    if (id === objectId) {
        const { structure, group } = structureGroup;
        const unit = group.units[instanceId];
        if (structure_1.Unit.isAtomic(unit)) {
            const { target } = structure;
            const iA = unit.bonds.a[groupId];
            const iB = unit.bonds.b[groupId];
            return structure_1.Bond.Loci(target, [
                structure_1.Bond.Location(target, unit, iA, target, unit, iB),
                structure_1.Bond.Location(target, unit, iB, target, unit, iA)
            ]);
        }
    }
    return loci_1.EmptyLoci;
}
function eachIntraBond(loci, structureGroup, apply, isMarking) {
    let changed = false;
    if (structure_1.Bond.isLoci(loci)) {
        const { structure, group } = structureGroup;
        if (!structure_1.Structure.areEquivalent(loci.structure, structure))
            return false;
        const unit = group.units[0];
        if (!structure_1.Unit.isAtomic(unit))
            return false;
        const groupCount = unit.bonds.edgeCount * 2;
        for (const b of loci.bonds) {
            if (b.aUnit !== b.bUnit)
                continue;
            const unitIdx = group.unitIndexMap.get(b.aUnit.id);
            if (unitIdx !== undefined) {
                const idx = unit.bonds.getDirectedEdgeIndex(b.aIndex, b.bIndex);
                if (idx !== -1) {
                    if (apply(int_1.Interval.ofSingleton(unitIdx * groupCount + idx)))
                        changed = true;
                }
            }
        }
    }
    else if (structure_1.StructureElement.Loci.is(loci)) {
        const { structure, group } = structureGroup;
        if (!structure_1.Structure.areEquivalent(loci.structure, structure))
            return false;
        const unit = group.units[0];
        if (!structure_1.Unit.isAtomic(unit))
            return false;
        const groupCount = unit.bonds.edgeCount * 2;
        for (const e of loci.elements) {
            const unitIdx = group.unitIndexMap.get(e.unit.id);
            if (unitIdx !== undefined) {
                const { offset, b } = unit.bonds;
                int_1.OrderedSet.forEach(e.indices, v => {
                    for (let t = offset[v], _t = offset[v + 1]; t < _t; t++) {
                        if (!isMarking || int_1.OrderedSet.has(e.indices, b[t])) {
                            if (apply(int_1.Interval.ofSingleton(unitIdx * groupCount + t)))
                                changed = true;
                        }
                    }
                });
            }
        }
    }
    return changed;
}
//
function getInterBondLoci(pickingId, structure, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const { target } = structure;
        const b = structure.interUnitBonds.edges[groupId];
        const uA = structure.unitMap.get(b.unitA);
        const uB = structure.unitMap.get(b.unitB);
        return structure_1.Bond.Loci(target, [
            structure_1.Bond.Location(target, uA, b.indexA, target, uB, b.indexB),
            structure_1.Bond.Location(target, uB, b.indexB, target, uA, b.indexA)
        ]);
    }
    return loci_1.EmptyLoci;
}
const __unitMap = new Map();
function eachInterBond(loci, structure, apply, isMarking) {
    let changed = false;
    if (structure_1.Bond.isLoci(loci)) {
        if (!structure_1.Structure.areEquivalent(loci.structure, structure))
            return false;
        for (const b of loci.bonds) {
            const idx = structure.interUnitBonds.getBondIndexFromLocation(b);
            if (idx !== -1) {
                if (apply(int_1.Interval.ofSingleton(idx)))
                    changed = true;
            }
        }
    }
    else if (structure_1.StructureElement.Loci.is(loci)) {
        if (!structure_1.Structure.areEquivalent(loci.structure, structure))
            return false;
        if (isMarking && loci.elements.length === 1)
            return false; // only a single unit
        for (const e of loci.elements)
            __unitMap.set(e.unit.id, e.indices);
        for (const e of loci.elements) {
            const { unit } = e;
            if (!structure_1.Unit.isAtomic(unit))
                continue;
            for (const b of structure.interUnitBonds.getConnectedUnits(unit.id)) {
                const otherLociIndices = __unitMap.get(b.unitB);
                if (!isMarking || otherLociIndices) {
                    int_1.OrderedSet.forEach(e.indices, v => {
                        if (!b.connectedIndices.includes(v))
                            return;
                        for (const bi of b.getEdges(v)) {
                            if (!isMarking || (otherLociIndices && int_1.OrderedSet.has(otherLociIndices, bi.indexB))) {
                                const idx = structure.interUnitBonds.getEdgeIndex(v, unit.id, bi.indexB, b.unitB);
                                if (apply(int_1.Interval.ofSingleton(idx)))
                                    changed = true;
                            }
                        }
                    });
                }
            }
        }
        __unitMap.clear();
    }
    return changed;
}
//
function getStructureGroupsBondLoci(pickingId, structure, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const mapping = structure.intraUnitBondMapping;
        return getIntraBondLoci({
            objectId,
            instanceId: mapping.unitGroupIndex[groupId],
            groupId: mapping.unitEdgeIndex[groupId]
        }, {
            structure,
            group: structure.unitSymmetryGroups[mapping.unitIndex[groupId]]
        }, id);
    }
    return loci_1.EmptyLoci;
}
function eachStructureGroupsBond(loci, structure, apply, isMarking) {
    const { unitGroupOffset } = structure.intraUnitBondMapping;
    let changed = false;
    if (structure_1.Bond.isLoci(loci)) {
        if (!structure_1.Structure.areEquivalent(loci.structure, structure))
            return false;
        for (const b of loci.bonds) {
            if (b.aUnit !== b.bUnit)
                continue;
            const groupIdx = structure.unitSymmetryGroupsIndexMap.get(b.aUnit.id);
            const group = structure.unitSymmetryGroups[groupIdx];
            const unit = group.units[0];
            if (!structure_1.Unit.isAtomic(unit))
                continue;
            const o = unitGroupOffset[groupIdx];
            const groupCount = unit.bonds.edgeCount * 2;
            const unitIdx = group.unitIndexMap.get(b.aUnit.id);
            if (unitIdx !== undefined) {
                const idx = unit.bonds.getDirectedEdgeIndex(b.aIndex, b.bIndex);
                if (idx !== -1) {
                    if (apply(int_1.Interval.ofSingleton(unitIdx * groupCount + idx + o)))
                        changed = true;
                }
            }
        }
    }
    else if (structure_1.StructureElement.Loci.is(loci)) {
        if (!structure_1.Structure.areEquivalent(loci.structure, structure))
            return false;
        for (const e of loci.elements) {
            const groupIdx = structure.unitSymmetryGroupsIndexMap.get(e.unit.id);
            const group = structure.unitSymmetryGroups[groupIdx];
            const unit = group.units[0];
            if (!structure_1.Unit.isAtomic(unit))
                continue;
            const o = unitGroupOffset[groupIdx];
            const groupCount = unit.bonds.edgeCount * 2;
            const unitIdx = group.unitIndexMap.get(e.unit.id);
            if (unitIdx !== undefined) {
                const { offset, b } = unit.bonds;
                int_1.OrderedSet.forEach(e.indices, v => {
                    for (let t = offset[v], _t = offset[v + 1]; t < _t; t++) {
                        if (!isMarking || int_1.OrderedSet.has(e.indices, b[t])) {
                            if (apply(int_1.Interval.ofSingleton(unitIdx * groupCount + t + o)))
                                changed = true;
                        }
                    }
                });
            }
        }
    }
    return changed;
}
