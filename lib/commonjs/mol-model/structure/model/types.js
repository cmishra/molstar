"use strict";
/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultResidueHydrophobicity = exports.ResidueHydrophobicity = exports.BondType = exports.DefaultMaxAsa = exports.MaxAsa = exports.SecondaryStructureType = exports.PolymerNames = exports.isPyrimidineBase = exports.isPurineBase = exports.BaseNames = exports.PyrimidineBaseNames = exports.PurineBaseNames = exports.PeptideBaseNames = exports.DnaBaseNames = exports.RnaBaseNames = exports.CommonProteinCaps = exports.AminoAcidNames = exports.AminoAcidNamesD = exports.AminoAcidNamesL = exports.WaterNames = exports.LipidComponentTypeNames = exports.IonComponentTypeNames = exports.OtherComponentTypeNames = exports.SaccharideComponentTypeNames = exports.RNAComponentTypeNames = exports.DNAComponentTypeNames = exports.ProteinComponentTypeNames = exports.OtherProteinComponentTypeNames = exports.ProteinTerminusComponentTypeNames = exports.BetaProteinComponentTypeNames = exports.GammaProteinComponentTypeNames = exports.LProteinComponentTypeNames = exports.DProteinComponentTypeNames = exports.NucleicBackboneAtoms = exports.ProteinBackboneAtoms = exports.PolymerTypeAtomRoleId = exports.EntityType = void 0;
exports.ElementSymbol = ElementSymbol;
exports.getElementFromAtomicNumber = getElementFromAtomicNumber;
exports.getMoleculeType = getMoleculeType;
exports.getPolymerType = getPolymerType;
exports.getComponentType = getComponentType;
exports.getDefaultChemicalComponent = getDefaultChemicalComponent;
exports.getEntityType = getEntityType;
exports.getEntitySubtype = getEntitySubtype;
exports.isPolymer = isPolymer;
exports.isNucleic = isNucleic;
exports.isProtein = isProtein;
const bit_flags_1 = require("../../../mol-util/bit-flags");
const constants_1 = require("../structure/carbohydrates/constants");
const set_1 = require("../../../mol-util/set");
const lipids_1 = require("./types/lipids");
const ions_1 = require("./types/ions");
const _esCache = (function () {
    const cache = Object.create(null);
    const letters = [];
    for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++)
        letters[letters.length] = String.fromCharCode(i);
    for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++)
        letters[letters.length] = String.fromCharCode(i);
    for (let i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); i++)
        letters[letters.length] = String.fromCharCode(i);
    for (const k of letters) {
        cache[k] = k.toUpperCase();
        for (const l of letters) {
            cache[k + l] = (k + l).toUpperCase();
            for (const m of letters) {
                cache[k + l + m] = (k + l + m).toUpperCase();
            }
        }
    }
    return cache;
}());
function ElementSymbol(s) {
    return _esCache[s] || s.toUpperCase();
}
const _elementByAtomicNumber = new Map([[1, 'H'], [2, 'He'], [3, 'Li'], [4, 'Be'], [5, 'B'], [6, 'C'], [7, 'N'], [8, 'O'], [9, 'F'], [10, 'Ne'], [11, 'Na'], [12, 'Mg'], [13, 'Al'], [14, 'Si'], [15, 'P'], [16, 'S'], [17, 'Cl'], [18, 'Ar'], [19, 'K'], [20, 'Ca'], [21, 'Sc'], [22, 'Ti'], [23, 'V'], [24, 'Cr'], [25, 'Mn'], [26, 'Fe'], [27, 'Co'], [28, 'Ni'], [29, 'Cu'], [30, 'Zn'], [31, 'Ga'], [32, 'Ge'], [33, 'As'], [34, 'Se'], [35, 'Br'], [36, 'Kr'], [37, 'Rb'], [38, 'Sr'], [39, 'Y'], [40, 'Zr'], [41, 'Nb'], [42, 'Mo'], [43, 'Tc'], [44, 'Ru'], [45, 'Rh'], [46, 'Pd'], [47, 'Ag'], [48, 'Cd'], [49, 'In'], [50, 'Sn'], [51, 'Sb'], [52, 'Te'], [53, 'I'], [54, 'Xe'], [55, 'Cs'], [56, 'Ba'], [57, 'La'], [58, 'Ce'], [59, 'Pr'], [60, 'Nd'], [61, 'Pm'], [62, 'Sm'], [63, 'Eu'], [64, 'Gd'], [65, 'Tb'], [66, 'Dy'], [67, 'Ho'], [68, 'Er'], [69, 'Tm'], [70, 'Yb'], [71, 'Lu'], [72, 'Hf'], [73, 'Ta'], [74, 'W'], [75, 'Re'], [76, 'Os'], [77, 'Ir'], [78, 'Pt'], [79, 'Au'], [80, 'Hg'], [81, 'Tl'], [82, 'Pb'], [83, 'Bi'], [84, 'Po'], [85, 'At'], [86, 'Rn'], [87, 'Fr'], [88, 'Ra'], [89, 'Ac'], [90, 'Th'], [91, 'Pa'], [92, 'U'], [93, 'Np'], [94, 'Pu'], [95, 'Am'], [96, 'Cm'], [97, 'Bk'], [98, 'Cf'], [99, 'Es'], [100, 'Fm'], [101, 'Md'], [102, 'No'], [103, 'Lr'], [104, 'Rf'], [105, 'Db'], [106, 'Sg'], [107, 'Bh'], [108, 'Hs'], [109, 'Mt'], [110, 'Ds'], [111, 'Rg'], [112, 'Cn'], [113, 'Uut'], [114, 'Fl'], [115, 'Uup'], [116, 'Lv'], [117, 'Uus'], [118, 'Uuo']]
    .map(e => [e[0], ElementSymbol(e[1])]));
