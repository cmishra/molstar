/**
 * Copyright (c) 2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { computeInteractions } from '../../mol-model-props/computed/interactions/interactions';
import { Structure, StructureElement } from '../../mol-model/structure';
import { AssetManager } from '../../mol-util/assets';
import { InteractionTypeToKind } from './model';
export async function computeContacts(ctx, selection, options) {
    var _a, _b;
    const unitIdToStructureRef = new Map();
    const unitIdToContactGroupId = new Map();
    const units = [];
    let contactGroupId = 0;
    const builder = Structure.Builder();
    for (const { structureRef, loci } of selection) {
        const s = StructureElement.Loci.toStructure(loci);
        for (const unit of s.units) {
            const newUnit = builder.copyUnit(unit, { propagateTransientCache: true });
            units.push(newUnit);
            unitIdToStructureRef.set(newUnit.id, structureRef);
            unitIdToContactGroupId.set(newUnit.id, contactGroupId);
        }
        contactGroupId++;
    }
    const structure = builder.getStructure();
    const interactions = await computeInteractions({ runtime: ctx, assetManager: new AssetManager() }, structure, (_a = options === null || options === void 0 ? void 0 : options.interactions) !== null && _a !== void 0 ? _a : {}, {
        skipIntraContacts: true,
        unitPairTest: (a, b) => unitIdToContactGroupId.get(a.id) !== unitIdToContactGroupId.get(b.id)
    });
    const { edges } = interactions.contacts;
    const result = { kind: 'structure-interactions', elements: [] };
    for (const e of edges) {
        if (e.unitA > e.unitB)
            continue;
        const [a, aType] = processFeature(structure, interactions, e.unitA, e.indexA);
        const [b] = processFeature(structure, interactions, e.unitB, e.indexB);
        const kind = (_b = InteractionTypeToKind[e.props.type]) !== null && _b !== void 0 ? _b : 'unknown';
        const info = { kind };
        if (kind === 'hydrogen-bond' || kind === 'weak-hydrogen-bond') {
            const isADonor = aType === 4 /* FeatureType.HydrogenDonor */ || aType === 9 /* FeatureType.WeakHydrogenDonor */;
            result.elements.push({
                info,
                aStructureRef: isADonor ? unitIdToStructureRef.get(e.unitA) : unitIdToStructureRef.get(e.unitB),
                bStructureRef: isADonor ? unitIdToStructureRef.get(e.unitB) : unitIdToStructureRef.get(e.unitA),
                a: isADonor ? a : b,
                b: isADonor ? b : a,
            });
        }
        else {
            result.elements.push({
                info,
                aStructureRef: unitIdToStructureRef.get(e.unitA),
                bStructureRef: unitIdToStructureRef.get(e.unitB),
                a,
                b,
            });
        }
    }
    return result;
}
const _loc = StructureElement.Location.create();
function processFeature(structure, interactions, unitId, featureIndex) {
    _loc.structure = structure;
    _loc.unit = structure.unitMap.get(unitId);
    const xs = interactions.unitsFeatures.get(unitId);
    let type = 0 /* FeatureType.None */;
    const builder = structure.subsetBuilder(false);
    builder.beginUnit(_loc.unit.id);
    for (let o = xs.offsets[featureIndex], uIEnd = xs.offsets[featureIndex + 1]; o < uIEnd; o++) {
        const unitIndex = xs.members[o];
        _loc.element = _loc.unit.elements[unitIndex];
        builder.addElement(_loc.element);
        type = xs.types[o];
    }
    builder.commitUnit();
    return [Structure.toStructureElementLoci(builder.getStructure()), type];
}
