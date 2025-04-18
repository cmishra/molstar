"use strict";
/**
 * Copyright (c) 2017-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Structure = void 0;
const int_1 = require("../../../mol-data/int");
const generic_1 = require("../../../mol-data/generic");
const symmetry_operator_1 = require("../../../mol-math/geometry/symmetry-operator");
const model_1 = require("../model");
const util_1 = require("../../../mol-data/util");
const element_1 = require("./element");
const unit_1 = require("./unit");
const lookup3d_1 = require("./util/lookup3d");
const subset_builder_1 = require("./util/subset-builder");
const bonds_1 = require("./unit/bonds");
const symmetry_1 = require("./symmetry");
const properties_1 = require("./properties");
const compute_1 = require("./carbohydrates/compute");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const id_factory_1 = require("../../../mol-util/id-factory");
const custom_property_1 = require("../../custom-property");
const selection_1 = require("../query/selection");
const custom_structure_property_1 = require("../../../mol-model-props/common/custom-structure-property");
const mol_task_1 = require("../../../mol-task");
const boundary_1 = require("./util/boundary");
const mapping_1 = require("./mapping");
class Structure {
    subsetBuilder(isSorted) {
        return new subset_builder_1.StructureSubsetBuilder(this, isSorted);
    }
    /** Count of all elements in the structure, i.e. the sum of the elements in the units */
    get elementCount() {
        return this.state.elementCount;
    }
    /** Count of all bonds (intra- and inter-unit) in the structure */
    get bondCount() {
        if (this.state.bondCount === -1) {
            this.state.bondCount = (this.interUnitBonds.edgeCount / 2) + bonds_1.Bond.getIntraUnitBondCount(this);
        }
        return this.state.bondCount;
    }
    get hasCustomProperties() {
        return !!this.state.customProps && this.state.customProps.all.length > 0;
    }
    get customPropertyDescriptors() {
        if (!this.state.customProps)
            this.state.customProps = new custom_property_1.CustomProperties();
        return this.state.customProps;
    }
    /**
     * Property data unique to this instance of the structure.
     */
    get currentPropertyData() {
        if (!this.state.propertyData)
            this.state.propertyData = Object.create(null);
        return this.state.propertyData;
    }
    /**
     * Property data of the parent structure if it exists, currentPropertyData otherwise.
     */
    get inheritedPropertyData() {
        return this.parent ? this.parent.currentPropertyData : this.currentPropertyData;
    }
    /** Count of all polymer residues in the structure */
    get polymerResidueCount() {
        if (this.state.polymerResidueCount === -1) {
            this.state.polymerResidueCount = getPolymerResidueCount(this);
        }
        return this.state.polymerResidueCount;
    }
    /** Count of all polymer gaps in the structure */
    get polymerGapCount() {
        if (this.state.polymerGapCount === -1) {
            this.state.polymerGapCount = getPolymerGapCount(this);
        }
        return this.state.polymerGapCount;
    }
    get polymerUnitCount() {
        if (this.state.polymerUnitCount === -1) {
            this.state.polymerUnitCount = getPolymerUnitCount(this);
        }
        return this.state.polymerUnitCount;
    }
    get uniqueElementCount() {
        if (this.state.uniqueElementCount === -1) {
            this.state.uniqueElementCount = getUniqueElementCount(this);
        }
        return this.state.uniqueElementCount;
    }
    get atomicResidueCount() {
        if (this.state.atomicResidueCount === -1) {
            this.state.atomicResidueCount = getAtomicResidueCount(this);
        }
        return this.state.atomicResidueCount;
    }
    /**
     * True if any model the structure is based on is coarse grained.
     * @see Model.isCoarseGrained
     */
    get isCoarseGrained() {
        return this.models.some(m => model_1.Model.isCoarseGrained(m));
    }
    get isEmpty() {
        return this.units.length === 0;
    }
    get hashCode() {
        if (this.state.hashCode !== -1)
            return this.state.hashCode;
        return this.computeHash();
    }
    /** Hash based on all unit.id values in the structure, reflecting the units transformation */
    get transformHash() {
        if (this.state.transformHash !== -1)
            return this.state.transformHash;
        this.state.transformHash = (0, util_1.hashFnv32a)(this.units.map(u => u.id));
        return this.state.transformHash;
    }
    computeHash() {
        let hash = 23;
        for (let i = 0, _i = this.units.length; i < _i; i++) {
            const u = this.units[i];
            hash = (31 * hash + u.id) | 0;
            hash = (31 * hash + int_1.SortedArray.hashCode(u.elements)) | 0;
        }
        hash = (31 * hash + this.elementCount) | 0;
        hash = (0, util_1.hash1)(hash);
        if (hash === -1)
            hash = 0;
        this.state.hashCode = hash;
        return hash;
    }
    /** Returns a new element location iterator */
    elementLocations() {
        return new Structure.ElementLocationIterator(this);
    }
    /** The parent or itself in case this is the root */
    get root() {
        var _a;
        return (_a = this.state.parent) !== null && _a !== void 0 ? _a : this;
    }
    /** The root/top-most parent or `undefined` in case this is the root */
    get parent() {
        return this.state.parent;
    }
    /**
     * Conformation transformation that was applied to every unit of this structure.
     *
     * Coordinate system applies to the *current* structure only.
     * A parent structure can have a different coordinate system and thefore it has to be composed "manualy"
     * by the consumer.
     */
    get coordinateSystem() {
        return this.state.coordinateSystem;
    }
    get label() {
        return this.state.label;
    }
    get boundary() {
        if (this.state.boundary)
            return this.state.boundary;
        this.state.boundary = (0, boundary_1.computeStructureBoundary)(this);
        return this.state.boundary;
    }
    get lookup3d() {
        if (this.state.lookup3d)
            return this.state.lookup3d;
        this.state.lookup3d = new lookup3d_1.StructureLookup3D(this);
        return this.state.lookup3d;
    }
    get interUnitBonds() {
        if (this.state.interUnitBonds)
            return this.state.interUnitBonds;
        if (this.parent && this.state.dynamicBonds === this.parent.state.dynamicBonds &&
            this.parent.state.interUnitBonds && this.parent.state.interUnitBonds.edgeCount === 0) {
            // no need to compute InterUnitBonds if parent's ones are empty
            this.state.interUnitBonds = new bonds_1.InterUnitBonds(new Map());
        }
        else {
            this.state.interUnitBonds = (0, bonds_1.computeInterUnitBonds)(this, {
                ignoreWater: !this.dynamicBonds,
                ignoreIon: !this.dynamicBonds,
                validUnit: this.state.interBondsValidUnit,
                validUnitPair: this.state.interBondsValidUnitPair,
            });
        }
        return this.state.interUnitBonds;
    }
    get dynamicBonds() {
        return this.state.dynamicBonds;
    }
    get interBondsValidUnit() {
        return this.state.interBondsValidUnit;
    }
    get interBondsValidUnitPair() {
        return this.state.interBondsValidUnitPair;
    }
    get unitSymmetryGroups() {
        if (this.state.unitSymmetryGroups)
            return this.state.unitSymmetryGroups;
        this.state.unitSymmetryGroups = symmetry_1.StructureSymmetry.computeTransformGroups(this);
        return this.state.unitSymmetryGroups;
    }
    /** Maps unit.id to index of SymmetryGroup in unitSymmetryGroups array */
    get unitSymmetryGroupsIndexMap() {
        if (this.state.unitSymmetryGroupsIndexMap)
            return this.state.unitSymmetryGroupsIndexMap;
        this.state.unitSymmetryGroupsIndexMap = unit_1.Unit.SymmetryGroup.getUnitSymmetryGroupsIndexMap(this.unitSymmetryGroups);
        return this.state.unitSymmetryGroupsIndexMap;
    }
    get carbohydrates() {
        if (this.state.carbohydrates)
            return this.state.carbohydrates;
        this.state.carbohydrates = (0, compute_1.computeCarbohydrates)(this);
        return this.state.carbohydrates;
    }
    get models() {
        if (this.state.models)
            return this.state.models;
        this.state.models = getModels(this);
        return this.state.models;
    }
    get uniqueResidueNames() {
        return this.state.uniqueResidueNames
            || (this.state.uniqueResidueNames = getUniqueResidueNames(this));
    }
    get uniqueElementSymbols() {
        return this.state.uniqueElementSymbols
            || (this.state.uniqueElementSymbols = getUniqueElementSymbols(this));
    }
    get entityIndices() {
        return this.state.entityIndices
            || (this.state.entityIndices = getEntityIndices(this));
    }
    get uniqueAtomicResidueIndices() {
        return this.state.uniqueAtomicResidueIndices
            || (this.state.uniqueAtomicResidueIndices = getUniqueAtomicResidueIndices(this));
    }
    /** Contains only atomic units */
    get isAtomic() {
        for (const u of this.units)
            if (!unit_1.Unit.isAtomic(u))
                return false;
        return true;
    }
    /** Contains some atomic units */
    get hasAtomic() {
        for (const u of this.units)
            if (unit_1.Unit.isAtomic(u))
                return true;
        return false;
    }
    /** Contains only coarse units */
    get isCoarse() {
        for (const u of this.units)
            if (!unit_1.Unit.isCoarse(u))
                return false;
        return true;
    }
    /** Contains some coarse units */
    get hasCoarse() {
        for (const u of this.units)
            if (unit_1.Unit.isCoarse(u))
                return true;
        return false;
    }
    /**
     * Provides mapping for serial element indices accross all units.
     *
     * Note that this is especially costly for structures with many units that are grouped
     * into few symmetry groups. Use only when needed and prefer `StructureElement`
     * to address elements in a structure.
     */
    get serialMapping() {
        return this.state.serialMapping || (this.state.serialMapping = (0, mapping_1.getSerialMapping)(this));
    }
    get intraUnitBondMapping() {
        return this.state.intraUnitBondMapping || (this.state.intraUnitBondMapping = (0, mapping_1.getIntraUnitBondMapping)(this));
    }
    /**
     * If the structure is based on a single model or has a master-/representative-model, return it.
     * Otherwise throw an exception.
     */
    get model() {
        if (this.state.model)
            return this.state.model;
        if (this.state.representativeModel)
            return this.state.representativeModel;
        if (this.state.masterModel)
            return this.state.masterModel;
        const models = this.models;
        if (models.length > 1) {
            throw new Error('The structure is based on multiple models and has neither a master- nor a representative-model.');
        }
        this.state.model = models[0];
        return this.state.model;
    }
    /** The master-model, other models can have bonds to it  */
    get masterModel() {
        return this.state.masterModel;
    }
    /** A representative model, e.g. the first model of a trajectory */
    get representativeModel() {
        return this.state.representativeModel;
    }
    hasElement(e) {
        if (!this.unitMap.has(e.unit.id))
            return false;
        return int_1.SortedArray.has(this.unitMap.get(e.unit.id).elements, e.element);
    }
    getModelIndex(m) {
        return this.models.indexOf(m);
    }
    remapModel(m) {
        const { dynamicBonds, interUnitBonds, parent } = this.state;
        const units = [];
        for (const ug of this.unitSymmetryGroups) {
            const unit = ug.units[0].remapModel(m, dynamicBonds);
            units.push(unit);
            for (let i = 1, il = ug.units.length; i < il; ++i) {
                const u = ug.units[i];
                units.push(u.remapModel(m, dynamicBonds, unit.props));
            }
        }
        return Structure.create(units, {
            parent: parent === null || parent === void 0 ? void 0 : parent.remapModel(m),
            label: this.label,
            interUnitBonds: dynamicBonds ? undefined : interUnitBonds,
            dynamicBonds,
            interBondsValidUnit: this.state.interBondsValidUnit,
            interBondsValidUnitPair: this.state.interBondsValidUnitPair,
            coordinateSystem: this.state.coordinateSystem,
            masterModel: this.state.masterModel,
            representativeModel: this.state.representativeModel,
        });
    }
    /**
     * For `structure` with `parent` this returns a proxy that
     * targets `parent` and has `structure` attached as a child.
     */
    asParent() {
        if (this._proxy)
            return this._proxy;
        if (this.parent) {
            const p = this.parent.coordinateSystem.isIdentity ? this.parent : Structure.transform(this.parent, this.parent.coordinateSystem.inverse);
            const s = this.coordinateSystem.isIdentity ? p : Structure.transform(p, this.coordinateSystem.matrix);
            this._proxy = new Structure(s.units, s.unitMap, s.unitIndexMap, { ...s.state, dynamicBonds: this.dynamicBonds }, { child: this, target: this.parent });
        }
        else {
            this._proxy = this;
        }
        return this._proxy;
    }
    get child() {
        return this._child;
    }
    /** Get the proxy target. Usefull for equality checks. */
    get target() {
        var _a;
        return (_a = this._target) !== null && _a !== void 0 ? _a : this;
    }
    /**
     * @param units Array of all units in the structure, sorted by unit.id
     * @param unitMap Maps unit.id to index of unit in units array
     * @param unitIndexMap Array of all units in the structure, sorted by unit.id
     */
    constructor(units, unitMap, unitIndexMap, state, asParent) {
        this.units = units;
        this.unitMap = unitMap;
        this.unitIndexMap = unitIndexMap;
        this.state = state;
        // always assign to ensure object shape
        this._child = asParent === null || asParent === void 0 ? void 0 : asParent.child;
        this._target = asParent === null || asParent === void 0 ? void 0 : asParent.target;
        this._proxy = undefined;
    }
}
exports.Structure = Structure;
function cmpUnits(units, i, j) {
    return units[i].id - units[j].id;
}
function getModels(s) {
    const { units } = s;
    const arr = generic_1.UniqueArray.create();
    for (const u of units) {
        generic_1.UniqueArray.add(arr, u.model.id, u.model);
    }
    return arr.array;
}
function getUniqueResidueNames(s) {
    const { microheterogeneityCompIds } = properties_1.StructureProperties.residue;
    const names = new Set();
    const loc = element_1.StructureElement.Location.create(s);
    for (const unitGroup of s.unitSymmetryGroups) {
        const unit = unitGroup.units[0];
        // TODO: support coarse unit?
        if (!unit_1.Unit.isAtomic(unit))
            continue;
        const residues = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, unit.elements);
        loc.unit = unit;
        while (residues.hasNext) {
            const seg = residues.move();
            loc.element = unit.elements[seg.start];
            const compIds = microheterogeneityCompIds(loc);
            for (const compId of compIds)
                names.add(compId);
        }
    }
    return names;
}
function getUniqueElementSymbols(s) {
    const prop = properties_1.StructureProperties.atom.type_symbol;
    const symbols = new Set();
    const loc = element_1.StructureElement.Location.create(s);
    for (const unitGroup of s.unitSymmetryGroups) {
        const unit = unitGroup.units[0];
        if (!unit_1.Unit.isAtomic(unit))
            continue;
        loc.unit = unit;
        for (let i = 0, il = unit.elements.length; i < il; ++i) {
            loc.element = unit.elements[i];
            symbols.add(prop(loc));
        }
    }
    return symbols;
}
function getEntityIndices(structure) {
    const { units } = structure;
    const l = element_1.StructureElement.Location.create(structure);
    const keys = generic_1.UniqueArray.create();
    for (const unit of units) {
        const prop = unit.kind === 0 /* Unit.Kind.Atomic */ ? properties_1.StructureProperties.entity.key : properties_1.StructureProperties.coarse.entityKey;
        l.unit = unit;
        const elements = unit.elements;
        const chainsIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, elements);
        while (chainsIt.hasNext) {
            const chainSegment = chainsIt.move();
            l.element = elements[chainSegment.start];
            const key = prop(l);
            generic_1.UniqueArray.add(keys, key, key);
        }
    }
    (0, util_1.sortArray)(keys.array);
    return keys.array;
}
function getUniqueAtomicResidueIndices(structure) {
    const map = new Map();
    const modelIds = [];
    const unitGroups = structure.unitSymmetryGroups;
    for (const unitGroup of unitGroups) {
        const unit = unitGroup.units[0];
        if (!unit_1.Unit.isAtomic(unit))
            continue;
        let uniqueResidues;
        if (map.has(unit.model.id))
            uniqueResidues = map.get(unit.model.id);
        else {
            uniqueResidues = generic_1.UniqueArray.create();
            modelIds.push(unit.model.id);
            map.set(unit.model.id, uniqueResidues);
        }
        const residues = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, unit.elements);
        while (residues.hasNext) {
            const seg = residues.move();
            generic_1.UniqueArray.add(uniqueResidues, seg.index, seg.index);
        }
    }
    const ret = new Map();
    for (const id of modelIds) {
        const array = map.get(id).array;
        (0, util_1.sortArray)(array);
        ret.set(id, array);
    }
    return ret;
}
function getUniqueElementCount(structure) {
    const { unitSymmetryGroups } = structure;
    let uniqueElementCount = 0;
    for (let i = 0, _i = unitSymmetryGroups.length; i < _i; i++) {
        uniqueElementCount += unitSymmetryGroups[i].elements.length;
    }
    return uniqueElementCount;
}
function getPolymerResidueCount(structure) {
    const { units } = structure;
    let polymerResidueCount = 0;
    for (let i = 0, _i = units.length; i < _i; i++) {
        polymerResidueCount += units[i].polymerElements.length;
    }
    return polymerResidueCount;
}
function getPolymerGapCount(structure) {
    const { units } = structure;
    let polymerGapCount = 0;
    for (let i = 0, _i = units.length; i < _i; i++) {
        polymerGapCount += units[i].gapElements.length / 2;
    }
    return polymerGapCount;
}
function getPolymerUnitCount(structure) {
    const { units } = structure;
    let polymerUnitCount = 0;
    for (let i = 0, _i = units.length; i < _i; i++) {
        if (units[i].polymerElements.length > 0)
            polymerUnitCount += 1;
    }
    return polymerUnitCount;
}
function getAtomicResidueCount(structure) {
    const { units } = structure;
    let atomicResidueCount = 0;
    for (let i = 0, _i = units.length; i < _i; i++) {
        const unit = units[i];
        if (!unit_1.Unit.isAtomic(unit))
            continue;
        const { elements, residueIndex } = unit;
        let idx = -1;
        let prevIdx = -1;
        for (let j = 0, jl = elements.length; j < jl; ++j) {
            idx = residueIndex[elements[j]];
            if (idx !== prevIdx) {
                atomicResidueCount += 1;
                prevIdx = idx;
            }
        }
    }
    return atomicResidueCount;
}
(function (Structure) {
    Structure.Empty = create([]);
    function Loci(structure) {
        return { kind: 'structure-loci', structure };
    }
    Structure.Loci = Loci;
    function toStructureElementLoci(structure) {
        const elements = [];
        for (const unit of structure.units) {
            elements.push({ unit, indices: int_1.Interval.ofBounds(0, unit.elements.length) });
        }
        return element_1.StructureElement.Loci(structure, elements);
    }
    Structure.toStructureElementLoci = toStructureElementLoci;
    function toSubStructureElementLoci(parent, structure) {
        return selection_1.StructureSelection.toLociWithSourceUnits(selection_1.StructureSelection.Singletons(parent, structure));
    }
    Structure.toSubStructureElementLoci = toSubStructureElementLoci;
    function isLoci(x) {
        return !!x && x.kind === 'structure-loci';
    }
    Structure.isLoci = isLoci;
    function areLociEqual(a, b) {
        return a.structure === b.structure;
    }
    Structure.areLociEqual = areLociEqual;
    function isLociEmpty(loci) {
        return loci.structure.isEmpty;
    }
    Structure.isLociEmpty = isLociEmpty;
    function remapLoci(loci, structure) {
        if (structure === loci.structure)
            return loci;
        return Loci(structure);
    }
    Structure.remapLoci = remapLoci;
    function create(units, props = {}) {
        // init units
        const unitMap = int_1.IntMap.Mutable();
        const unitIndexMap = int_1.IntMap.Mutable();
        let elementCount = 0;
        let isSorted = true;
        let lastId = units.length > 0 ? units[0].id : 0;
        for (let i = 0, _i = units.length; i < _i; i++) {
            const u = units[i];
            unitMap.set(u.id, u);
            elementCount += u.elements.length;
            if (u.id < lastId)
                isSorted = false;
            lastId = u.id;
        }
        if (!isSorted)
            (0, util_1.sort)(units, 0, units.length, cmpUnits, util_1.arraySwap);
        for (let i = 0, _i = units.length; i < _i; i++) {
            unitIndexMap.set(units[i].id, i);
        }
        // initial state
        const state = {
            hashCode: -1,
            transformHash: -1,
            elementCount,
            bondCount: -1,
            uniqueElementCount: -1,
            atomicResidueCount: -1,
            polymerResidueCount: -1,
            polymerGapCount: -1,
            polymerUnitCount: -1,
            dynamicBonds: false,
            coordinateSystem: symmetry_operator_1.SymmetryOperator.Default,
            label: ''
        };
        // handle props
        if (props.parent)
            state.parent = props.parent.parent || props.parent;
        if (props.interUnitBonds)
            state.interUnitBonds = props.interUnitBonds;
        if (props.interBondsValidUnit)
            state.interBondsValidUnit = props.interBondsValidUnit;
        else if (props.parent)
            state.interBondsValidUnit = props.parent.interBondsValidUnit;
        if (props.interBondsValidUnitPair)
            state.interBondsValidUnitPair = props.interBondsValidUnitPair;
        else if (props.parent)
            state.interBondsValidUnitPair = props.parent.interBondsValidUnitPair;
        if (props.dynamicBonds)
            state.dynamicBonds = props.dynamicBonds;
        else if (props.parent)
            state.dynamicBonds = props.parent.dynamicBonds;
        if (props.coordinateSystem)
            state.coordinateSystem = props.coordinateSystem;
        else if (props.parent)
            state.coordinateSystem = props.parent.coordinateSystem;
        if (props.label)
            state.label = props.label;
        else if (props.parent)
            state.label = props.parent.label;
        if (props.masterModel)
            state.masterModel = props.masterModel;
        else if (props.parent)
            state.masterModel = props.parent.masterModel;
        if (props.representativeModel)
            state.representativeModel = props.representativeModel;
        else if (props.parent)
            state.representativeModel = props.parent.representativeModel;
        return new Structure(units, unitMap, unitIndexMap, state);
    }
    Structure.create = create;
    async function ofTrajectory(trajectory, ctx) {
        if (trajectory.frameCount === 0)
            return Structure.Empty;
        const units = [];
        let first = void 0;
        let count = 0;
        for (let i = 0, il = trajectory.frameCount; i < il; ++i) {
            const frame = await mol_task_1.Task.resolveInContext(trajectory.getFrameAtIndex(i), ctx);
            if (!first)
                first = frame;
            const structure = ofModel(frame);
            for (let j = 0, jl = structure.units.length; j < jl; ++j) {
                const u = structure.units[j];
                const invariantId = u.invariantId + count;
                const chainGroupId = u.chainGroupId + count;
                const newUnit = unit_1.Unit.create(units.length, invariantId, chainGroupId, u.traits, u.kind, u.model, u.conformation.operator, u.elements);
                units.push(newUnit);
            }
            count = units.length;
        }
        return create(units, { representativeModel: first, label: first.label });
    }
    Structure.ofTrajectory = ofTrajectory;
    /**
     * Construct a Structure from a model.
     *
     * Generally, a single unit corresponds to a single chain, with the exception
     * of consecutive "single atom chains" with same entity_id and same auth_asym_id.
     */
    function ofModel(model, props = {}) {
        const chains = model.atomicHierarchy.chainAtomSegments;
        const { index } = model.atomicHierarchy;
        const { auth_asym_id } = model.atomicHierarchy.chains;
        const { atomicChainOperatorMappinng } = model;
        const builder = new StructureBuilder({ label: model.label, ...props });
        for (let c = 0; c < chains.count; c++) {
            const operator = atomicChainOperatorMappinng.get(c) || symmetry_operator_1.SymmetryOperator.Default;
            const start = chains.offsets[c];
            let isMultiChain = false;
            let isWater = false;
            if (isWaterChain(model, c)) {
                isWater = true;
                // merge consecutive water chains
                while (c + 1 < chains.count && isWaterChain(model, c + 1)) {
                    const op1 = atomicChainOperatorMappinng.get(c);
                    const op2 = atomicChainOperatorMappinng.get(c + 1);
                    if (op1 !== op2)
                        break;
                    isMultiChain = true;
                    c++;
                }
            }
            else {
                // merge consecutive "single atom chains" with same entity_id and auth_asym_id
                while (c + 1 < chains.count
                    && chains.offsets[c + 1] - chains.offsets[c] === 1
                    && chains.offsets[c + 2] - chains.offsets[c + 1] === 1) {
                    const e1 = index.getEntityFromChain(c);
                    const e2 = index.getEntityFromChain(c + 1);
                    if (e1 !== e2)
                        break;
                    const a1 = auth_asym_id.value(c);
                    const a2 = auth_asym_id.value(c + 1);
                    if (a1 !== a2)
                        break;
                    const op1 = atomicChainOperatorMappinng.get(c);
                    const op2 = atomicChainOperatorMappinng.get(c + 1);
                    if (op1 !== op2)
                        break;
                    isMultiChain = true;
                    c++;
                }
            }
            const elements = int_1.SortedArray.ofBounds(start, chains.offsets[c + 1]);
            let traits = unit_1.Unit.Trait.None;
            if (isMultiChain)
                traits |= unit_1.Unit.Trait.MultiChain;
            if (isWater)
                traits |= unit_1.Unit.Trait.Water;
            builder.addUnit(0 /* Unit.Kind.Atomic */, model, operator, elements, traits);
        }
        const cs = model.coarseHierarchy;
        if (cs.isDefined) {
            if (cs.spheres.count > 0) {
                addCoarseUnits(builder, model, model.coarseHierarchy.spheres, 1 /* Unit.Kind.Spheres */);
            }
            if (cs.gaussians.count > 0) {
                addCoarseUnits(builder, model, model.coarseHierarchy.gaussians, 2 /* Unit.Kind.Gaussians */);
            }
        }
        return builder.getStructure();
    }
    Structure.ofModel = ofModel;
    function isWaterChain(model, chainIndex) {
        const e = model.atomicHierarchy.index.getEntityFromChain(chainIndex);
        return model.entities.data.type.value(e) === 'water';
    }
    function addCoarseUnits(builder, model, elements, kind) {
        const { chainElementSegments } = elements;
        for (let cI = 0; cI < chainElementSegments.count; cI++) {
            const elements = int_1.SortedArray.ofBounds(chainElementSegments.offsets[cI], chainElementSegments.offsets[cI + 1]);
            builder.addUnit(kind, model, symmetry_operator_1.SymmetryOperator.Default, elements, unit_1.Unit.Trait.None);
        }
    }
    function transform(s, transform) {
        if (linear_algebra_1.Mat4.isIdentity(transform))
            return s;
        if (!linear_algebra_1.Mat4.isRotationAndTranslation(transform, symmetry_operator_1.SymmetryOperator.RotationTranslationEpsilon))
            throw new Error('Only rotation/translation combination can be applied.');
        const units = [];
        for (const u of s.units) {
            const old = u.conformation.operator;
            const op = symmetry_operator_1.SymmetryOperator.create(old.name, transform, old);
            units.push(u.applyOperator(u.id, op));
        }
        const cs = s.coordinateSystem;
        const newCS = symmetry_operator_1.SymmetryOperator.compose(symmetry_operator_1.SymmetryOperator.create(cs.name, transform, cs), cs);
        return create(units, { parent: s, coordinateSystem: newCS });
    }
    Structure.transform = transform;
    class StructureBuilder {
        beginChainGroup() {
            this.chainGroupId++;
            this.inChainGroup = true;
        }
        endChainGroup() {
            this.inChainGroup = false;
        }
        addUnit(kind, model, operator, elements, traits, invariantId) {
            if (invariantId === undefined)
                invariantId = this.invariantId();
            const chainGroupId = this.inChainGroup ? this.chainGroupId : ++this.chainGroupId;
            const unit = unit_1.Unit.create(this.units.length, invariantId, chainGroupId, traits, kind, model, operator, elements);
            return this.add(unit);
        }
        copyUnit(unit, options) {
            let invariantId = options === null || options === void 0 ? void 0 : options.invariantId;
            if (invariantId === undefined)
                invariantId = this.invariantId();
            const chainGroupId = this.inChainGroup ? this.chainGroupId : ++this.chainGroupId;
            const newUnit = unit.getCopy(this.units.length, invariantId, chainGroupId, options);
            return this.add(newUnit);
        }
        add(unit) {
            // this is to avoid adding many identical single atom units,
            // for example, from 'degenerate' spacegroups
            // - Diamond (COD 9008564)
            if (unit.elements.length === 1) {
                unit.conformation.position(unit.elements[0], this.p);
                const hash = [unit.invariantId, this.p[0], this.p[1], this.p[2]].join('|');
                if (this.singleElementUnits.has(hash)) {
                    return this.singleElementUnits.get(hash);
                }
                else {
                    this.singleElementUnits.set(hash, unit);
                }
            }
            this.units.push(unit);
            return unit;
        }
        addWithOperator(unit, operator, dontCompose = false) {
            return this.add(unit.applyOperator(this.units.length, operator, dontCompose));
        }
        getStructure() {
            return create(this.units, this.props);
        }
        get isEmpty() {
            return this.units.length === 0;
        }
        constructor(props = {}) {
            this.props = props;
            this.units = [];
            this.invariantId = (0, id_factory_1.idFactory)();
            this.chainGroupId = -1;
            this.inChainGroup = false;
            this.p = (0, linear_algebra_1.Vec3)();
            this.singleElementUnits = new Map();
        }
    }
    Structure.StructureBuilder = StructureBuilder;
    function Builder(props = {}) {
        return new StructureBuilder(props);
    }
    Structure.Builder = Builder;
    function hashCode(s) {
        return s.hashCode;
    }
    Structure.hashCode = hashCode;
    /** Hash based on all unit.model conformation values in the structure */
    function conformationHash(s) {
        return (0, util_1.hashString)(s.units.map(u => unit_1.Unit.conformationId(u)).join('|'));
    }
    Structure.conformationHash = conformationHash;
    // TODO: there should be a version that properly supports partitioned units
    function areUnitIdsEqual(a, b) {
        if (a === b)
            return true;
        if (a.elementCount !== b.elementCount)
            return false;
        const len = a.units.length;
        if (len !== b.units.length)
            return false;
        for (let i = 0; i < len; i++) {
            if (a.units[i].id !== b.units[i].id)
                return false;
        }
        return true;
    }
    Structure.areUnitIdsEqual = areUnitIdsEqual;
    function areUnitIdsAndIndicesEqual(a, b) {
        if (a === b)
            return true;
        if (!areUnitIdsEqual(a, b))
            return false;
        for (let i = 0, il = a.units.length; i < il; i++) {
            if (!int_1.SortedArray.areEqual(a.units[i].elements, b.units[i].elements))
                return false;
        }
        return true;
    }
    Structure.areUnitIdsAndIndicesEqual = areUnitIdsAndIndicesEqual;
    function areHierarchiesEqual(a, b) {
        if (a.hashCode !== b.hashCode)
            return false;
        const len = a.models.length;
        if (len !== b.models.length)
            return false;
        for (let i = 0; i < len; i++) {
            if (!model_1.Model.areHierarchiesEqual(a.models[i], b.models[i]))
                return false;
        }
        return true;
    }
    Structure.areHierarchiesEqual = areHierarchiesEqual;
    function areEquivalent(a, b) {
        return a === b || (a.hashCode === b.hashCode &&
            symmetry_1.StructureSymmetry.areTransformGroupsEquivalent(a.unitSymmetryGroups, b.unitSymmetryGroups));
    }
    Structure.areEquivalent = areEquivalent;
    /** Check if the structures or their parents are equivalent */
    function areRootsEquivalent(a, b) {
        return areEquivalent(a.root, b.root);
    }
    Structure.areRootsEquivalent = areRootsEquivalent;
    /** Check if the structures or their parents are equal */
    function areRootsEqual(a, b) {
        return a.root === b.root;
    }
    Structure.areRootsEqual = areRootsEqual;
    class ElementLocationIterator {
        move() {
            this.advance();
            this.current.element = this.elements[this.idx];
            return this.current;
        }
        advance() {
            if (this.idx < this.maxIdx) {
                this.idx++;
                if (this.idx === this.maxIdx)
                    this.hasNext = this.unitIndex + 1 < this.structure.units.length;
                return;
            }
            this.idx = 0;
            this.unitIndex++;
            if (this.unitIndex >= this.structure.units.length) {
                this.hasNext = false;
                return;
            }
            this.current.unit = this.structure.units[this.unitIndex];
            this.elements = this.current.unit.elements;
            this.maxIdx = this.elements.length - 1;
            if (this.maxIdx === 0) {
                this.hasNext = this.unitIndex + 1 < this.structure.units.length;
            }
        }
        constructor(structure) {
            this.structure = structure;
            this.unitIndex = 0;
            this.maxIdx = 0;
            this.idx = -1;
            this.current = element_1.StructureElement.Location.create(structure);
            this.hasNext = structure.elementCount > 0;
            if (this.hasNext) {
                this.elements = structure.units[0].elements;
                this.maxIdx = this.elements.length - 1;
                this.current.unit = structure.units[0];
            }
        }
    }
    Structure.ElementLocationIterator = ElementLocationIterator;
    const distVec = (0, linear_algebra_1.Vec3)();
    function unitElementMinDistance(unit, p, eRadius) {
        const { elements, conformation: c } = unit, dV = distVec;
        let minD = Number.MAX_VALUE;
        for (let i = 0, _i = elements.length; i < _i; i++) {
            const e = elements[i];
            const d = linear_algebra_1.Vec3.distance(p, c.position(e, dV)) - eRadius - c.r(e);
            if (d < minD)
                minD = d;
        }
        return minD;
    }
    function minDistanceToPoint(s, point, radius) {
        const { units } = s;
        let minD = Number.MAX_VALUE;
        for (let i = 0, _i = units.length; i < _i; i++) {
            const unit = units[i];
            const d = unitElementMinDistance(unit, point, radius);
            if (d < minD)
                minD = d;
        }
        return minD;
    }
    Structure.minDistanceToPoint = minDistanceToPoint;
    const distPivot = (0, linear_algebra_1.Vec3)();
    function distance(a, b) {
        if (a.elementCount === 0 || b.elementCount === 0)
            return 0;
        const { units } = a;
        let minD = Number.MAX_VALUE;
        for (let i = 0, _i = units.length; i < _i; i++) {
            const unit = units[i];
            const { elements, conformation: c } = unit;
            for (let i = 0, _i = elements.length; i < _i; i++) {
                const e = elements[i];
                const d = minDistanceToPoint(b, c.position(e, distPivot), c.r(e));
                if (d < minD)
                    minD = d;
            }
        }
        return minD;
    }
    Structure.distance = distance;
    function elementDescription(s) {
        return s.elementCount === 1 ? '1 element' : `${s.elementCount} elements`;
    }
    Structure.elementDescription = elementDescription;
    function validUnitPair(s, a, b) {
        return s.masterModel
            ? a.model === b.model || a.model === s.masterModel || b.model === s.masterModel
            : a.model === b.model;
    }
    Structure.validUnitPair = validUnitPair;
    /**
     * Iterate over all unit pairs of a structure and invokes callback for valid units
     * and unit pairs if their boundaries are within a max distance.
     */
    function eachUnitPair(structure, callback, props) {
        const { maxRadius, validUnit, validUnitPair } = props;
        if (!structure.units.some(u => validUnit(u)))
            return;
        const lookup = structure.lookup3d;
        const imageCenter = (0, linear_algebra_1.Vec3)();
        for (const unitA of structure.units) {
            if (!validUnit(unitA))
                continue;
            const bs = unitA.boundary.sphere;
            linear_algebra_1.Vec3.transformMat4(imageCenter, bs.center, unitA.conformation.operator.matrix);
            const closeUnits = lookup.findUnitIndices(imageCenter[0], imageCenter[1], imageCenter[2], bs.radius + maxRadius);
            for (let i = 0; i < closeUnits.count; i++) {
                const unitB = structure.units[closeUnits.indices[i]];
                if (unitA.id >= unitB.id)
                    continue;
                if (!validUnit(unitB) || !validUnitPair(unitA, unitB))
                    continue;
                if (unitB.elements.length >= unitA.elements.length)
                    callback(unitA, unitB);
                else
                    callback(unitB, unitA);
            }
        }
    }
    Structure.eachUnitPair = eachUnitPair;
    ;
    function eachAtomicHierarchyElement(structure, { chain, residue, atom }) {
        const l = element_1.StructureElement.Location.create(structure);
        for (const unit of structure.units) {
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            const { elements } = unit;
            const chainsIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, elements);
            const residuesIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
            while (chainsIt.hasNext) {
                const chainSegment = chainsIt.move();
                if (chain) {
                    l.element = elements[chainSegment.start];
                    chain(l);
                }
                if (!residue && !atom)
                    continue;
                residuesIt.setSegment(chainSegment);
                while (residuesIt.hasNext) {
                    const residueSegment = residuesIt.move();
                    if (residue) {
                        l.element = elements[residueSegment.start];
                        residue(l);
                    }
                    if (!atom)
                        continue;
                    for (let j = residueSegment.start, _j = residueSegment.end; j < _j; j++) {
                        l.element = elements[j];
                        atom(l);
                    }
                }
            }
        }
    }
    Structure.eachAtomicHierarchyElement = eachAtomicHierarchyElement;
    //
    Structure.DefaultSizeThresholds = {
        /** Must be lower to be small */
        smallResidueCount: 10,
        /** Must be lower to be medium */
        mediumResidueCount: 5000,
        /** Must be lower to be large (big ribosomes like 4UG0 should still be `large`) */
        largeResidueCount: 30000,
        /**
         * Structures above `largeResidueCount` are consider huge when they have
         * a `highSymmetryUnitCount` or gigantic when not
         */
        highSymmetryUnitCount: 10,
        /** Fiber-like structure are consider small when below this */
        fiberResidueCount: 15,
    };
    function getPolymerSymmetryGroups(structure) {
        return structure.unitSymmetryGroups.filter(ug => ug.units[0].polymerElements.length > 0);
    }
    /**
     * Try to match fiber-like structures like 6nk4
     */
    function isFiberLike(structure, thresholds) {
        const polymerSymmetryGroups = getPolymerSymmetryGroups(structure);
        return (polymerSymmetryGroups.length === 1 &&
            polymerSymmetryGroups[0].units.length > 2 &&
            polymerSymmetryGroups[0].units[0].polymerElements.length < thresholds.fiberResidueCount);
    }
    function hasHighSymmetry(structure, thresholds) {
        const polymerSymmetryGroups = getPolymerSymmetryGroups(structure);
        return (polymerSymmetryGroups.length >= 1 &&
            polymerSymmetryGroups[0].units.length > thresholds.highSymmetryUnitCount);
    }
    let Size;
    (function (Size) {
        Size[Size["Small"] = 0] = "Small";
        Size[Size["Medium"] = 1] = "Medium";
        Size[Size["Large"] = 2] = "Large";
        Size[Size["Huge"] = 3] = "Huge";
        Size[Size["Gigantic"] = 4] = "Gigantic";
    })(Size = Structure.Size || (Structure.Size = {}));
    /**
     * @param residueCountFactor - modifies the threshold counts, useful when estimating
     *                             the size of a structure comprised of multiple models
     */
    function getSize(structure, thresholds = {}, residueCountFactor = 1) {
        const t = { ...Structure.DefaultSizeThresholds, ...thresholds };
        if (structure.polymerResidueCount >= t.largeResidueCount * residueCountFactor) {
            if (hasHighSymmetry(structure, t)) {
                return Size.Huge;
            }
            else {
                return Size.Gigantic;
            }
        }
        else if (isFiberLike(structure, t)) {
            return Size.Small;
        }
        else if (structure.polymerResidueCount < t.smallResidueCount * residueCountFactor) {
            return Size.Small;
        }
        else if (structure.polymerResidueCount < t.mediumResidueCount * residueCountFactor) {
            return Size.Medium;
        }
        else {
            return Size.Large;
        }
    }
    Structure.getSize = getSize;
    Structure.Index = custom_structure_property_1.CustomStructureProperty.createSimple('index', 'root');
    Structure.MaxIndex = custom_structure_property_1.CustomStructureProperty.createSimple('max_index', 'root');
    const PrincipalAxesProp = '__PrincipalAxes__';
    function getPrincipalAxes(structure) {
        if (structure.currentPropertyData[PrincipalAxesProp])
            return structure.currentPropertyData[PrincipalAxesProp];
        const principalAxes = element_1.StructureElement.Loci.getPrincipalAxes(Structure.toStructureElementLoci(structure));
        structure.currentPropertyData[PrincipalAxesProp] = principalAxes;
        return principalAxes;
    }
    Structure.getPrincipalAxes = getPrincipalAxes;
})(Structure || (exports.Structure = Structure = {}));