function getElementFromAtomicNumber(n) {
    if (_elementByAtomicNumber.has(n))
        return _elementByAtomicNumber.get(n);
    return ElementSymbol('H');
}
/** Entity types as defined in the mmCIF dictionary */
var EntityType;
(function (EntityType) {
    EntityType[EntityType["unknown"] = 0] = "unknown";
    EntityType[EntityType["polymer"] = 1] = "polymer";
    EntityType[EntityType["non-polymer"] = 2] = "non-polymer";
    EntityType[EntityType["macrolide"] = 3] = "macrolide";
    EntityType[EntityType["water"] = 4] = "water";
    EntityType[EntityType["branched"] = 5] = "branched";
})(EntityType || (exports.EntityType = EntityType = {}));
exports.PolymerTypeAtomRoleId = {
    [0 /* PolymerType.NA */]: {
        trace: new Set(),
        directionFrom: new Set(),
        directionTo: new Set(),
        backboneStart: new Set(),
        backboneEnd: new Set(),
        coarseBackbone: new Set()
    },
    [1 /* PolymerType.Protein */]: {
        trace: new Set(['CA']),
        directionFrom: new Set(['C']),
        directionTo: new Set(['O', 'OC1', 'O1', 'OX1', 'OXT', 'OT1']),
        backboneStart: new Set(['N']),
        backboneEnd: new Set(['C']),
        // CA1 is used e.g. in GFP chromophores
        // BB, BAS are often used for coarse grained models
        coarseBackbone: new Set(['CA', 'CA1', 'BB', 'BAS'])
    },
    [2 /* PolymerType.GammaProtein */]: {
        trace: new Set(['CA']),
        directionFrom: new Set(['C']),
        directionTo: new Set(['O']),
        backboneStart: new Set(['N']),
        backboneEnd: new Set(['CD']),
        coarseBackbone: new Set(['CA'])
    },
    [3 /* PolymerType.BetaProtein */]: {
        trace: new Set(['CA']),
        directionFrom: new Set(['C']),
        directionTo: new Set(['O']),
        backboneStart: new Set(['N']),
        backboneEnd: new Set(['CG']),
        coarseBackbone: new Set(['CA'])
    },
    [4 /* PolymerType.RNA */]: {
        trace: new Set(['O3\'', 'O3*']),
        directionFrom: new Set(['C4\'', 'C4*']),
        directionTo: new Set(['C3\'', 'C3*']),
        backboneStart: new Set(['P']),
        backboneEnd: new Set(['O3\'', 'O3*']),
        coarseBackbone: new Set(['P'])
    },
    [5 /* PolymerType.DNA */]: {
        trace: new Set(['O3\'', 'O3*']),
        directionFrom: new Set(['C3\'', 'C3*']),
        directionTo: new Set(['C1\'', 'C1*']),
        backboneStart: new Set(['P']),
        backboneEnd: new Set(['O3\'', 'O3*']),
        coarseBackbone: new Set(['P'])
    },
    [6 /* PolymerType.PNA */]: {
        trace: new Set(['N4\'', 'N4*']),
        directionFrom: new Set(['N4\'', 'N4*']),
        directionTo: new Set(['C7\'', 'C7*']),
        backboneStart: new Set(['N1\'', 'N1*']),
        backboneEnd: new Set(['C\'', 'C*']),
        coarseBackbone: new Set(['P'])
    }
};
exports.ProteinBackboneAtoms = new Set([
    'CA', 'C', 'N', 'O',
    'O1', 'O2', 'OC1', 'OC2', 'OT1', 'OT2', 'OX1', 'OXT',
    'H', 'H1', 'H2', 'H3', 'HA', 'HN', 'HXT',
    'BB'
]);
exports.NucleicBackboneAtoms = new Set([
    'P', 'OP1', 'OP2', 'HOP2', 'HOP3',
    'O2\'', 'O3\'', 'O4\'', 'O5\'', 'C1\'', 'C2\'', 'C3\'', 'C4\'', 'C5\'',
    'H1\'', 'H2\'', 'H2\'\'', 'HO2\'', 'H3\'', 'H4\'', 'H5\'', 'H5\'\'', 'HO3\'', 'HO5\'',
    'O2*', 'O3*', 'O4*', 'O5*', 'C1*', 'C2*', 'C3*', 'C4*', 'C5*'
]);
/** Chemical component type names for D-linked protein */
exports.DProteinComponentTypeNames = new Set([
    'd-peptide linking', 'd-peptide nh3 amino terminus',
    'd-peptide cooh carboxy terminus', 'd-gamma-peptide, c-delta linking',
    'd-beta-peptide, c-gamma linking'
]);
/** Chemical component type names for L-linked protein */
exports.LProteinComponentTypeNames = new Set([
    'l-peptide linking', 'l-peptide nh3 amino terminus',
    'l-peptide cooh carboxy terminus', 'l-gamma-peptide, c-delta linking',
    'l-beta-peptide, c-gamma linking'
]);
/** Chemical component type names for gamma protein, overlaps with D/L-linked */
exports.GammaProteinComponentTypeNames = new Set([
    'd-gamma-peptide, c-delta linking', 'l-gamma-peptide, c-delta linking'
]);
/** Chemical component type names for beta protein, overlaps with D/L-linked */
exports.BetaProteinComponentTypeNames = new Set([
    'd-beta-peptide, c-gamma linking', 'l-beta-peptide, c-gamma linking'
]);
/** Chemical component type names for protein termini, overlaps with D/L-linked */
exports.ProteinTerminusComponentTypeNames = new Set([
    'd-peptide nh3 amino terminus', 'd-peptide cooh carboxy terminus',
    'l-peptide nh3 amino terminus', 'l-peptide cooh carboxy terminus'
]);
/** Chemical component type names for peptide-like protein */
exports.OtherProteinComponentTypeNames = new Set([
    'peptide linking', 'peptide-like',
]);
/** Chemical component type names for protein */
exports.ProteinComponentTypeNames = set_1.SetUtils.unionMany(exports.DProteinComponentTypeNames, exports.LProteinComponentTypeNames, exports.OtherProteinComponentTypeNames);
/** Chemical component type names for DNA */
exports.DNAComponentTypeNames = new Set([
    'dna linking', 'l-dna linking', 'dna oh 5 prime terminus', 'dna oh 3 prime terminus',
]);
/** Chemical component type names for RNA */
exports.RNAComponentTypeNames = new Set([
    'rna linking', 'l-rna linking', 'rna oh 5 prime terminus', 'rna oh 3 prime terminus',
]);
/** Chemical component type names for saccharide */
exports.SaccharideComponentTypeNames = set_1.SetUtils.unionMany(new Set([
    'd-saccharide, beta linking', 'l-saccharide, beta linking',
    'd-saccharide, alpha linking', 'l-saccharide, alpha linking',
    'l-saccharide', 'd-saccharide', 'saccharide',
]), 
// deprecated in the mmCIF dictionary, kept for backward compatibility
new Set([
    'd-saccharide 1,4 and 1,4 linking', 'l-saccharide 1,4 and 1,4 linking',
    'd-saccharide 1,4 and 1,6 linking', 'l-saccharide 1,4 and 1,6 linking'
]));
/** Chemical component type names for other */
exports.OtherComponentTypeNames = new Set([
    'non-polymer', 'other'
]);
/** Chemical component type names for ion (extension to mmcif) */
exports.IonComponentTypeNames = new Set([
    'ion'
]);
/** Chemical component type names for lipid (extension to mmcif) */
exports.LipidComponentTypeNames = new Set([
    'lipid'
]);
/** Common names for water molecules */
exports.WaterNames = new Set([
    'SOL', 'WAT', 'HOH', 'H2O', 'W', 'DOD', 'D3O', 'TIP', 'TIP3', 'TIP4', 'SPC'
]);
exports.AminoAcidNamesL = new Set([
    'HIS', 'ARG', 'LYS', 'ILE', 'PHE', 'LEU', 'TRP', 'ALA', 'MET', 'PRO', 'CYS',
    'ASN', 'VAL', 'GLY', 'SER', 'GLN', 'TYR', 'ASP', 'GLU', 'THR', 'SEC', 'PYL',
    'UNK', // unknown amino acid from CCD
    'MSE', 'SEP', 'TPO', 'PTR', 'PCA', 'HYP', // common from CCD
    // charmm ff
    'HSD', 'HSE', 'HSP', 'LSN', 'ASPP', 'GLUP',
    // amber ff
    'HID', 'HIE', 'HIP', 'LYN', 'ASH', 'GLH',
]);
exports.AminoAcidNamesD = new Set([
    'DAL', // D-ALANINE
    'DAR', // D-ARGININE
    'DSG', // D-ASPARAGINE
    'DAS', // D-ASPARTIC ACID
    'DCY', // D-CYSTEINE
    'DGL', // D-GLUTAMIC ACID
    'DGN', // D-GLUTAMINE
    'DHI', // D-HISTIDINE
    'DIL', // D-ISOLEUCINE
    'DLE', // D-LEUCINE
    'DLY', // D-LYSINE
    'MED', // D-METHIONINE
    'DPN', // D-PHENYLALANINE
    'DPR', // D-PROLINE
    'DSN', // D-SERINE
    'DTH', // D-THREONINE
    'DTR', // D-TRYPTOPHAN
    'DTY', // D-TYROSINE
    'DVA', // D-VALINE
    'DNE' // D-NORLEUCINE
    // ???  // D-SELENOCYSTEINE
]);
exports.AminoAcidNames = set_1.SetUtils.unionMany(exports.AminoAcidNamesL, exports.AminoAcidNamesD);
exports.CommonProteinCaps = new Set([
    'NME', 'ACE', 'NH2', 'FOR', 'FMT'
    // not including the following
    // 'E1H' GFP backbone fragmentation in 2G16
    // 'HOA' complexes zinc
    // 'NEH' ubiquitine linker
    // 'MOH' part of peptidomimetics
]);
exports.RnaBaseNames = new Set([
    'A', 'C', 'T', 'G', 'I', 'U',
    'N' // unknown RNA base from CCD
]);
exports.DnaBaseNames = new Set([
    'DA', 'DC', 'DT', 'DG', 'DI', 'DU',
    'DN' // unknown DNA base from CCD
]);
exports.PeptideBaseNames = new Set(['APN', 'CPN', 'TPN', 'GPN']);
exports.PurineBaseNames = new Set(['A', 'G', 'I', 'DA', 'DG', 'DI', 'APN', 'GPN']);
exports.PyrimidineBaseNames = new Set(['C', 'T', 'U', 'DC', 'DT', 'DU', 'CPN', 'TPN']);
exports.BaseNames = set_1.SetUtils.unionMany(exports.RnaBaseNames, exports.DnaBaseNames, exports.PeptideBaseNames);
const isPurineBase = (compId) => exports.PurineBaseNames.has(compId.toUpperCase());
exports.isPurineBase = isPurineBase;
const isPyrimidineBase = (compId) => exports.PyrimidineBaseNames.has(compId.toUpperCase());
exports.isPyrimidineBase = isPyrimidineBase;
exports.PolymerNames = set_1.SetUtils.unionMany(exports.AminoAcidNames, exports.BaseNames);
/** get the molecule type from component type and id */
function getMoleculeType(compType, compId) {
    compId = compId.toUpperCase();
    if (exports.PeptideBaseNames.has(compId)) {
        return 8 /* MoleculeType.PNA */;
    }
    else if (exports.ProteinComponentTypeNames.has(compType)) {
        return 5 /* MoleculeType.Protein */;
    }
    else if (exports.RNAComponentTypeNames.has(compType)) {
        return 6 /* MoleculeType.RNA */;
    }
    else if (exports.DNAComponentTypeNames.has(compType)) {
        return 7 /* MoleculeType.DNA */;
    }
    else if (exports.SaccharideComponentTypeNames.has(compType)) {
        return 9 /* MoleculeType.Saccharide */;
    }
    else if (exports.WaterNames.has(compId)) {
        return 2 /* MoleculeType.Water */;
    }
    else if (ions_1.IonNames.has(compId)) {
        return 3 /* MoleculeType.Ion */;
    }
    else if (lipids_1.LipidNames.has(compId)) {
        return 4 /* MoleculeType.Lipid */;
    }
    else if (exports.OtherComponentTypeNames.has(compType)) {
        if (constants_1.SaccharideCompIdMap.has(compId)) {
            // trust our saccharide table more than given 'NON-POLYMER' or 'OTHER' component type
            return 9 /* MoleculeType.Saccharide */;
        }
        else if (exports.AminoAcidNames.has(compId)) {
            return 5 /* MoleculeType.Protein */;
        }
        else if (exports.RnaBaseNames.has(compId)) {
            return 6 /* MoleculeType.RNA */;
        }
        else if (exports.DnaBaseNames.has(compId)) {
            return 7 /* MoleculeType.DNA */;
        }
        else {
            return 1 /* MoleculeType.Other */;
        }
    }
    else {
        return 0 /* MoleculeType.Unknown */;
    }
}
function getPolymerType(compType, molType) {
    if (molType === 5 /* MoleculeType.Protein */) {
        if (exports.GammaProteinComponentTypeNames.has(compType)) {
            return 2 /* PolymerType.GammaProtein */;
        }
        else if (exports.BetaProteinComponentTypeNames.has(compType)) {
            return 3 /* PolymerType.BetaProtein */;
        }
        else if (exports.ProteinTerminusComponentTypeNames.has(compType)) {
            return 0 /* PolymerType.NA */;
        }
        else {
            return 1 /* PolymerType.Protein */;
        }
    }
    else if (molType === 6 /* MoleculeType.RNA */) {
        return 4 /* PolymerType.RNA */;
    }
    else if (molType === 7 /* MoleculeType.DNA */) {
        return 5 /* PolymerType.DNA */;
    }
    else if (molType === 8 /* MoleculeType.PNA */) {
        return 6 /* PolymerType.PNA */;
    }
    else {
        return 0 /* PolymerType.NA */;
    }
}
function getComponentType(compId) {
    compId = compId.toUpperCase();
    if (exports.AminoAcidNames.has(compId)) {
        return 'peptide linking';
    }
    else if (exports.RnaBaseNames.has(compId)) {
        return 'rna linking';
    }
    else if (exports.DnaBaseNames.has(compId)) {
        return 'dna linking';
    }
    else if (constants_1.SaccharideCompIdMap.has(compId)) {
        return 'saccharide';
    }
    else {
        return 'other';
    }
}
function getDefaultChemicalComponent(compId) {
    // TODO: this is to make the chem_comp_type property work if chem_comp category is not present.
    // should we try to set the formula etc better?
    return {
        formula: '',
        formula_weight: 0,
        id: compId,
        name: compId,
        mon_nstd_flag: exports.PolymerNames.has(compId) ? 'y' : 'n',
        pdbx_synonyms: [],
        type: getComponentType(compId)
    };
}
function getEntityType(compId) {
    compId = compId.toUpperCase();
    if (exports.WaterNames.has(compId)) {
        return 'water';
    }
    else if (exports.PolymerNames.has(compId)) {
        return 'polymer';
    }
    else if (constants_1.SaccharideCompIdMap.has(compId)) {
        return 'branched';
    }
    else {
        return 'non-polymer';
    }
}
function getEntitySubtype(compId, compType) {
    compId = compId.toUpperCase();
    if (exports.LProteinComponentTypeNames.has(compType)) {
        return 'polypeptide(L)';
    }
    else if (exports.DProteinComponentTypeNames.has(compType)) {
        return 'polypeptide(D)';
    }
    else if (exports.RNAComponentTypeNames.has(compType)) {
        return 'polyribonucleotide';
    }
    else if (exports.DNAComponentTypeNames.has(compType)) {
        return 'polydeoxyribonucleotide';
    }
    else if (exports.SaccharideComponentTypeNames.has(compType)) {
        return 'oligosaccharide';
    }
    else if (constants_1.SaccharideCompIdMap.has(compId)) {
        return 'oligosaccharide';
    }
    else if (exports.PeptideBaseNames.has(compId)) {
        return 'peptide nucleic acid';
    }
    else if (exports.AminoAcidNamesL.has(compId)) {
        return 'polypeptide(L)';
    }
    else if (exports.AminoAcidNamesD.has(compId)) {
        return 'polypeptide(D)';
    }
    else if (exports.RnaBaseNames.has(compId)) {
        return 'polyribonucleotide';
    }
    else if (exports.DnaBaseNames.has(compId)) {
        return 'polydeoxyribonucleotide';
    }
    else if (exports.IonComponentTypeNames.has(compType) || ions_1.IonNames.has(compId)) {
        return 'ion';
    }
    else if (exports.LipidComponentTypeNames.has(compType) || lipids_1.LipidNames.has(compId)) {
        return 'lipid';
    }
    else if (exports.OtherProteinComponentTypeNames.has(compType)) {
        return 'peptide-like';
    }
    else {
        return 'other';
    }
}
function isPolymer(moleculeType) {
    return isNucleic(moleculeType) || isProtein(moleculeType);
}
function isNucleic(moleculeType) {
    return moleculeType === 7 /* MoleculeType.DNA */ || moleculeType === 6 /* MoleculeType.RNA */ || moleculeType === 8 /* MoleculeType.PNA */;
}
function isProtein(moleculeType) {
    return moleculeType === 5 /* MoleculeType.Protein */;
}
var SecondaryStructureType;
(function (SecondaryStructureType) {
    SecondaryStructureType.is = bit_flags_1.BitFlags.has;
    SecondaryStructureType.create = bit_flags_1.BitFlags.create;
    SecondaryStructureType.SecondaryStructureMmcif = {
        helx_lh_27_p: 2 /* Flag.Helix */ | 32 /* Flag.LeftHanded */ | 1024 /* Flag.Helix27 */, // left-handed 2-7 helix (protein)
        helx_lh_3t_p: 2 /* Flag.Helix */ | 32 /* Flag.LeftHanded */ | 2048 /* Flag.Helix3Ten */, // left-handed 3-10 helix (protein)
        helx_lh_al_p: 2 /* Flag.Helix */ | 32 /* Flag.LeftHanded */ | 4096 /* Flag.HelixAlpha */, // left-handed alpha helix (protein)
        helx_lh_a_n: 1 /* Flag.DoubleHelix */ | 32 /* Flag.LeftHanded */ | 524288 /* Flag.DoubleHelixA */, // left-handed A helix (nucleic acid)
        helx_lh_b_n: 1 /* Flag.DoubleHelix */ | 32 /* Flag.LeftHanded */ | 1048576 /* Flag.DoubleHelixB */, // left-handed B helix (nucleic acid)
        helx_lh_ga_p: 2 /* Flag.Helix */ | 32 /* Flag.LeftHanded */ | 8192 /* Flag.HelixGamma */, // left-handed gamma helix (protein)
        helx_lh_n: 1 /* Flag.DoubleHelix */ | 32 /* Flag.LeftHanded */, // left-handed helix with type not specified (nucleic acid)
        helx_lh_om_p: 2 /* Flag.Helix */ | 32 /* Flag.LeftHanded */ | 16384 /* Flag.HelixOmega */, // left-handed omega helix (protein)
        helx_lh_ot_n: 1 /* Flag.DoubleHelix */ | 32 /* Flag.LeftHanded */ | 131072 /* Flag.DoubleHelixOther */, // left-handed helix with type that does not conform to an accepted category (nucleic acid)
        helx_lh_ot_p: 2 /* Flag.Helix */ | 32 /* Flag.LeftHanded */ | 512 /* Flag.HelixOther */, // left-handed helix with type that does not conform to an accepted category (protein)
        helx_lh_p: 2 /* Flag.Helix */ | 32 /* Flag.LeftHanded */, // left-handed helix with type not specified (protein)
        helx_lh_pi_p: 2 /* Flag.Helix */ | 32 /* Flag.LeftHanded */ | 32768 /* Flag.HelixPi */, // left-handed pi helix (protein)
        helx_lh_pp_p: 2 /* Flag.Helix */ | 32 /* Flag.LeftHanded */ | 65536 /* Flag.HelixPolyproline */, // left-handed polyproline helix (protein)
        helx_lh_z_n: 1 /* Flag.DoubleHelix */ | 32 /* Flag.LeftHanded */ | 262144 /* Flag.DoubleHelixZ */, // left-handed Z helix (nucleic acid)
        helx_n: 1 /* Flag.DoubleHelix */, // helix with handedness and type not specified (nucleic acid)
        helx_ot_n: 1 /* Flag.DoubleHelix */, // helix with handedness and type that do not conform to an accepted category (nucleic acid)
        helx_ot_p: 2 /* Flag.Helix */, // helix with handedness and type that do not conform to an accepted category (protein)
        helx_p: 2 /* Flag.Helix */, // helix with handedness and type not specified (protein)
        helx_rh_27_p: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 1024 /* Flag.Helix27 */, // right-handed 2-7 helix (protein)
        helx_rh_3t_p: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 2048 /* Flag.Helix3Ten */, // right-handed 3-10 helix (protein)
        helx_rh_al_p: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 4096 /* Flag.HelixAlpha */, // right-handed alpha helix (protein)
        helx_rh_a_n: 1 /* Flag.DoubleHelix */ | 64 /* Flag.RightHanded */ | 524288 /* Flag.DoubleHelixA */, // right-handed A helix (nucleic acid)
        helx_rh_b_n: 1 /* Flag.DoubleHelix */ | 64 /* Flag.RightHanded */ | 1048576 /* Flag.DoubleHelixB */, // right-handed B helix (nucleic acid)
        helx_rh_ga_p: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 8192 /* Flag.HelixGamma */, // right-handed gamma helix (protein)
        helx_rh_n: 1 /* Flag.DoubleHelix */ | 64 /* Flag.RightHanded */, // right-handed helix with type not specified (nucleic acid)
        helx_rh_om_p: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 16384 /* Flag.HelixOmega */, // right-handed omega helix (protein)
        helx_rh_ot_n: 1 /* Flag.DoubleHelix */ | 64 /* Flag.RightHanded */ | 131072 /* Flag.DoubleHelixOther */, // right-handed helix with type that does not conform to an accepted category (rhcleic acid)
        helx_rh_ot_p: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 512 /* Flag.HelixOther */, // right-handed helix with type that does not conform to an accepted category (protein)
        helx_rh_p: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */, // right-handed helix with type not specified (protein)
        helx_rh_pi_p: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 32768 /* Flag.HelixPi */, // right-handed pi helix (protein)
        helx_rh_pp_p: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 65536 /* Flag.HelixPolyproline */, // right-handed polyproline helix (protein)
        helx_rh_z_n: 1 /* Flag.DoubleHelix */ | 64 /* Flag.RightHanded */ | 262144 /* Flag.DoubleHelixZ */, // right-handed Z helix (nucleic acid)
        strn: 4 /* Flag.Beta */ | 4194304 /* Flag.BetaStrand */, // beta strand (protein)
        turn_ot_p: 16 /* Flag.Turn */ | 33554432 /* Flag.TurnOther */, // turn with type that does not conform to an accepted category (protein)
        turn_p: 16 /* Flag.Turn */, // turn with type not specified (protein)
        turn_ty1p_p: 16 /* Flag.Turn */ | 256 /* Flag.InverseTurn */ | 67108864 /* Flag.Turn1 */, // type I prime turn (protein)
        turn_ty1_p: 16 /* Flag.Turn */ | 128 /* Flag.ClassicTurn */ | 67108864 /* Flag.Turn1 */, // type I turn (protein)
        turn_ty2p_p: 16 /* Flag.Turn */ | 256 /* Flag.InverseTurn */ | 134217728 /* Flag.Turn2 */, // type II prime turn (protein)
        turn_ty2_p: 16 /* Flag.Turn */ | 128 /* Flag.ClassicTurn */ | 134217728 /* Flag.Turn2 */, // type II turn (protein)
        turn_ty3p_p: 16 /* Flag.Turn */ | 256 /* Flag.InverseTurn */ | 268435456 /* Flag.Turn3 */, // type III prime turn (protein)
        turn_ty3_p: 16 /* Flag.Turn */ | 128 /* Flag.ClassicTurn */ | 268435456 /* Flag.Turn3 */, // type III turn (protein)
        bend: 8 /* Flag.Bend */, // region with high backbone curvature without specific hydrogen bonding, a bend at residue i occurs when the angle between C$\_alpha(i)-C_\alpha(i-2) and C_\alpha(i+2) - C_\alpha(i)$ is greater than 70 degrees (protein)
        other: 0 /* Flag.None */, // secondary structure type that does not conform to an accepted category, random coil (protein)
    };
    SecondaryStructureType.SecondaryStructurePdb = {
        1: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 4096 /* Flag.HelixAlpha */, // Right-handed alpha (default)
        2: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 16384 /* Flag.HelixOmega */, // Right-handed omega
        3: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 32768 /* Flag.HelixPi */, // Right-handed pi
        4: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 8192 /* Flag.HelixGamma */, // Right-handed gamma
        5: 2 /* Flag.Helix */ | 64 /* Flag.RightHanded */ | 2048 /* Flag.Helix3Ten */, // Right-handed 310
        6: 2 /* Flag.Helix */ | 32 /* Flag.LeftHanded */ | 4096 /* Flag.HelixAlpha */, // Left-handed alpha
        7: 2 /* Flag.Helix */ | 32 /* Flag.LeftHanded */ | 16384 /* Flag.HelixOmega */, // Left-handed omega
        8: 2 /* Flag.Helix */ | 32 /* Flag.LeftHanded */ | 8192 /* Flag.HelixGamma */, // Left-handed gamma
        9: 2 /* Flag.Helix */ | 1024 /* Flag.Helix27 */, // 27 ribbon/helix
        10: 2 /* Flag.Helix */ | 65536 /* Flag.HelixPolyproline */, // Polyproline
    };
    SecondaryStructureType.SecondaryStructureStride = {
        H: 2 /* Flag.Helix */ | 4096 /* Flag.HelixAlpha */, // Alpha helix
        G: 2 /* Flag.Helix */ | 2048 /* Flag.Helix3Ten */, // 3-10 helix
        I: 2 /* Flag.Helix */ | 32768 /* Flag.HelixPi */, // PI-helix
        E: 4 /* Flag.Beta */ | 8388608 /* Flag.BetaSheet */, // Extended conformation
        B: 4 /* Flag.Beta */ | 4194304 /* Flag.BetaStrand */, // Isolated bridge
        T: 16 /* Flag.Turn */, // Turn
        C: 536870912 /* Flag.NA */, // Coil (none of the above)
    };
    SecondaryStructureType.SecondaryStructureDssp = {
        H: 2 /* Flag.Helix */ | 4096 /* Flag.HelixAlpha */, // alpha-helix
        B: 4 /* Flag.Beta */ | 4194304 /* Flag.BetaStrand */, // residue in isolated beta-bridge
        E: 4 /* Flag.Beta */ | 8388608 /* Flag.BetaSheet */, // extended strand, participates in beta ladder
        G: 2 /* Flag.Helix */ | 2048 /* Flag.Helix3Ten */, // 3-helix (310 helix)
        I: 2 /* Flag.Helix */ | 32768 /* Flag.HelixPi */, // 5 helix (pi-helix)
        T: 16 /* Flag.Turn */, // hydrogen bonded turn
        S: 8 /* Flag.Bend */, // bend
    };
})(SecondaryStructureType || (exports.SecondaryStructureType = SecondaryStructureType = {}));
/** Maximum accessible surface area observed for amino acids. Taken from: http://dx.doi.org/10.1371/journal.pone.0080635 */
exports.MaxAsa = {
    'ALA': 121.0,
    'ARG': 265.0,
    'ASN': 187.0,
    'ASP': 187.0,
    'CYS': 148.0,
    'GLU': 214.0,
    'GLN': 214.0,
    'GLY': 97.0,
    'HIS': 216.0,
    'ILE': 195.0,
    'LEU': 191.0,
    'LYS': 230.0,
    'MET': 203.0,
    'PHE': 228.0,
    'PRO': 154.0,
    'SER': 143.0,
    'THR': 163.0,
    'TRP': 264.0,
    'TYR': 255.0,
    'VAL': 165.0,
    // charmm ff
    'HSD': 216.0, 'HSE': 216.0, 'HSP': 216.0,
    // amber ff
    'HID': 216.0, 'HIE': 216.0, 'HIP': 216.0, 'ASH': 187.0, 'GLH': 214.0,
};
exports.DefaultMaxAsa = 121.0;
var BondType;
(function (BondType) {
    BondType.is = bit_flags_1.BitFlags.has;
    function create(flags) {
        return bit_flags_1.BitFlags.create(flags);
    }
    BondType.create = create;
    function isCovalent(flags) {
        return (flags & 1 /* BondType.Flag.Covalent */) !== 0;
    }
    BondType.isCovalent = isCovalent;
    function isAll(flags) {
        return flags === Math.pow(2, 6) - 1;
    }
    BondType.isAll = isAll;
    BondType.Names = {
        'covalent': 1 /* Flag.Covalent */,
        'metal-coordination': 2 /* Flag.MetallicCoordination */,
        'hydrogen-bond': 4 /* Flag.HydrogenBond */,
        'disulfide': 8 /* Flag.Disulfide */,
        'aromatic': 16 /* Flag.Aromatic */,
        'computed': 32 /* Flag.Computed */,
    };
    function isName(name) {
        return name in BondType.Names;
    }
    BondType.isName = isName;
    function fromName(name) {
        switch (name) {
            case 'covalent': return 1 /* Flag.Covalent */;
            case 'metal-coordination': return 2 /* Flag.MetallicCoordination */;
            case 'hydrogen-bond': return 4 /* Flag.HydrogenBond */;
            case 'disulfide': return 8 /* Flag.Disulfide */;
            case 'aromatic': return 16 /* Flag.Aromatic */;
            case 'computed': return 32 /* Flag.Computed */;
        }
    }
    BondType.fromName = fromName;
    function fromNames(names) {
        let f = 0 /* Flag.None */;
        for (let i = 0, il = names.length; i < il; ++i) {
            f |= fromName(names[i]);
        }
        return f;
    }
    BondType.fromNames = fromNames;
})(BondType || (exports.BondType = BondType = {}));
/**
 * "Experimentally determined hydrophobicity scale for proteins at membrane interfaces"
 * by Wimely and White (doi:10.1038/nsb1096-842)
 * http://blanco.biomol.uci.edu/Whole_residue_HFscales.txt
 * https://www.nature.com/articles/nsb1096-842
 */
