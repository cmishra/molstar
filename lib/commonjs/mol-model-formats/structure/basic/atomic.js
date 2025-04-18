"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAtomicHierarchyAndConformation = getAtomicHierarchyAndConformation;
const db_1 = require("../../../mol-data/db");
const int_1 = require("../../../mol-data/int");
const schema_1 = require("../../../mol-io/reader/cif/schema");
const geometry_1 = require("../../../mol-math/geometry");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const atom_site_operator_mapping_1 = require("../../../mol-model/structure/export/categories/atom_site_operator_mapping");
const atomic_1 = require("../../../mol-model/structure/model/properties/atomic");
const atomic_derived_1 = require("../../../mol-model/structure/model/properties/utils/atomic-derived");
const atomic_index_1 = require("../../../mol-model/structure/model/properties/utils/atomic-index");
const types_1 = require("../../../mol-model/structure/model/types");
const uuid_1 = require("../../../mol-util/uuid");
const mmcif_1 = require("../mmcif");
function findHierarchyOffsets(atom_site) {
    if (atom_site._rowCount === 0)
        return { residues: [], chains: [] };
    const start = 0, end = atom_site._rowCount;
    const residues = [start], chains = [start];
    const { label_entity_id, label_asym_id, label_seq_id, auth_seq_id, pdbx_PDB_ins_code } = atom_site;
    for (let i = start + 1; i < end; i++) {
        const newChain = !label_entity_id.areValuesEqual(i - 1, i) || !label_asym_id.areValuesEqual(i - 1, i);
        const newResidue = newChain
            || !label_seq_id.areValuesEqual(i - 1, i)
            || !auth_seq_id.areValuesEqual(i - 1, i)
            || !pdbx_PDB_ins_code.areValuesEqual(i - 1, i);
        // not checking label_comp_id to allow for MICROHETEROGENEITY
        if (newResidue)
            residues[residues.length] = i;
        if (newChain)
            chains[chains.length] = i;
    }
    return { residues, chains };
}
function createHierarchyData(atom_site, sourceIndex, offsets) {
    const atoms = db_1.Table.ofColumns(atomic_1.AtomsSchema, {
        type_symbol: db_1.Column.ofArray({ array: db_1.Column.mapToArray(atom_site.type_symbol, types_1.ElementSymbol), schema: db_1.Column.Schema.Aliased(db_1.Column.Schema.str) }),
        label_atom_id: atom_site.label_atom_id,
        auth_atom_id: atom_site.auth_atom_id,
        label_alt_id: atom_site.label_alt_id,
        label_comp_id: atom_site.label_comp_id,
        auth_comp_id: atom_site.auth_comp_id,
        pdbx_formal_charge: atom_site.pdbx_formal_charge
    });
    const residues = db_1.Table.view(atom_site, atomic_1.ResiduesSchema, offsets.residues);
    const chains = db_1.Table.view(atom_site, atomic_1.ChainsSchema, offsets.chains);
    if (!residues.label_seq_id.isDefined) {
        const seqIds = new Int32Array(residues.label_seq_id.rowCount);
        const { residues: residueOffsets, chains: chainOffsets } = offsets;
        let cI = 0;
        let seqId = 0;
        for (let i = 0, il = seqIds.length; i < il; ++i) {
            if (residueOffsets[i] >= chainOffsets[cI + 1]) {
                cI += 1;
                seqId = 0;
            }
            seqIds[i] = ++seqId; // start id on one
        }
        residues.label_seq_id = db_1.Column.ofIntArray(seqIds);
    }
    // Optimize the numeric columns
    db_1.Table.columnToArray(residues, 'label_seq_id', Int32Array);
    db_1.Table.columnToArray(residues, 'auth_seq_id', Int32Array);
    return { atoms, residues, chains, atomSourceIndex: sourceIndex };
}
function getConformation(atom_site) {
    return {
        id: uuid_1.UUID.create22(),
        atomId: atom_site.id,
        occupancy: atom_site.occupancy.isDefined ? atom_site.occupancy : db_1.Column.ofConst(1, atom_site._rowCount, db_1.Column.Schema.float),
        B_iso_or_equiv: atom_site.B_iso_or_equiv,
        xyzDefined: atom_site.Cartn_x.isDefined && atom_site.Cartn_y.isDefined && atom_site.Cartn_z.isDefined,
        x: atom_site.Cartn_x.toArray({ array: Float32Array }),
        y: atom_site.Cartn_y.toArray({ array: Float32Array }),
        z: atom_site.Cartn_z.toArray({ array: Float32Array }),
    };
}
function isHierarchyDataEqual(a, b) {
    return db_1.Table.areEqual(a.chains, b.chains)
        && db_1.Table.areEqual(a.residues, b.residues)
        && db_1.Table.areEqual(a.atoms, b.atoms);
}
function createChainOperatorMappingAndSubstituteNames(hierarchy, format) {
    const mapping = new Map();
    if (!mmcif_1.MmcifFormat.is(format))
        return mapping;
    const { molstar_atom_site_operator_mapping: entries } = (0, schema_1.toDatabase)(atom_site_operator_mapping_1.AtomSiteOperatorMappingSchema, format.data.frame);
    if (entries._rowCount === 0)
        return mapping;
    const labelMap = new Map();
    const authMap = new Map();
    for (let i = 0; i < entries._rowCount; i++) {
        const assembly = entries.assembly_operator_id.valueKind(i) === 0 /* Column.ValueKinds.Present */
            ? { id: entries.assembly_id.value(i), operList: [], operId: entries.assembly_operator_id.value(i) }
            : void 0;
        const operator = geometry_1.SymmetryOperator.create(entries.operator_name.value(i), linear_algebra_1.Mat4.identity(), {
            assembly,
            spgrOp: entries.symmetry_operator_index.valueKind(i) === 0 /* Column.ValueKinds.Present */ ? entries.symmetry_operator_index.value(i) : void 0,
            hkl: linear_algebra_1.Vec3.ofArray(entries.symmetry_hkl.value(i)),
            ncsId: entries.ncs_id.value(i)
        });
        const suffix = entries.suffix.value(i);
        const label = entries.label_asym_id.value(i);
        labelMap.set(`${label}${suffix}`, { name: label, operator });
        const auth = entries.auth_asym_id.value(i);
        authMap.set(`${auth}${suffix}`, auth);
    }
    const { label_asym_id, auth_asym_id } = hierarchy.chains;
    const mappedLabel = new Array(label_asym_id.rowCount);
    const mappedAuth = new Array(label_asym_id.rowCount);
    for (let i = 0; i < label_asym_id.rowCount; i++) {
        const label = label_asym_id.value(i), auth = auth_asym_id.value(i);
        if (!labelMap.has(label)) {
            mappedLabel[i] = label;
            mappedAuth[i] = auth;
            continue;
        }
        const { name, operator } = labelMap.get(label);
        mapping.set(i, operator);
        mappedLabel[i] = name;
        mappedAuth[i] = authMap.get(auth) || auth;
    }
    hierarchy.chains.label_asym_id = db_1.Column.ofArray({ array: mappedLabel, valueKind: hierarchy.chains.label_asym_id.valueKind, schema: hierarchy.chains.label_asym_id.schema });
    hierarchy.chains.auth_asym_id = db_1.Column.ofArray({ array: mappedAuth, valueKind: hierarchy.chains.auth_asym_id.valueKind, schema: hierarchy.chains.auth_asym_id.schema });
    return mapping;
}
function getAtomicHierarchy(atom_site, sourceIndex, entities, chemicalComponentMap, format, previous) {
    const hierarchyOffsets = findHierarchyOffsets(atom_site);
    const hierarchyData = createHierarchyData(atom_site, sourceIndex, hierarchyOffsets);
    const chainOperatorMapping = createChainOperatorMappingAndSubstituteNames(hierarchyData, format);
    if (previous && isHierarchyDataEqual(previous.atomicHierarchy, hierarchyData)) {
        return {
            sameAsPrevious: true,
            hierarchy: previous.atomicHierarchy,
            chainOperatorMapping
        };
    }
    const hierarchySegments = {
        residueAtomSegments: int_1.Segmentation.ofOffsets(hierarchyOffsets.residues, int_1.Interval.ofBounds(0, atom_site._rowCount)),
        chainAtomSegments: int_1.Segmentation.ofOffsets(hierarchyOffsets.chains, int_1.Interval.ofBounds(0, atom_site._rowCount)),
    };
    const index = (0, atomic_index_1.getAtomicIndex)(hierarchyData, entities, hierarchySegments);
    const derived = (0, atomic_derived_1.getAtomicDerivedData)(hierarchyData, hierarchySegments, index, chemicalComponentMap);
    const hierarchy = { ...hierarchyData, ...hierarchySegments, index, derived };
    return { sameAsPrevious: false, hierarchy, chainOperatorMapping };
}
function getAtomicHierarchyAndConformation(atom_site, sourceIndex, entities, chemicalComponentMap, format, previous) {
    const { sameAsPrevious, hierarchy, chainOperatorMapping } = getAtomicHierarchy(atom_site, sourceIndex, entities, chemicalComponentMap, format, previous);
    const conformation = getConformation(atom_site);
    return { sameAsPrevious, hierarchy, conformation, chainOperatorMapping };
}
