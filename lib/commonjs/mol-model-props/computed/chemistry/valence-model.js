"use strict";
/**
 * Copyright (c) 2019-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValenceModelParams = void 0;
exports.explicitValence = explicitValence;
exports.calculateHydrogensCharge = calculateHydrogensCharge;
exports.calcValenceModel = calcValenceModel;
const structure_1 = require("../../../mol-model/structure");
const types_1 = require("../../../mol-model/structure/model/properties/atomic/types");
const geometry_1 = require("./geometry");
const util_1 = require("./util");
const param_definition_1 = require("../../../mol-util/param-definition");
const debug_1 = require("../../../mol-util/debug");
const int_1 = require("../../../mol-data/int");
const types_2 = require("../../../mol-model/structure/model/types");
/**
 * TODO:
 *   Ensure proper treatment of disorder/models. e.g. V257 N in 5vim
 *   Formal charge of 255 for SO4 anion (e.g. 5ghl)
 *   Have removed a lot of explicit features (as I think they're more
 *   generally captured by better VM).
 *     Could we instead have a "delocalised negative/positive" charge
 *     feature and flag these up?
 *
 */
const tmpConjBondItA = new structure_1.Bond.ElementBondIterator();
const tmpConjBondItB = new structure_1.Bond.ElementBondIterator();
/**
 * Are we involved in some kind of pi system. Either explicitly forming
 * double bond or N, O next to a double bond, except:
 *
 *   N,O with degree 4 cannot be conjugated.
 *   N,O adjacent to P=O or S=O do not qualify (keeps sulfonamide N sp3 geom)
 */
function isConjugated(structure, unit, index) {
    const element = (0, util_1.typeSymbol)(unit, index);
    const hetero = element === "O" /* Elements.O */ || element === "N" /* Elements.N */;
    if (hetero && (0, util_1.bondCount)(structure, unit, index) === 4)
        return false;
    tmpConjBondItA.setElement(structure, unit, index);
    while (tmpConjBondItA.hasNext) {
        const bA = tmpConjBondItA.move();
        if (bA.order > 1)
            return true;
        if (hetero) {
            const elementB = (0, util_1.typeSymbol)(bA.otherUnit, bA.otherIndex);
            tmpConjBondItB.setElement(structure, bA.otherUnit, bA.otherIndex);
            while (tmpConjBondItB.hasNext) {
                const bB = tmpConjBondItB.move();
                if (bB.order > 1) {
                    if ((elementB === "P" /* Elements.P */ || elementB === "S" /* Elements.S */) &&
                        (0, util_1.typeSymbol)(bB.otherUnit, bB.otherIndex) === "O" /* Elements.O */) {
                        continue;
                    }
                    return true;
                }
            }
        }
    }
    return false;
}
function explicitValence(structure, unit, index) {
    let v = 0;
    // intra-unit bonds
    const { offset, edgeProps: { flags, order } } = unit.bonds;
    for (let i = offset[index], il = offset[index + 1]; i < il; ++i) {
        if (types_2.BondType.isCovalent(flags[i]))
            v += order[i];
    }
    // inter-unit bonds
    structure.interUnitBonds.getEdgeIndices(index, unit.id).forEach(i => {
        const b = structure.interUnitBonds.edges[i];
        if (types_2.BondType.isCovalent(b.props.flag))
            v += b.props.order;
    });
    return v;
}
const tmpChargeBondItA = new structure_1.Bond.ElementBondIterator();
const tmpChargeBondItB = new structure_1.Bond.ElementBondIterator();
/**
 * Attempts to produce a consistent charge and implicit
 * H-count for an atom.
 *
 * If both props.assignCharge and props.assignH, this
 * approximately follows the rules described in
 * https://docs.eyesopen.com/toolkits/python/oechemtk/valence.html#openeye-hydrogen-count-model
 *
 * If only charge or hydrogens are to be assigned it takes
 * a much simpler view and deduces one from the other
 */