exports.ResidueHydrophobicity = {
    // AA  DGwif   DGwoct  Oct-IF
    'ALA': [0.17, 0.50, 0.33],
    'ARG': [0.81, 1.81, 1.00],
    'ASN': [0.42, 0.85, 0.43],
    'ASP': [1.23, 3.64, 2.41],
    'ASH': [-0.07, 0.43, 0.50],
    'CYS': [-0.24, -0.02, 0.22],
    'GLN': [0.58, 0.77, 0.19],
    'GLU': [2.02, 3.63, 1.61],
    'GLH': [-0.01, 0.11, 0.12],
    'GLY': [0.01, 1.15, 1.14],
    // "His+": [  0.96,  2.33,  1.37 ],
    'HIS': [0.17, 0.11, -0.06],
    'ILE': [-0.31, -1.12, -0.81],
    'LEU': [-0.56, -1.25, -0.69],
    'LYS': [0.99, 2.80, 1.81],
    'MET': [-0.23, -0.67, -0.44],
    'PHE': [-1.13, -1.71, -0.58],
    'PRO': [0.45, 0.14, -0.31],
    'SER': [0.13, 0.46, 0.33],
    'THR': [0.14, 0.25, 0.11],
    'TRP': [-1.85, -2.09, -0.24],
    'TYR': [-0.94, -0.71, 0.23],
    'VAL': [0.07, -0.46, -0.53],
    // charmm ff
    'HSD': [0.17, 0.11, -0.06], 'HSE': [0.17, 0.11, -0.06], 'HSP': [0.96, 2.33, 1.37],
    // amber ff
    'HID': [0.17, 0.11, -0.06], 'HIE': [0.17, 0.11, -0.06], 'HIP': [0.96, 2.33, 1.37],
};
exports.DefaultResidueHydrophobicity = [0.00, 0.00, 0.00];
