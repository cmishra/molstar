"use strict";
/**
 * Copyright (c) 2017-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
const symmetry_operator_1 = require("../../../mol-math/geometry/symmetry-operator");
const model_1 = require("../model");
const geometry_1 = require("../../../mol-math/geometry");
const bonds_1 = require("./unit/bonds");
const mol_util_1 = require("../../../mol-util");
const rings_1 = require("./unit/rings");
const int_1 = require("../../../mol-data/int");
const util_1 = require("../../../mol-data/util");
const polymer_1 = require("./util/polymer");
const principal_axes_1 = require("./util/principal-axes");
const boundary_1 = require("../../../mol-math/geometry/boundary");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const index_pair_1 = require("../../../mol-model-formats/structure/property/bonds/index-pair");
const element_set_intra_bond_cache_1 = require("./unit/bonds/element-set-intra-bond-cache");
const symmetry_1 = require("../../../mol-model-formats/structure/property/symmetry");
const resonance_1 = require("./unit/resonance");
var Unit;
(function (Unit) {
    // To use with isolatedModules
    let Kinds;
    (function (Kinds) {
        Kinds[Kinds["Atomic"] = 0] = "Atomic";
        Kinds[Kinds["Spheres"] = 1] = "Spheres";
        Kinds[Kinds["Gaussians"] = 2] = "Gaussians";
    })(Kinds = Unit.Kinds || (Unit.Kinds = {}));
    function isAtomic(u) { return u.kind === 0 /* Kind.Atomic */; }
    Unit.isAtomic = isAtomic;
    function isCoarse(u) { return u.kind === 1 /* Kind.Spheres */ || u.kind === 2 /* Kind.Gaussians */; }
    Unit.isCoarse = isCoarse;
    function isSpheres(u) { return u.kind === 1 /* Kind.Spheres */; }
    Unit.isSpheres = isSpheres;
    function isGaussians(u) { return u.kind === 2 /* Kind.Gaussians */; }
    Unit.isGaussians = isGaussians;
    function create(id, invariantId, chainGroupId, traits, kind, model, operator, elements, props) {
        switch (kind) {
            case 0 /* Kind.Atomic */: return new Atomic(id, invariantId, chainGroupId, traits, model, elements, symmetry_operator_1.SymmetryOperator.createMapping(operator, model.atomicConformation), props !== null && props !== void 0 ? props : AtomicProperties());
            case 1 /* Kind.Spheres */: return createCoarse(id, invariantId, chainGroupId, traits, model, 1 /* Kind.Spheres */, elements, symmetry_operator_1.SymmetryOperator.createMapping(operator, model.coarseConformation.spheres, getSphereRadiusFunc(model)), props !== null && props !== void 0 ? props : CoarseProperties());
            case 2 /* Kind.Gaussians */: return createCoarse(id, invariantId, chainGroupId, traits, model, 2 /* Kind.Gaussians */, elements, symmetry_operator_1.SymmetryOperator.createMapping(operator, model.coarseConformation.gaussians, getGaussianRadiusFunc(model)), props !== null && props !== void 0 ? props : CoarseProperties());
        }
    }
    Unit.create = create;
    function getUnitIndexMap(units) {
        const unitIndexMap = int_1.IntMap.Mutable();
        for (let i = 0, _i = units.length; i < _i; i++) {
            unitIndexMap.set(units[i].id, i);
        }
        return unitIndexMap;
    }
    function getTransformHash(units) {
        const ids = [];
        for (let i = 0, _i = units.length; i < _i; i++) {
            ids.push(units[i].id);
        }
        return (0, util_1.hashFnv32a)(ids);
    }
    function SymmetryGroup(units) {
        const props = {};
        return {
            elements: units[0].elements,
            units,
            get unitIndexMap() {
                if (props.unitIndexMap)
                    return props.unitIndexMap;
                props.unitIndexMap = getUnitIndexMap(units);
                return props.unitIndexMap;
            },
            hashCode: hashUnit(units[0]),
            transformHash: getTransformHash(units)
        };
    }
    Unit.SymmetryGroup = SymmetryGroup;
    (function (SymmetryGroup) {
        function areInvariantElementsEqual(a, b) {
            if (a.hashCode !== b.hashCode)
                return false;
            return int_1.SortedArray.areEqual(a.elements, b.elements);
        }
        SymmetryGroup.areInvariantElementsEqual = areInvariantElementsEqual;
        function getUnitSymmetryGroupsIndexMap(symmetryGroups) {
            const unitSymmetryGroupsIndexMap = int_1.IntMap.Mutable();
            for (let i = 0, il = symmetryGroups.length; i < il; ++i) {
                const sg = symmetryGroups[i];
                for (let j = 0, jl = sg.units.length; j < jl; ++j) {
                    unitSymmetryGroupsIndexMap.set(sg.units[j].id, i);
                }
            }
            return unitSymmetryGroupsIndexMap;
        }
        SymmetryGroup.getUnitSymmetryGroupsIndexMap = getUnitSymmetryGroupsIndexMap;
    })(SymmetryGroup = Unit.SymmetryGroup || (Unit.SymmetryGroup = {}));
    function conformationId(unit) {
        return Unit.isAtomic(unit) ? unit.model.atomicConformation.id : unit.model.coarseConformation.id;
    }
    Unit.conformationId = conformationId;
    function hashUnit(u) {
        return (0, util_1.hash2)(u.invariantId, int_1.SortedArray.hashCode(u.elements));
    }
    Unit.hashUnit = hashUnit;
    let Trait;
    (function (Trait) {
        Trait[Trait["None"] = 0] = "None";
        Trait[Trait["MultiChain"] = 1] = "MultiChain";
        Trait[Trait["Partitioned"] = 2] = "Partitioned";
        Trait[Trait["FastBoundary"] = 4] = "FastBoundary";
        Trait[Trait["Water"] = 8] = "Water";
    })(Trait = Unit.Trait || (Unit.Trait = {}));
    let Traits;
    (function (Traits) {
        Traits.is = mol_util_1.BitFlags.has;
        Traits.create = mol_util_1.BitFlags.create;
    })(Traits = Unit.Traits || (Unit.Traits = {}));
    function BaseProperties() {
        return {};
    }
    function getSphereRadiusFunc(model) {
        const r = model.coarseConformation.spheres.radius;
        return (i) => r[i];
    }
    function getGaussianRadiusFunc(_model) {
        // TODO: compute radius for gaussians
        return (i) => 0;
    }
    /**
     * A bulding block of a structure that corresponds
     * to a "natural group of atoms" (most often a "chain")
     * together with a transformation (rotation and translation)
     * that is dynamically applied to the underlying atom set.
     *
     * An atom set can be referenced by multiple different units which
     * makes construction of assemblies and spacegroups very efficient.
     */
    class Atomic {
        get transientCache() {
            if (this._transientCache === void 0)
                this._transientCache = new Map();
            return this._transientCache;
        }
        getChild(elements) {
            if (elements.length === this.elements.length)
                return this;
            return new Atomic(this.id, this.invariantId, this.chainGroupId, this.traits, this.model, elements, this.conformation, AtomicProperties());
        }
        getCopy(id, invariantId, chainGroupId, options) {
            const unit = new Atomic(id, invariantId, chainGroupId, this.traits, this.model, this.elements, this.conformation, this.props);
            if (options === null || options === void 0 ? void 0 : options.propagateTransientCache) {
                unit._transientCache = this._transientCache;
            }
            return unit;
        }
        applyOperator(id, operator, dontCompose = false) {
            const op = dontCompose ? operator : symmetry_operator_1.SymmetryOperator.compose(this.conformation.operator, operator);
            return new Atomic(id, this.invariantId, this.chainGroupId, this.traits, this.model, this.elements, symmetry_operator_1.SymmetryOperator.createMapping(op, this.model.atomicConformation, this.conformation.r), this.props);
        }
        remapModel(model, dynamicBonds, props) {
            var _a, _b;
            if (!props) {
                props = {
                    ...this.props,
                    bonds: dynamicBonds && !((_b = (_a = this.props.bonds) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.canRemap)
                        ? undefined
                        : tryRemapBonds(this, this.props.bonds, model, dynamicBonds)
                };
                if (!Unit.isSameConformation(this, model)) {
                    props.boundary = undefined;
                    props.lookup3d = undefined;
                    props.principalAxes = undefined;
                }
            }
            let operator = this.conformation.operator;
            const symmetry = symmetry_1.ModelSymmetry.Provider.get(model);
            if (operator.spgrOp !== -1 && symmetry && symmetry !== symmetry_1.ModelSymmetry.Provider.get(this.model)) {
                const [i, j, k] = operator.hkl;
                const { toFractional } = symmetry.spacegroup.cell;
                const ref = linear_algebra_1.Vec3.transformMat4((0, linear_algebra_1.Vec3)(), model_1.Model.getCenter(model), toFractional);
                operator = geometry_1.Spacegroup.getSymmetryOperatorRef(symmetry.spacegroup, operator.spgrOp, i, j, k, ref);
            }
            const conformation = (this.model.atomicConformation !== model.atomicConformation || operator !== this.conformation.operator)
                ? symmetry_operator_1.SymmetryOperator.createMapping(operator, model.atomicConformation)
                : this.conformation;
            return new Atomic(this.id, this.invariantId, this.chainGroupId, this.traits, model, this.elements, conformation, props);
        }
        get boundary() {
            if (this.props.boundary)
                return this.props.boundary;
            const { x, y, z } = this.model.atomicConformation;
            this.props.boundary = Traits.is(this.traits, Trait.FastBoundary)
                ? (0, boundary_1.getFastBoundary)({ x, y, z, indices: this.elements })
                : (0, boundary_1.getBoundary)({ x, y, z, indices: this.elements });
            return this.props.boundary;
        }
        get lookup3d() {
            if (this.props.lookup3d)
                return this.props.lookup3d;
            const { x, y, z } = this.model.atomicConformation;
            this.props.lookup3d = (0, geometry_1.GridLookup3D)({ x, y, z, indices: this.elements }, this.boundary);
            return this.props.lookup3d;
        }
        get principalAxes() {
            if (this.props.principalAxes)
                return this.props.principalAxes;
            this.props.principalAxes = (0, principal_axes_1.getPrincipalAxes)(this);
            return this.props.principalAxes;
        }
        get bonds() {
            var _a;
            if (this.props.bonds)
                return this.props.bonds;
            const cache = element_set_intra_bond_cache_1.ElementSetIntraBondCache.get(this.model);
            let bonds = cache.get(this.elements);
            if (!bonds) {
                bonds = (0, bonds_1.computeIntraUnitBonds)(this);
                if ((_a = bonds.props) === null || _a === void 0 ? void 0 : _a.cacheable) {
                    cache.set(this.elements, bonds);
                }
            }
            this.props.bonds = bonds;
            return this.props.bonds;
        }
        get rings() {
            if (this.props.rings)
                return this.props.rings;
            this.props.rings = rings_1.UnitRings.create(this);
            return this.props.rings;
        }
        get resonance() {
            if (this.props.resonance)
                return this.props.resonance;
            this.props.resonance = (0, resonance_1.getResonance)(this);
            return this.props.resonance;
        }
        get polymerElements() {
            if (this.props.polymerElements)
                return this.props.polymerElements;
            this.props.polymerElements = (0, polymer_1.getAtomicPolymerElements)(this);
            return this.props.polymerElements;
        }
        get gapElements() {
            if (this.props.gapElements)
                return this.props.gapElements;
            this.props.gapElements = (0, polymer_1.getAtomicGapElements)(this);
            return this.props.gapElements;
        }
        get nucleotideElements() {
            if (this.props.nucleotideElements)
                return this.props.nucleotideElements;
            this.props.nucleotideElements = (0, polymer_1.getNucleotideElements)(this);
            return this.props.nucleotideElements;
        }
        get proteinElements() {
            if (this.props.proteinElements)
                return this.props.proteinElements;
            this.props.proteinElements = (0, polymer_1.getProteinElements)(this);
            return this.props.proteinElements;
        }
        get residueCount() {
            if (this.props.residueCount !== undefined)
                return this.props.residueCount;
            let residueCount = 0;
            const residueIt = int_1.Segmentation.transientSegments(this.model.atomicHierarchy.residueAtomSegments, this.elements);
            while (residueIt.hasNext) {
                residueIt.move();
                residueCount += 1;
            }
            this.props.residueCount = residueCount;
            return this.props.residueCount;
        }
        getResidueIndex(elementIndex) {
            return this.residueIndex[this.elements[elementIndex]];
        }
        constructor(id, invariantId, chainGroupId, traits, model, elements, conformation, props) {
            this.kind = 0 /* Kind.Atomic */;
            this.objectPrimitive = 'atomistic';
            this._transientCache = undefined;
            this.id = id;
            this.invariantId = invariantId;
            this.chainGroupId = chainGroupId;
            this.traits = traits;
            this.model = model;
            this.elements = elements;
            this.conformation = conformation;
            this.residueIndex = model.atomicHierarchy.residueAtomSegments.index;
            this.chainIndex = model.atomicHierarchy.chainAtomSegments.index;
            this.props = props;
        }
    }
    Unit.Atomic = Atomic;
    function AtomicProperties() {
        return BaseProperties();
    }
    class Coarse {
        get transientCache() {
            if (this._transientCache === void 0)
                this._transientCache = new Map();
            return this._transientCache;
        }
        getChild(elements) {
            if (elements.length === this.elements.length)
                return this; // lets call this an ugly temporary hack
            return createCoarse(this.id, this.invariantId, this.chainGroupId, this.traits, this.model, this.kind, elements, this.conformation, CoarseProperties());
        }
        getCopy(id, invariantId, chainGroupId, options) {
            const unit = createCoarse(id, invariantId, chainGroupId, this.traits, this.model, this.kind, this.elements, this.conformation, this.props);
            if (options === null || options === void 0 ? void 0 : options.propagateTransientCache) {
                unit._transientCache = this._transientCache;
            }
            return unit;
        }
        applyOperator(id, operator, dontCompose = false) {
            const op = dontCompose ? operator : symmetry_operator_1.SymmetryOperator.compose(this.conformation.operator, operator);
            return createCoarse(id, this.invariantId, this.chainGroupId, this.traits, this.model, this.kind, this.elements, symmetry_operator_1.SymmetryOperator.createMapping(op, this.getCoarseConformation(), this.conformation.r), this.props);
        }
        remapModel(model, dynamicBonds, props) {
            const coarseConformation = this.getCoarseConformation();
            const modelCoarseConformation = getCoarseConformation(this.kind, model);
            if (!props) {
                props = { ...this.props };
                if (!Unit.isSameConformation(this, model)) { // TODO get rid of casting
                    props.boundary = undefined;
                    props.lookup3d = undefined;
                    props.principalAxes = undefined;
                }
            }
            const conformation = coarseConformation !== modelCoarseConformation
                ? symmetry_operator_1.SymmetryOperator.createMapping(this.conformation.operator, modelCoarseConformation, this.kind === 1 /* Unit.Kind.Spheres */ ? getSphereRadiusFunc(model) : getGaussianRadiusFunc(model))
                : this.conformation;
            return new Coarse(this.id, this.invariantId, this.chainGroupId, this.traits, model, this.kind, this.elements, conformation, props); // TODO get rid of casting
        }
        get boundary() {
            if (this.props.boundary)
                return this.props.boundary;
            // TODO: support sphere radius?
            const { x, y, z } = this.getCoarseConformation();
            this.props.boundary = Traits.is(this.traits, Trait.FastBoundary)
                ? (0, boundary_1.getFastBoundary)({ x, y, z, indices: this.elements })
                : (0, boundary_1.getBoundary)({ x, y, z, indices: this.elements });
            return this.props.boundary;
        }
        get lookup3d() {
            if (this.props.lookup3d)
                return this.props.lookup3d;
            // TODO: support sphere radius?
            const { x, y, z } = this.getCoarseConformation();
            this.props.lookup3d = (0, geometry_1.GridLookup3D)({ x, y, z, indices: this.elements }, this.boundary);
            return this.props.lookup3d;
        }
        get principalAxes() {
            if (this.props.principalAxes)
                return this.props.principalAxes;
            this.props.principalAxes = (0, principal_axes_1.getPrincipalAxes)(this); // TODO get rid of casting
            return this.props.principalAxes;
        }
        get polymerElements() {
            if (this.props.polymerElements)
                return this.props.polymerElements;
            this.props.polymerElements = (0, polymer_1.getCoarsePolymerElements)(this); // TODO get rid of casting
            return this.props.polymerElements;
        }
        get gapElements() {
            if (this.props.gapElements)
                return this.props.gapElements;
            this.props.gapElements = (0, polymer_1.getCoarseGapElements)(this); // TODO get rid of casting
            return this.props.gapElements;
        }
        getCoarseConformation() {
            return getCoarseConformation(this.kind, this.model);
        }
        constructor(id, invariantId, chainGroupId, traits, model, kind, elements, conformation, props) {
            this._transientCache = undefined;
            this.kind = kind;
            this.objectPrimitive = kind === 1 /* Kind.Spheres */ ? 'sphere' : 'gaussian';
            this.id = id;
            this.invariantId = invariantId;
            this.chainGroupId = chainGroupId;
            this.traits = traits;
            this.model = model;
            this.elements = elements;
            this.conformation = conformation;
            this.coarseElements = kind === 1 /* Kind.Spheres */ ? model.coarseHierarchy.spheres : model.coarseHierarchy.gaussians;
            this.coarseConformation = (kind === 1 /* Kind.Spheres */ ? model.coarseConformation.spheres : model.coarseConformation.gaussians);
            this.props = props;
        }
    }
    function getCoarseConformation(kind, model) {
        return kind === 1 /* Kind.Spheres */ ? model.coarseConformation.spheres : model.coarseConformation.gaussians;
    }
    function CoarseProperties() {
        return BaseProperties();
    }
    class Spheres extends Coarse {
    }
    Unit.Spheres = Spheres;
    class Gaussians extends Coarse {
    }
    Unit.Gaussians = Gaussians;
    function createCoarse(id, invariantId, chainGroupId, traits, model, kind, elements, conformation, props) {
        return new Coarse(id, invariantId, chainGroupId, traits, model, kind, elements, conformation, props); // lets call this an ugly temporary hack
    }
    function areSameChainOperatorGroup(a, b) {
        return a.chainGroupId === b.chainGroupId && a.conformation.operator.name === b.conformation.operator.name;
    }
    Unit.areSameChainOperatorGroup = areSameChainOperatorGroup;
    function areOperatorsEqual(a, b) {
        return linear_algebra_1.Mat4.areEqual(a.conformation.operator.matrix, b.conformation.operator.matrix, 1e-6);
    }
    Unit.areOperatorsEqual = areOperatorsEqual;
    function areConformationsEqual(a, b) {
        if (a === b)
            return true;
        if (!int_1.SortedArray.areEqual(a.elements, b.elements))
            return false;
        return isSameConformation(a, b.model);
    }
    Unit.areConformationsEqual = areConformationsEqual;
    function tryRemapBonds(a, old, model, dynamicBonds) {
        // TODO: should include additional checks?
        var _a;
        if (!old)
            return void 0;
        if (a.model.atomicConformation.id === model.atomicConformation.id)
            return old;
        const oldIndex = index_pair_1.IndexPairBonds.Provider.get(a.model);
        if (oldIndex) {
            const newIndex = index_pair_1.IndexPairBonds.Provider.get(model);
            // TODO: check the actual indices instead of just reference equality?
            if (!newIndex || oldIndex === newIndex)
                return old;
            return void 0;
        }
        if (((_a = old.props) === null || _a === void 0 ? void 0 : _a.canRemap) || !dynamicBonds) {
            return old;
        }
        return isSameConformation(a, model) ? old : void 0;
    }
    function isSameConformation(u, model) {
        const coordsHistory = model_1.Model.CoordinatesHistory.get(model_1.Model.getRoot(model));
        if (coordsHistory)
            return coordsHistory.areEqual(u.elements, u.kind, model);
        const xs = u.elements;
        const { x: xa, y: ya, z: za } = u.conformation.coordinates;
        const { x: xb, y: yb, z: zb } = getModelConformationOfKind(u.kind, model);
        for (let i = 0, _i = xs.length; i < _i; i++) {
            const u = xs[i];
            if (xa[u] !== xb[u] || ya[u] !== yb[u] || za[u] !== zb[u])
                return false;
        }
        return true;
    }
    Unit.isSameConformation = isSameConformation;
    function getModelConformationOfKind(kind, model) {
        return kind === 0 /* Kind.Atomic */ ? model.atomicConformation :
            kind === 1 /* Kind.Spheres */ ? model.coarseConformation.spheres :
                model.coarseConformation.gaussians;
    }
    Unit.getModelConformationOfKind = getModelConformationOfKind;
    function getConformation(u) {
        return getModelConformationOfKind(u.kind, u.model);
    }
    Unit.getConformation = getConformation;
    function getModelHierarchyOfKind(kind, model) {
        return kind === 0 /* Kind.Atomic */ ? model.atomicHierarchy :
            kind === 1 /* Kind.Spheres */ ? model.coarseHierarchy.spheres :
                model.coarseHierarchy.gaussians;
    }
    Unit.getModelHierarchyOfKind = getModelHierarchyOfKind;
    function getHierarchy(u) {
        return getModelHierarchyOfKind(u.kind, u.model);
    }
    Unit.getHierarchy = getHierarchy;
})(Unit || (exports.Unit = Unit = {}));