function calculateHydrogensCharge(structure, unit, index, props, hasExplicitH) {
    const hydrogenCount = (0, util_1.bondToElementCount)(structure, unit, index, "H" /* Elements.H */);
    const element = (0, util_1.typeSymbol)(unit, index);
    let charge = (0, util_1.formalCharge)(unit, index);
    const assignCharge = (props.assignCharge === 'always' || (props.assignCharge === 'auto' && charge === 0));
    const assignH = (props.assignH === 'always' || (props.assignH === 'auto' && !hasExplicitH && hydrogenCount === 0));
    const degree = (0, util_1.bondCount)(structure, unit, index);
    const valence = explicitValence(structure, unit, index);
    const conjugated = isConjugated(structure, unit, index);
    const multiBond = (valence - degree > 0);
    let implicitHCount = 0;
    let geom = geometry_1.AtomGeometry.Unknown;
    switch (element) {
        case "H" /* Elements.H */:
            if (assignCharge) {
                if (degree === 0) {
                    charge = 1;
                    geom = geometry_1.AtomGeometry.Spherical;
                }
                else if (degree === 1) {
                    charge = 0;
                    geom = geometry_1.AtomGeometry.Terminal;
                }
            }
            break;
        case "C" /* Elements.C */:
            // TODO: Isocyanide?
            if (assignCharge) {
                charge = 0; // Assume carbon always neutral
            }
            if (assignH) {
                // Carbocation/carbanion are 3-valent
                implicitHCount = Math.max(0, 4 - valence - Math.abs(charge));
            }
            // Carbocation is planar, carbanion is tetrahedral
            geom = (0, geometry_1.assignGeometry)(degree + implicitHCount + Math.max(0, -charge));
            break;
        case "N" /* Elements.N */:
            if (assignCharge) {
                if (!assignH) { // Trust input H explicitly:
                    charge = valence - 3;
                }
                else if (conjugated && valence < 4) {
                    // Neutral unless amidine/guanidine double-bonded N:
                    if (degree - hydrogenCount === 1 && valence - hydrogenCount === 2) {
                        charge = 1;
                    }
                    else {
                        charge = 0;
                    }
                }
                else {
                    // Sulfonamide nitrogen and classed as sp3 in conjugation model but
                    // they won't be charged
                    // Don't assign charge to nitrogens bound to metals
                    tmpChargeBondItA.setElement(structure, unit, index);
                    while (tmpChargeBondItA.hasNext) {
                        const b = tmpChargeBondItA.move();
                        const elementB = (0, util_1.typeSymbol)(b.otherUnit, b.otherIndex);
                        if (elementB === "S" /* Elements.S */ || (0, types_1.isMetal)(elementB)) {
                            charge = 0;
                            break;
                        }
                        else {
                            charge = 1;
                        }
                    }
                    // TODO: Planarity sanity check?
                }
            }
            if (assignH) {
                // NH4+ -> 4, 1' amide -> 2, nitro N/N+ depiction -> 0
                implicitHCount = Math.max(0, 3 - valence + charge);
            }
            if (conjugated && !multiBond) {
                // Amide, anilinic N etc. cannot consider lone-pair for geometry purposes
                // Anilinic N geometry is depenent on ring electronics, for our purposes we
                // assume it's trigonal!
                geom = (0, geometry_1.assignGeometry)(degree + implicitHCount - charge);
            }
            else {
                // Everything else, pyridine, amine, nitrile, lp plays normal role:
                geom = (0, geometry_1.assignGeometry)(degree + implicitHCount + 1 - charge);
            }
            break;
        case "O" /* Elements.O */:
            if (assignCharge) {
                if (!assignH) {
                    charge = valence - 2;
                }
                if (valence === 1) {
                    tmpChargeBondItA.setElement(structure, unit, index);
                    b1: while (tmpChargeBondItA.hasNext) {
                        const bA = tmpChargeBondItA.move();
                        tmpChargeBondItB.setElement(structure, bA.otherUnit, bA.otherIndex);
                        while (tmpChargeBondItB.hasNext) {
                            const bB = tmpChargeBondItB.move();
                            if (!(bB.otherUnit === unit && bB.otherIndex === index) &&
                                (0, util_1.typeSymbol)(bB.otherUnit, bB.otherIndex) === "O" /* Elements.O */ &&
                                bB.order === 2) {
                                charge = -1;
                                break b1;
                            }
                        }
                    }
                }
            }
            if (assignH) {
                // ethanol -> 1, carboxylate -> -1
                implicitHCount = Math.max(0, 2 - valence + charge);
            }
            if (conjugated && !multiBond) {
                // carboxylate OH, phenol OH, one lone-pair taken up with conjugation
                geom = (0, geometry_1.assignGeometry)(degree + implicitHCount - charge + 1);
            }
            else {
                // Carbonyl (trigonal)
                geom = (0, geometry_1.assignGeometry)(degree + implicitHCount - charge + 2);
            }
            break;
        // Only handles thiols/thiolates/thioether/sulfonium. Sulfoxides and higher
        // oxidiation states are assumed neutral S (charge carried on O if required)
        case "S" /* Elements.S */:
            if (assignCharge) {
                if (!assignH) {
                    if (valence <= 3 && (0, util_1.bondToElementCount)(structure, unit, index, "O" /* Elements.O */) === 0) {
                        charge = valence - 2; // e.g. explicitly deprotonated thiol
                    }
                    else {
                        charge = 0;
                    }
                }
            }
            if (assignH) {
                if (valence < 2) {
                    implicitHCount = Math.max(0, 2 - valence + charge);
                }
            }
            if (valence <= 3) {
                // Thiol, thiolate, tioether -> tetrahedral
                geom = (0, geometry_1.assignGeometry)(degree + implicitHCount - charge + 2);
            }
            break;
        case "F" /* Elements.F */:
        case "CL" /* Elements.CL */:
        case "BR" /* Elements.BR */:
        case "I" /* Elements.I */:
        case "AT" /* Elements.AT */:
            // Never implicitly protonate halides
            if (assignCharge) {
                charge = valence - 1;
            }
            break;
        case "LI" /* Elements.LI */:
        case "NA" /* Elements.NA */:
        case "K" /* Elements.K */:
        case "RB" /* Elements.RB */:
        case "CS" /* Elements.CS */:
        case "FR" /* Elements.FR */:
            if (assignCharge) {
                charge = 1 - valence;
            }
            break;
        case "BE" /* Elements.BE */:
        case "MG" /* Elements.MG */:
        case "CA" /* Elements.CA */:
        case "SR" /* Elements.SR */:
        case "BA" /* Elements.BA */:
        case "RA" /* Elements.RA */:
            if (assignCharge) {
                charge = 2 - valence;
            }
            break;
        default:
            if (debug_1.isDebugMode) {
                console.warn('Requested charge, protonation for an unhandled element', element);
            }
    }
    return [charge, implicitHCount, implicitHCount + hydrogenCount, geom];
}
function calcUnitValenceModel(structure, unit, props) {
    const n = unit.elements.length;
    const charge = new Int8Array(n);
    const implicitH = new Int8Array(n);
    const totalH = new Int8Array(n);
    const idealGeometry = new Int8Array(n);
    // always use root UnitIndex to take the topology of the whole structure in account
    const hasParent = !!structure.parent;
    let mapping;
    if (hasParent) {
        const rootUnit = structure.root.unitMap.get(unit.id);
        mapping = int_1.SortedArray.indicesOf(rootUnit.elements, unit.elements);
        if (mapping.length !== unit.elements.length) {
            throw new Error('expected to find an index for every element');
        }
        unit = rootUnit;
        structure = structure.root;
    }
    let hasExplicitH = false;
    for (let i = 0; i < n; ++i) {
        const j = (hasParent ? mapping[i] : i);
        if ((0, util_1.typeSymbol)(unit, j) === "H" /* Elements.H */) {
            hasExplicitH = true;
            break;
        }
    }
    for (let i = 0; i < n; ++i) {
        const j = (hasParent ? mapping[i] : i);
        const [chg, implH, totH, geom] = calculateHydrogensCharge(structure, unit, j, props, hasExplicitH);
        charge[i] = chg;
        implicitH[i] = implH;
        totalH[i] = totH;
        idealGeometry[i] = geom;
    }
    return { charge, implicitH, totalH, idealGeometry };
}
exports.ValenceModelParams = {
    assignCharge: param_definition_1.ParamDefinition.Select('auto', [['always', 'always'], ['auto', 'auto'], ['never', 'never']]),
    assignH: param_definition_1.ParamDefinition.Select('auto', [['always', 'always'], ['auto', 'auto'], ['never', 'never']]),
};
async function calcValenceModel(ctx, structure, props) {
    const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.ValenceModelParams), ...props };
    const map = new Map();
    const cacheKey = `valence-model-${JSON.stringify(p)}`;
    for (let i = 0, il = structure.units.length; i < il; ++i) {
        const u = structure.units[i];
        if (structure_1.Unit.isAtomic(u)) {
            let valenceModel;
            if (u.transientCache.has(cacheKey)) {
                valenceModel = u.transientCache.get(cacheKey);
            }
            else {
                valenceModel = calcUnitValenceModel(structure, u, p);
                u.transientCache.set(cacheKey, valenceModel);
            }
            map.set(u.id, valenceModel);
        }
    }
    return map;
}
