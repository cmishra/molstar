/**
 * Copyright (c) 2017-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 */
import { UniqueArray } from '../../../../mol-data/generic';
import { OrderedSet, SortedArray, Interval } from '../../../../mol-data/int';
import { Vec3 } from '../../../../mol-math/linear-algebra';
import { MolScriptBuilder as MS } from '../../../../mol-script/language/builder';
import { Structure } from '../structure';
import { Unit } from '../unit';
import { sortArray, hashFnv32a, hash2 } from '../../../../mol-data/util';
import { Location } from './location';
import { PrincipalAxes } from '../../../../mol-math/linear-algebra/matrix/principal-axes';
import { StructureProperties } from '../properties';
import { BoundaryHelper } from '../../../../mol-math/geometry/boundary-helper';
import { IntTuple } from '../../../../mol-data/int/tuple';
import { compile } from '../../../../mol-script/runtime/query/base';
import { QueryContext, StructureSelection } from '../../query';
import { Schema } from './schema';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const itDiff = IntTuple.diff;
export function Loci(structure, elements) {
    return { kind: 'element-loci', structure, elements: elements };
}
(function (Loci) {
    function is(x) {
        return !!x && x.kind === 'element-loci';
    }
    Loci.is = is;
    function areEqual(a, b) {
        if (a.structure !== b.structure)
            return false;
        if (a.elements.length !== b.elements.length)
            return false;
        for (let i = 0, il = a.elements.length; i < il; ++i) {
            const elementA = a.elements[i];
            const elementB = b.elements[i];
            if (elementA.unit.id !== elementB.unit.id)
                return false;
            if (!OrderedSet.areEqual(elementA.indices, elementB.indices))
                return false;
        }
        return true;
    }
    Loci.areEqual = areEqual;
    function isEmpty(loci) {
        for (const u of loci.elements) {
            if (OrderedSet.size(u.indices) > 0)
                return false;
        }
        return true;
    }
    Loci.isEmpty = isEmpty;
    function isWholeStructure(loci) {
        return size(loci) === loci.structure.elementCount;
    }
    Loci.isWholeStructure = isWholeStructure;
    function size(loci) {
        let s = 0;
        // inlined for max performance, crucial for marking large cellpack models
        // `for (const u of loci.elements) s += OrderedSet.size(u.indices);`
        for (const { indices } of loci.elements) {
            if (typeof indices === 'number') {
                s += itDiff(indices);
            }
            else {
                s += indices.length;
            }
        }
        return s;
    }
    Loci.size = size;
    function all(structure) {
        return Loci(structure, structure.units.map(unit => ({
            unit,
            indices: OrderedSet.ofBounds(0, unit.elements.length)
        })));
    }
    Loci.all = all;
    function none(structure) {
        return Loci(structure, []);
    }
    Loci.none = none;
    function fromExpression(structure, expression, queryContext) {
        let expr;
        if (typeof expression === 'function') {
            expr = expression(MS);
        }
        else {
            expr = expression;
        }
        const selection = compile(expr)(queryContext !== null && queryContext !== void 0 ? queryContext : new QueryContext(structure));
        return StructureSelection.toLociWithSourceUnits(selection);
    }
    Loci.fromExpression = fromExpression;
    function fromQuery(structure, query, queryContext) {
        const selection = query(queryContext !== null && queryContext !== void 0 ? queryContext : new QueryContext(structure));
        return StructureSelection.toLociWithSourceUnits(selection);
    }
    Loci.fromQuery = fromQuery;
    function fromSchema(structure, schema, queryContext) {
        return Schema.toLoci(structure, schema, queryContext);
    }
    Loci.fromSchema = fromSchema;
    function getFirstLocation(loci, e) {
        if (isEmpty(loci))
            return void 0;
        const unit = loci.elements[0].unit;
        const element = unit.elements[OrderedSet.getAt(loci.elements[0].indices, 0)];
        if (e) {
            e.structure = loci.structure;
            e.unit = loci.elements[0].unit;
            e.element = element;
            return e;
        }
        return Location.create(loci.structure, unit, element);
    }
    Loci.getFirstLocation = getFirstLocation;
    function firstElement(loci) {
        if (isEmpty(loci))
            return loci;
        return Loci(loci.structure, [{
                unit: loci.elements[0].unit,
                indices: OrderedSet.ofSingleton(OrderedSet.start(loci.elements[0].indices))
            }]);
    }
    Loci.firstElement = firstElement;
    function firstResidue(loci) {
        if (isEmpty(loci))
            return loci;
        return extendToWholeResidues(firstElement(loci));
    }
    Loci.firstResidue = firstResidue;
    function firstChain(loci) {
        if (isEmpty(loci))
            return loci;
        return extendToWholeChains(firstElement(loci));
    }
    Loci.firstChain = firstChain;
    function toStructure(loci) {
        const units = [];
        for (const e of loci.elements) {
            const { unit, indices } = e;
            const elements = new Int32Array(OrderedSet.size(indices));
            OrderedSet.forEach(indices, (v, i) => elements[i] = unit.elements[v]);
            units.push(unit.getChild(SortedArray.ofSortedArray(elements)));
        }
        return Structure.create(units, { parent: loci.structure.parent });
    }
    Loci.toStructure = toStructure;
    /**
     * Iterates over all locations.
     * The loc argument of the callback is mutable, use Location.clone() if you intend to keep
     * the value around.
     */
    function forEachLocation(loci, f, location) {
        if (Loci.isEmpty(loci))
            return;
        const loc = location ? location : Location.create(loci.structure);
        loc.structure = loci.structure;
        for (const e of loci.elements) {
            const { unit, indices } = e;
            loc.unit = unit;
            const { elements } = e.unit;
            for (let i = 0, _i = OrderedSet.size(indices); i < _i; i++) {
                loc.element = elements[OrderedSet.getAt(indices, i)];
                f(loc);
            }
        }
    }
    Loci.forEachLocation = forEachLocation;
    // TODO: there should be a version that properly supports partitioned units
    function remap(loci, structure) {
        if (structure === loci.structure)
            return loci;
        const elements = [];
        loci.elements.forEach(e => {
            if (!structure.unitMap.has(e.unit.id))
                return;
            const unit = structure.unitMap.get(e.unit.id);
            const indices = OrderedSet.indexedIntersect(e.indices, e.unit.elements, unit.elements);
            if (OrderedSet.size(indices) > 0)
                elements.push({ unit, indices });
        });
        return Loci(structure, elements);
    }
    Loci.remap = remap;
    /** Create union of `xs` and `ys` */
    function union(xs, ys) {
        if (xs.elements.length > ys.elements.length)
            return union(ys, xs);
        if (Loci.isEmpty(xs))
            return ys;
        const map = new Map();
        for (const e of xs.elements)
            map.set(e.unit.id, e.indices);
        const elements = [];
        for (const e of ys.elements) {
            if (map.has(e.unit.id)) {
                elements[elements.length] = { unit: e.unit, indices: OrderedSet.union(map.get(e.unit.id), e.indices) };
                map.delete(e.unit.id);
            }
            else {
                elements[elements.length] = e;
            }
        }
        map.forEach((indices, id) => {
            elements[elements.length] = { unit: xs.structure.unitMap.get(id), indices };
        });
        return Loci(xs.structure, elements);
    }
    Loci.union = union;
    /** Subtract `ys` from `xs` */
    function subtract(xs, ys) {
        const map = new Map();
        for (const e of ys.elements)
            map.set(e.unit.id, e.indices);
        const elements = [];
        for (const e of xs.elements) {
            if (map.has(e.unit.id)) {
                const indices = OrderedSet.subtract(e.indices, map.get(e.unit.id));
                if (OrderedSet.size(indices) === 0)
                    continue;
                elements[elements.length] = { unit: e.unit, indices };
            }
            else {
                elements[elements.length] = e;
            }
        }
        return Loci(xs.structure, elements);
    }
    Loci.subtract = subtract;
    /** Intersect `xs` and `ys` */
    function intersect(xs, ys) {
        const map = new Map();
        for (const e of xs.elements)
            map.set(e.unit.id, e.indices);
        const elements = [];
        for (const e of ys.elements) {
            if (!map.has(e.unit.id))
                continue;
            const indices = OrderedSet.intersect(map.get(e.unit.id), e.indices);
            if (OrderedSet.size(indices) === 0)
                continue;
            elements[elements.length] = { unit: e.unit, indices };
        }
        return Loci(xs.structure, elements);
    }
    Loci.intersect = intersect;
    function areIntersecting(xs, ys) {
        if (xs.elements.length > ys.elements.length)
            return areIntersecting(ys, xs);
        if (Loci.isEmpty(xs))
            return Loci.isEmpty(ys);
        const map = new Map();
        for (const e of xs.elements)
            map.set(e.unit.id, e.indices);
        for (const e of ys.elements) {
            if (!map.has(e.unit.id))
                continue;
            if (OrderedSet.areIntersecting(map.get(e.unit.id), e.indices))
                return true;
        }
        return false;
    }
    Loci.areIntersecting = areIntersecting;
    /** Check if second loci is a subset of the first */
    function isSubset(xs, ys) {
        if (Loci.isEmpty(xs))
            return Loci.isEmpty(ys);
        const map = new Map();
        for (const e of xs.elements)
            map.set(e.unit.id, e.indices);
        let isSubset = false;
        for (const e of ys.elements) {
            if (!map.has(e.unit.id))
                return false;
            if (!OrderedSet.isSubset(map.get(e.unit.id), e.indices))
                return false;
            else
                isSubset = true;
        }
        return isSubset;
    }
    Loci.isSubset = isSubset;
    function makeIndexSet(newIndices) {
        if (newIndices.length > 3 && SortedArray.isRange(newIndices)) {
            return Interval.ofRange(newIndices[0], newIndices[newIndices.length - 1]);
        }
        else {
            return SortedArray.ofSortedArray(newIndices);
        }
    }
    function extendToWholeResidues(loci, restrictToConformation) {
        const elements = [];
        const residueAltIds = new Set();
        for (const lociElement of loci.elements) {
            if (isWholeUnit(lociElement)) {
                elements[elements.length] = lociElement;
                continue;
            }
            if (lociElement.unit.kind === 0 /* Unit.Kind.Atomic */) {
                const unitElements = lociElement.unit.elements;
                const h = lociElement.unit.model.atomicHierarchy;
                const { label_alt_id } = lociElement.unit.model.atomicHierarchy.atoms;
                const { index: residueIndex, offsets: residueOffsets } = h.residueAtomSegments;
                const newIndices = [];
                const indices = lociElement.indices, len = OrderedSet.size(indices);
                let i = 0;
                while (i < len) {
                    residueAltIds.clear();
                    const eI = unitElements[OrderedSet.getAt(indices, i)];
                    const rI = residueIndex[eI];
                    residueAltIds.add(label_alt_id.value(eI));
                    i++;
                    while (i < len) {
                        const eI = unitElements[OrderedSet.getAt(indices, i)];
                        if (residueIndex[eI] !== rI)
                            break;
                        residueAltIds.add(label_alt_id.value(eI));
                        i++;
                    }
                    const hasSharedAltId = residueAltIds.has('');
                    for (let j = residueOffsets[rI], _j = residueOffsets[rI + 1]; j < _j; j++) {
                        const idx = OrderedSet.indexOf(unitElements, j);
                        if (idx >= 0) {
                            const altId = label_alt_id.value(j);
                            if (!restrictToConformation || hasSharedAltId || !altId || residueAltIds.has(altId)) {
                                newIndices[newIndices.length] = idx;
                            }
                        }
                    }
                }
                elements[elements.length] = { unit: lociElement.unit, indices: makeIndexSet(newIndices) };
            }
            else {
                // coarse elements are already by-residue
                elements[elements.length] = lociElement;
            }
        }
        return Loci(loci.structure, elements);
    }
    Loci.extendToWholeResidues = extendToWholeResidues;
    function getChainSegments(unit) {
        switch (unit.kind) {
            case 0 /* Unit.Kind.Atomic */: return unit.model.atomicHierarchy.chainAtomSegments;
            case 1 /* Unit.Kind.Spheres */: return unit.model.coarseHierarchy.spheres.chainElementSegments;
            case 2 /* Unit.Kind.Gaussians */: return unit.model.coarseHierarchy.gaussians.chainElementSegments;
        }
    }
    function isWholeUnit(element) {
        return element.unit.elements.length === OrderedSet.size(element.indices);
    }
    function collectChains(unit, chainIndices, elements) {
        const { index } = getChainSegments(unit);
        const xs = unit.elements;
        let size = 0;
        for (let i = 0, _i = xs.length; i < _i; i++) {
            const eI = xs[i];
            const cI = index[eI];
            if (!chainIndices.has(cI))
                continue;
            size++;
        }
        if (size === unit.elements.length) {
            elements[elements.length] = { unit, indices: Interval.ofBounds(0, size) };
            return;
        }
        const newIndices = new Int32Array(size);
        size = 0;
        for (let i = 0, _i = xs.length; i < _i; i++) {
            const eI = xs[i];
            const cI = index[eI];
            if (!chainIndices.has(cI))
                continue;
            newIndices[size++] = i;
        }
        if (newIndices.length > 0) {
            elements[elements.length] = { unit, indices: makeIndexSet(newIndices) };
        }
    }
    function extendGroupToWholeChains(loci, start, end, isPartitioned, elements) {
        const { index: chainIndex } = getChainSegments(loci.elements[0].unit);
        const chainIndices = new Set();
        for (let lI = start; lI < end; lI++) {
            const lociElement = loci.elements[lI];
            const indices = lociElement.indices;
            const unitElements = lociElement.unit.elements;
            for (let i = 0, _i = OrderedSet.size(indices); i < _i; i++) {
                chainIndices.add(chainIndex[unitElements[OrderedSet.getAt(indices, i)]]);
            }
        }
        if (isPartitioned) {
            const baseUnit = loci.elements[0].unit;
            // TODO: check for accidental quadratic for really large structures (but should be ok).
            for (const unit of loci.structure.units) {
                if (!Unit.areSameChainOperatorGroup(unit, baseUnit))
                    continue;
                collectChains(unit, chainIndices, elements);
            }
        }
        else {
            for (let lI = start; lI < end; lI++) {
                collectChains(loci.elements[lI].unit, chainIndices, elements);
            }
        }
    }
    function extendToWholeChains(loci) {
        const elements = [];
        for (let i = 0, len = loci.elements.length; i < len; i++) {
            const e = loci.elements[i];
            if (Unit.Traits.is(e.unit.traits, Unit.Trait.Partitioned)) {
                const start = i;
                while (i < len && Unit.areSameChainOperatorGroup(loci.elements[i].unit, e.unit)) {
                    i++;
                }
                const end = i;
                i--;
                extendGroupToWholeChains(loci, start, end, true, elements);
            }
            else {
                if (isWholeUnit(e)) {
                    elements[elements.length] = e;
                }
                else {
                    extendGroupToWholeChains(loci, i, i + 1, false, elements);
                }
            }
        }
        return Loci(loci.structure, elements);
    }
    Loci.extendToWholeChains = extendToWholeChains;
    function entityModelKey(location) {
        return `${location.unit.model.id}|${StructureProperties.entity.id(location)}`;
    }
    function extendToWholeEntities(loci) {
        const elements = [];
        const l = Location.create(loci.structure);
        const entities = new Set();
        const { units } = loci.structure;
        for (let i = 0, len = loci.elements.length; i < len; i++) {
            const e = loci.elements[i];
            l.unit = e.unit;
            l.element = e.unit.elements[0];
            entities.add(entityModelKey(l));
        }
        for (let i = 0, il = units.length; i < il; ++i) {
            const unit = units[i];
            l.unit = unit;
            l.element = unit.elements[0];
            if (entities.has(entityModelKey(l))) {
                const indices = OrderedSet.ofBounds(0, unit.elements.length);
                elements[elements.length] = { unit, indices };
            }
        }
        return Loci(loci.structure, elements);
    }
    Loci.extendToWholeEntities = extendToWholeEntities;
    function extendToWholeModels(loci) {
        const elements = [];
        const models = new Set();
        const { units } = loci.structure;
        for (let i = 0, len = loci.elements.length; i < len; i++) {
            const e = loci.elements[i];
            models.add(e.unit.model.id);
        }
        for (let i = 0, il = units.length; i < il; ++i) {
            const unit = units[i];
            if (models.has(unit.model.id)) {
                const indices = OrderedSet.ofBounds(0, unit.elements.length);
                elements[elements.length] = { unit, indices };
            }
        }
        return Loci(loci.structure, elements);
    }
    Loci.extendToWholeModels = extendToWholeModels;
    function getElementIndices(elements, indices) {
        const elementIndices = [];
        for (let i = 0, il = OrderedSet.size(indices); i < il; ++i) {
            elementIndices.push(elements[OrderedSet.getAt(indices, i)]);
        }
        return SortedArray.ofSortedArray(elementIndices);
    }
    function getUnitIndices(elements, indices) {
        if (SortedArray.isRange(elements) && SortedArray.areEqual(elements, indices)) {
            return Interval.ofLength(elements.length);
        }
        return makeIndexSet(SortedArray.indicesOf(elements, indices));
    }
    function extendToAllInstances(loci) {
        const elements = [];
        const byModel = new Map();
        for (let i = 0, len = loci.elements.length; i < len; i++) {
            const e = loci.elements[i];
            const { model } = e.unit;
            const elementIndices = getElementIndices(e.unit.elements, e.indices);
            if (byModel.has(model)) {
                byModel.set(model, SortedArray.union(elementIndices, byModel.get(model)));
            }
            else {
                byModel.set(model, elementIndices);
            }
        }
        for (let i = 0, il = loci.structure.units.length; i < il; ++i) {
            const unit = loci.structure.units[i];
            const elementIndices = byModel.get(unit.model);
            if (!elementIndices)
                continue;
            const indices = getUnitIndices(unit.elements, elementIndices);
            if (OrderedSet.size(indices)) {
                elements[elements.length] = { unit, indices };
            }
        }
        return Loci(loci.structure, elements);
    }
    Loci.extendToAllInstances = extendToAllInstances;
    function extendToWholeOperators(loci) {
        const elements = [];
        const operators = new Set();
        const { units } = loci.structure;
        for (let i = 0, len = loci.elements.length; i < len; i++) {
            const e = loci.elements[i];
            operators.add(e.unit.conformation.operator.name);
        }
        for (let i = 0, il = units.length; i < il; ++i) {
            const unit = units[i];
            if (operators.has(unit.conformation.operator.name)) {
                const indices = OrderedSet.ofBounds(0, unit.elements.length);
                elements[elements.length] = { unit, indices };
            }
        }
        return Loci(loci.structure, elements);
    }
    Loci.extendToWholeOperators = extendToWholeOperators;
    //
    const boundaryHelper = new BoundaryHelper('98');
    const tempPosBoundary = Vec3();
    function getBoundary(loci, transform, result) {
        boundaryHelper.reset();
        for (const e of loci.elements) {
            const { indices } = e;
            const { elements, conformation } = e.unit;
            for (let i = 0, _i = OrderedSet.size(indices); i < _i; i++) {
                const eI = elements[OrderedSet.getAt(indices, i)];
                conformation.position(eI, tempPosBoundary);
                if (transform)
                    Vec3.transformMat4(tempPosBoundary, tempPosBoundary, transform);
                boundaryHelper.includePositionRadius(tempPosBoundary, conformation.r(eI));
            }
        }
        boundaryHelper.finishedIncludeStep();
        for (const e of loci.elements) {
            const { indices } = e;
            const { elements, conformation } = e.unit;
            for (let i = 0, _i = OrderedSet.size(indices); i < _i; i++) {
                const eI = elements[OrderedSet.getAt(indices, i)];
                conformation.position(eI, tempPosBoundary);
                if (transform)
                    Vec3.transformMat4(tempPosBoundary, tempPosBoundary, transform);
                boundaryHelper.radiusPositionRadius(tempPosBoundary, conformation.r(eI));
            }
        }
        if (result) {
            if (result.box)
                boundaryHelper.getBox(result.box);
            if (result.sphere)
                boundaryHelper.getSphere(result.sphere);
            return result;
        }
        return { box: boundaryHelper.getBox(), sphere: boundaryHelper.getSphere() };
    }
    Loci.getBoundary = getBoundary;
    const tempPos = Vec3();
    function toPositionsArray(loci, positions, offset = 0) {
        let m = offset;
        for (const e of loci.elements) {
            const { indices } = e;
            const { elements, conformation } = e.unit;
            const indexCount = OrderedSet.size(indices);
            for (let i = 0; i < indexCount; i++) {
                const eI = elements[OrderedSet.getAt(indices, i)];
                conformation.position(eI, tempPos);
                Vec3.toArray(tempPos, positions, m + i * 3);
            }
            m += indexCount * 3;
        }
        return positions;
    }
    Loci.toPositionsArray = toPositionsArray;
    function getPrincipalAxes(loci) {
        const elementCount = size(loci);
        const positions = toPositionsArray(loci, new Float32Array(3 * elementCount));
        return PrincipalAxes.ofPositions(positions);
    }
    Loci.getPrincipalAxes = getPrincipalAxes;
    function getPrincipalAxesMany(locis) {
        let elementCount = 0;
        locis.forEach(l => {
            elementCount += size(l);
        });
        const positions = new Float32Array(3 * elementCount);
        let offset = 0;
        locis.forEach(l => {
            toPositionsArray(l, positions, offset);
            offset += size(l) * 3;
        });
        return PrincipalAxes.ofPositions(positions);
    }
    Loci.getPrincipalAxesMany = getPrincipalAxesMany;
    function sourceIndex(unit, element) {
        return Unit.isAtomic(unit)
            ? unit.model.atomicHierarchy.atomSourceIndex.value(element)
            // TODO: when implemented, this should map to the source index.
            : element;
    }
    function toExpression(loci) {
        if (Loci.isEmpty(loci))
            return MS.struct.generator.empty();
        const models = loci.structure.models;
        const sourceIndexMap = new Map();
        for (const e of loci.elements) {
            const { indices } = e;
            const { elements } = e.unit;
            const key = e.unit.conformation.operator.name;
            let sourceIndices;
            if (sourceIndexMap.has(key))
                sourceIndices = sourceIndexMap.get(key).xs;
            else {
                sourceIndices = UniqueArray.create();
                sourceIndexMap.set(key, { modelLabel: e.unit.model.label, modelIndex: e.unit.model.modelNum, xs: sourceIndices });
            }
            for (let i = 0, _i = OrderedSet.size(indices); i < _i; i++) {
                const idx = sourceIndex(e.unit, elements[OrderedSet.getAt(indices, i)]);
                UniqueArray.add(sourceIndices, idx, idx);
            }
        }
        const opData = [];
        const keys = sourceIndexMap.keys();
        while (true) {
            const k = keys.next();
            if (k.done)
                break;
            const e = sourceIndexMap.get(k.value);
            opData.push(getOpData(k.value, e.xs.array, models.length > 1, e.modelLabel, e.modelIndex));
        }
        const opGroups = new Map();
        for (let i = 0, il = opData.length; i < il; ++i) {
            const d = opData[i];
            const hash = hash2(hashFnv32a(d.atom.ranges), hashFnv32a(d.atom.set));
            const key = `${hash}|${d.entity ? (d.entity.modelLabel + d.entity.modelIndex) : ''}`;
            if (opGroups.has(key)) {
                opGroups.get(key).chain.opName.push(...d.chain.opName);
            }
            else {
                opGroups.set(key, d);
            }
        }
        const opQueries = [];
        opGroups.forEach(d => {
            const { ranges, set } = d.atom;
            const { opName } = d.chain;
            const opProp = MS.struct.atomProperty.core.operatorName();
            const siProp = MS.struct.atomProperty.core.sourceIndex();
            const tests = [];
            // TODO: add set.ofRanges constructor to MolQL???
            if (set.length > 0) {
                tests[tests.length] = MS.core.set.has([MS.core.type.set(set), siProp]);
            }
            for (let rI = 0, _rI = ranges.length / 2; rI < _rI; rI++) {
                tests[tests.length] = MS.core.rel.inRange([siProp, ranges[2 * rI], ranges[2 * rI + 1]]);
            }
            if (d.entity) {
                const { modelLabel, modelIndex } = d.entity;
                opQueries.push(MS.struct.generator.atomGroups({
                    'atom-test': tests.length > 1 ? MS.core.logic.or(tests) : tests[0],
                    'chain-test': opName.length > 1
                        ? MS.core.set.has([MS.core.type.set(opName), opProp])
                        : MS.core.rel.eq([opProp, opName[0]]),
                    'entity-test': MS.core.logic.and([
                        MS.core.rel.eq([MS.struct.atomProperty.core.modelLabel(), modelLabel]),
                        MS.core.rel.eq([MS.struct.atomProperty.core.modelIndex(), modelIndex]),
                    ])
                }));
            }
            else {
                opQueries.push(MS.struct.generator.atomGroups({
                    'atom-test': tests.length > 1 ? MS.core.logic.or(tests) : tests[0],
                    'chain-test': opName.length > 1
                        ? MS.core.set.has([MS.core.type.set(opName), opProp])
                        : MS.core.rel.eq([opProp, opName[0]])
                }));
            }
        });
        return MS.struct.modifier.union([
            opQueries.length === 1
                ? opQueries[0]
                // Need to union before merge for fast performance
                : MS.struct.combinator.merge(opQueries.map(q => MS.struct.modifier.union([q])))
        ]);
    }
    Loci.toExpression = toExpression;
    function getOpData(opName, xs, multimodel, modelLabel, modelIndex) {
        sortArray(xs);
        const ranges = [];
        const set = [];
        let i = 0;
        const len = xs.length;
        while (i < len) {
            const start = i;
            i++;
            while (i < len && xs[i - 1] + 1 === xs[i])
                i++;
            const end = i;
            // TODO: is this a good value?
            if (end - start > 12) {
                ranges[ranges.length] = xs[start];
                ranges[ranges.length] = xs[end - 1];
            }
            else {
                for (let j = start; j < end; j++) {
                    set[set.length] = xs[j];
                }
            }
        }
        return multimodel
            ? {
                atom: { set, ranges },
                chain: { opName: [opName] },
                entity: { modelLabel, modelIndex }
            }
            : {
                atom: { set, ranges },
                chain: { opName: [opName] },
            };
    }
})(Loci || (Loci = {}));
