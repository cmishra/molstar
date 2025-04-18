"use strict";
/**
 * Copyright (c) 2017-2025 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeIntraUnitBonds = computeIntraUnitBonds;
const data_1 = require("./data");
const graph_1 = require("../../../../../mol-math/graph");
const common_1 = require("./common");
const int_1 = require("../../../../../mol-data/int");
const bonds_1 = require("../../../model/properties/atomic/bonds");
const index_pair_1 = require("../../../../../mol-model-formats/structure/property/bonds/index-pair");
const chem_comp_1 = require("../../../../../mol-model-formats/structure/property/bonds/chem_comp");
const struct_conn_1 = require("../../../../../mol-model-formats/structure/property/bonds/struct_conn");
const linear_algebra_1 = require("../../../../../mol-math/linear-algebra");
const common_2 = require("../../../../../mol-math/linear-algebra/3d/common");
const model_1 = require("../../../model/model");
const util_1 = require("../../../../../mol-data/util");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3distance = linear_algebra_1.Vec3.distance;
const CoarseGrainedBondMaxRadius = 6;
const CoarseGrainedIntraResidueBondMaxDistance = 5.5;
const CoarseGrainedInterResidueBondMaxDistance = 3.9;
function getGraph(atomA, atomB, _order, _flags, _key, atomCount, props) {
    const builder = new graph_1.IntAdjacencyGraph.EdgeBuilder(atomCount, atomA, atomB);
    const flags = new Uint16Array(builder.slotCount);
    const order = new Int8Array(builder.slotCount);
    const key = new Uint32Array(builder.slotCount);
    for (let i = 0, _i = builder.edgeCount; i < _i; i++) {
        builder.addNextEdge();
        builder.assignProperty(flags, _flags[i]);
        builder.assignProperty(order, _order[i]);
        builder.assignProperty(key, _key[i]);
    }
    return builder.createGraph({ flags, order, key }, props);
}
const tmpDistVecA = (0, linear_algebra_1.Vec3)();
const tmpDistVecB = (0, linear_algebra_1.Vec3)();
function getDistance(unit, indexA, indexB) {
    unit.conformation.position(indexA, tmpDistVecA);
    unit.conformation.position(indexB, tmpDistVecB);
    return v3distance(tmpDistVecA, tmpDistVecB);
}
const __structConnAdded = new Set();
function findIndexPairBonds(unit) {
    const indexPairs = index_pair_1.IndexPairBonds.Provider.get(unit.model);
    const { elements: atoms } = unit;
    const { type_symbol } = unit.model.atomicHierarchy.atoms;
    const atomCount = unit.elements.length;
    const { maxDistance } = indexPairs;
    const { offset, b, edgeProps: { order, distance, flag, key, operatorA, operatorB } } = indexPairs.bonds;
    const { atomSourceIndex: sourceIndex } = unit.model.atomicHierarchy;
    const { invertedIndex } = model_1.Model.getInvertedAtomSourceIndex(unit.model);
    const atomA = [];
    const atomB = [];
    const flags = [];
    const orders = [];
    const keys = [];
    const opKey = unit.conformation.operator.key;
    for (let _aI = 0; _aI < atomCount; _aI++) {
        const aI = atoms[_aI];
        const aeI = (0, common_1.getElementIdx)(type_symbol.value(aI));
        const isHa = (0, common_1.isHydrogen)(aeI);
        const srcA = sourceIndex.value(aI);
        for (let i = offset[srcA], il = offset[srcA + 1]; i < il; ++i) {
            const bI = invertedIndex[b[i]];
            if (aI >= bI)
                continue;
            const _bI = int_1.SortedArray.indexOf(unit.elements, bI);
            if (_bI < 0)
                continue;
            const opA = operatorA[i];
            const opB = operatorB[i];
            if ((opA >= 0 && opA !== opKey) || (opB >= 0 && opB !== opKey))
                continue;
            const beI = (0, common_1.getElementIdx)(type_symbol.value(bI));
            const d = distance[i];
            const dist = getDistance(unit, aI, bI);
            let add = false;
            if (d >= 0) {
                add = (0, common_2.equalEps)(dist, d, 0.3);
            }
            else if (maxDistance >= 0) {
                add = dist < maxDistance;
            }
            else {
                const pairingThreshold = (0, common_1.getPairingThreshold)(aeI, beI, (0, common_1.getElementThreshold)(aeI), (0, common_1.getElementThreshold)(beI));
                add = dist < pairingThreshold;
                if (isHa && (0, common_1.isHydrogen)(beI)) {
                    // TODO handle molecular hydrogen
                    add = false;
                }
            }
            if (add) {
                atomA[atomA.length] = _aI;
                atomB[atomB.length] = _bI;
                orders[orders.length] = order[i];
                flags[flags.length] = flag[i];
                keys[keys.length] = key[i];
            }
        }
    }
    return getGraph(atomA, atomB, orders, flags, keys, atomCount, {
        canRemap: false,
        cacheable: indexPairs.cacheable,
    });
}
function findBonds(unit, props) {
    const isCoarseGrained = model_1.Model.isCoarseGrained(unit.model);
    const maxRadius = isCoarseGrained ? CoarseGrainedBondMaxRadius : props.maxRadius;
    const { x, y, z } = unit.model.atomicConformation;
    const atomCount = unit.elements.length;
    const { elements: atoms, residueIndex, chainIndex } = unit;
    const { type_symbol, label_atom_id, label_alt_id, label_comp_id } = unit.model.atomicHierarchy.atoms;
    const { label_seq_id } = unit.model.atomicHierarchy.residues;
    const { traceElementIndex } = unit.model.atomicHierarchy.derived.residue;
    const { index } = unit.model.atomicHierarchy;
    const { byEntityKey } = unit.model.sequence;
    const query3d = unit.lookup3d;
    const structConn = struct_conn_1.StructConn.Provider.get(unit.model);
    const component = chem_comp_1.ComponentBond.Provider.get(unit.model);
    const structConnExhaustive = struct_conn_1.StructConn.isExhaustive(unit.model);
    const atomA = [];
    const atomB = [];
    const flags = [];
    const order = [];
    const key = [];
    let lastResidue = -1;
    let componentMap = void 0;
    let isWatery = true, isDictionaryBased = true, isSequenced = true;
    const structConnAdded = __structConnAdded;
    const hasStructConnEntries = !!(structConn === null || structConn === void 0 ? void 0 : structConn.residueCantorPairs.size);
    for (let _aI = 0; _aI < atomCount; _aI++) {
        const aI = atoms[_aI];
        const elemA = type_symbol.value(aI);
        if (isWatery && (elemA !== 'H' && elemA !== 'O'))
            isWatery = false;
        const structConnEntries = props.forceCompute ? void 0 : structConn && structConn.byAtomIndex.get(aI);
        let hasStructConn = false;
        if (structConnEntries) {
            for (const se of structConnEntries) {
                const { partnerA, partnerB } = se;
                // symmetry must be the same for intra-unit bonds
                if (partnerA.symmetry !== partnerB.symmetry)
                    continue;
                const p = partnerA.atomIndex === aI ? partnerB : partnerA;
                const _bI = int_1.SortedArray.indexOf(unit.elements, p.atomIndex);
                if (_bI < 0 || atoms[_bI] < aI)
                    continue;
                atomA[atomA.length] = _aI;
                atomB[atomB.length] = _bI;
                flags[flags.length] = se.flags;
                order[order.length] = se.order;
                key[key.length] = se.rowIndex;
                if (!hasStructConn)
                    structConnAdded.clear();
                hasStructConn = true;
                structConnAdded.add(_bI);
            }
        }
        if (structConnExhaustive)
            continue;
        const raI = residueIndex[aI];
        const seqIdA = label_seq_id.value(raI);
        const compId = label_comp_id.value(aI);
        if (!props.forceCompute && raI !== lastResidue) {
            if (!!component && component.entries.has(compId)) {
                const entitySeq = byEntityKey[index.getEntityFromChain(chainIndex[aI])];
                if (entitySeq && entitySeq.sequence.microHet.has(seqIdA)) {
                    // compute for sequence positions with micro-heterogeneity
                    componentMap = void 0;
                }
                else {
                    componentMap = component.entries.get(compId).map;
                }
            }
            else {
                componentMap = void 0;
            }
        }
        lastResidue = raI;
        const aeI = (0, common_1.getElementIdx)(elemA);
        const atomIdA = label_atom_id.value(aI);
        const componentPairs = componentMap ? componentMap.get(atomIdA) : void 0;
        const { indices, count, squaredDistances } = query3d.find(x[aI], y[aI], z[aI], maxRadius);
        const isHa = (0, common_1.isHydrogen)(aeI);
        const thresholdA = (0, common_1.getElementThreshold)(aeI);
        const altA = label_alt_id.value(aI);
        const metalA = common_1.MetalsSet.has(aeI);
        for (let ni = 0; ni < count; ni++) {
            const _bI = indices[ni];
            if (hasStructConn && structConnAdded.has(_bI))
                continue;
            const bI = atoms[_bI];
            if (bI <= aI)
                continue;
            const altB = label_alt_id.value(bI);
            if (altA && altB && altA !== altB)
                continue;
            // Do not add bonds for residues that have a structConn entry
            if (hasStructConnEntries) {
                const residuePair = (0, util_1.sortedCantorPairing)(residueIndex[aI], residueIndex[bI]);
                if (structConn.residueCantorPairs.has(residuePair))
                    continue;
            }
            const beI = (0, common_1.getElementIdx)(type_symbol.value(bI));
            const isHb = (0, common_1.isHydrogen)(beI);
            if (isHa && isHb)
                continue;
            const isMetal = (metalA || common_1.MetalsSet.has(beI)) && !(isHa || isHb);
            const rbI = residueIndex[bI];
            // handle "component dictionary" bonds.
            if (raI === rbI && componentPairs) {
                const e = componentPairs.get(label_atom_id.value(bI));
                if (e) {
                    atomA[atomA.length] = _aI;
                    atomB[atomB.length] = _bI;
                    order[order.length] = e.order;
                    let flag = e.flags;
                    if (isMetal) {
                        if (flag | 1 /* BondType.Flag.Covalent */)
                            flag ^= 1 /* BondType.Flag.Covalent */;
                        flag |= 2 /* BondType.Flag.MetallicCoordination */;
                    }
                    flags[flags.length] = flag;
                    key[key.length] = e.key;
                }
                continue;
            }
            const dist = Math.sqrt(squaredDistances[ni]);
            if (dist === 0)
                continue;
            let flag = false;
            if (isCoarseGrained) {
                if (raI === rbI) {
                    // intra residue bonds
                    flag = dist <= CoarseGrainedIntraResidueBondMaxDistance;
                }
                else {
                    // inter residue "backbone" bonds
                    flag = dist <= CoarseGrainedInterResidueBondMaxDistance && traceElementIndex[raI] === aI && traceElementIndex[rbI] === bI;
                }
            }
            else {
                const pairingThreshold = (0, common_1.getPairingThreshold)(aeI, beI, thresholdA, (0, common_1.getElementThreshold)(beI));
                flag = dist <= pairingThreshold;
            }
            if (flag) {
                atomA[atomA.length] = _aI;
                atomB[atomB.length] = _bI;
                order[order.length] = (0, bonds_1.getIntraBondOrderFromTable)(compId, atomIdA, label_atom_id.value(bI));
                flags[flags.length] = (isMetal ? 2 /* BondType.Flag.MetallicCoordination */ : 1 /* BondType.Flag.Covalent */) | 32 /* BondType.Flag.Computed */;
                key[key.length] = -1;
                const seqIdB = label_seq_id.value(rbI);
                if (seqIdA === seqIdB)
                    isDictionaryBased = false;
                if (Math.abs(seqIdA - seqIdB) > 1)
                    isSequenced = false;
            }
        }
    }
    return getGraph(atomA, atomB, order, flags, key, atomCount, {
        canRemap: isWatery || (isDictionaryBased && isSequenced),
    });
}
function canGetFromIndexPairBonds(unit) {
    if (unit.conformation.operator.key === -1)
        return false;
    const indexPairs = index_pair_1.IndexPairBonds.Provider.get(unit.model);
    return !!(indexPairs === null || indexPairs === void 0 ? void 0 : indexPairs.hasOperators);
}
function getIndexPairBonds(unit) {
    const indexPairs = index_pair_1.IndexPairBonds.Provider.get(unit.model);
    const bonds = indexPairs.bySameOperator.get(unit.conformation.operator.key);
    if (!bonds)
        return data_1.IntraUnitBonds.Empty;
    const { a, b, edgeProps: { key, flag, order } } = indexPairs.bonds;
    const { invertedIndex } = model_1.Model.getInvertedAtomSourceIndex(unit.model);
    const { elements } = unit;
    const atomA = [];
    const atomB = [];
    const flags = [];
    const orders = [];
    const keys = [];
    for (let j = 0, jl = bonds.length; j < jl; ++j) {
        const i = bonds[j];
        if (a[i] >= b[i])
            continue;
        const aI = invertedIndex[a[i]];
        const _aI = int_1.SortedArray.indexOf(elements, aI);
        if (_aI < 0)
            continue;
        const bI = invertedIndex[b[i]];
        const _bI = int_1.SortedArray.indexOf(elements, bI);
        if (_bI < 0)
            continue;
        atomA[atomA.length] = _aI;
        atomB[atomB.length] = _bI;
        flags[flags.length] = flag[i];
        orders[orders.length] = order[i];
        keys[keys.length] = key[i];
    }
    return getGraph(atomA, atomB, orders, flags, keys, elements.length, {
        canRemap: false,
        cacheable: indexPairs.cacheable,
    });
}
function computeIntraUnitBonds(unit, props) {
    const p = { ...common_1.DefaultBondComputationProps, ...props };
    if (p.noCompute)
        return data_1.IntraUnitBonds.Empty;
    if (unit.elements.length <= 1)
        return data_1.IntraUnitBonds.Empty;
    if (!p.forceCompute && index_pair_1.IndexPairBonds.Provider.get(unit.model)) {
        return canGetFromIndexPairBonds(unit) ? getIndexPairBonds(unit) : findIndexPairBonds(unit);
    }
    else {
        return findBonds(unit, p);
    }
}
