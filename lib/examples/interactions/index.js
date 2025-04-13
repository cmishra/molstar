import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { ComputeContacts, CustomInteractions, InteractionsShape } from '../../extensions/interactions/transforms';
import { MolViewSpec } from '../../extensions/mvs/behavior';
import { Structure, StructureElement, StructureProperties, StructureQuery } from '../../mol-model/structure';
import { atoms } from '../../mol-model/structure/query/queries/generators';
import { MultiStructureSelectionFromBundle, StructureSelectionFromBundle } from '../../mol-plugin-state/transforms/model';
import { ShapeRepresentation3D, StructureRepresentation3D } from '../../mol-plugin-state/transforms/representation';
import { createPluginUI } from '../../mol-plugin-ui';
import { useBehavior } from '../../mol-plugin-ui/hooks/use-behavior';
import { renderReact18 } from '../../mol-plugin-ui/react18';
import { DefaultPluginUISpec } from '../../mol-plugin-ui/spec';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { PluginSpec } from '../../mol-plugin/spec';
import '../../mol-plugin-ui/skin/light.scss';
import './index.html';
import { Task } from '../../mol-task';
import { computeContacts } from '../../extensions/interactions/compute';
async function createViewer(root) {
    const spec = DefaultPluginUISpec();
    const plugin = await createPluginUI({
        target: root,
        render: renderReact18,
        spec: {
            ...spec,
            layout: {
                initial: {
                    isExpanded: true,
                    showControls: false
                }
            },
            components: {
                remoteState: 'none',
            },
            behaviors: [
                ...spec.behaviors,
                PluginSpec.Behavior(MolViewSpec)
            ],
            config: [
                [PluginConfig.Viewport.ShowAnimation, false],
            ]
        }
    });
    return plugin;
}
async function createBindingSiteRepresentation(plugin, interactions, receptors) {
    const contactBundles = getBindingSiteBundles(interactions.flatMap(e => e.elements), receptors);
    const update = plugin.build();
    for (const [ref, bundle] of contactBundles) {
        update.to(ref)
            .apply(StructureSelectionFromBundle, { bundle, label: 'Binding Site' })
            .apply(StructureRepresentation3D, {
            type: { name: 'ball-and-stick', params: { sizeFactor: 0.2 } },
            colorTheme: { name: 'element-symbol', params: { carbonColor: { name: 'element-symbol', params: {} } } },
        });
    }
    await update.commit();
}
function getBindingSiteBundles(interactions, receptors) {
    const residueIndices = new Map();
    const loc = StructureElement.Location.create();
    const add = (ref, loci) => {
        if (!receptors.has(ref))
            return;
        let set;
        if (residueIndices.has(ref)) {
            set = residueIndices.get(ref);
        }
        else {
            set = new Set();
            residueIndices.set(ref, set);
        }
        StructureElement.Loci.forEachLocation(loci, l => {
            set.add(StructureProperties.residue.key(l));
        }, loc);
    };
    for (const e of interactions) {
        add(e.aStructureRef, e.a);
        add(e.bStructureRef, e.b);
    }
    const bundles = [];
    for (const [ref, indices] of Array.from(residueIndices.entries())) {
        if (indices.size === 0)
            continue;
        const loci = StructureQuery.loci(atoms({
            residueTest: e => indices.has(StructureProperties.residue.key(e.element))
        }), receptors.get(ref));
        if (StructureElement.Loci.isEmpty(loci))
            continue;
        bundles.push([ref, StructureElement.Bundle.fromLoci(loci)]);
    }
    return bundles;
}
async function loadComputedExample(plugin, { receptorUrl, ligandUrl }, options) {
    var _a, _b;
    await plugin.clear();
    // Set up the receptor and ligand structures
    const receptorData = await plugin.builders.data.download({ url: receptorUrl[0] });
    const receptorTrajectory = await plugin.builders.structure.parseTrajectory(receptorData, receptorUrl[1]);
    const receptor = await plugin.builders.structure.hierarchy.applyPreset(receptorTrajectory, 'default', { representationPreset: 'polymer-cartoon' });
    const ligandData = await plugin.builders.data.download({ url: ligandUrl[0] });
    const ligandTrajectory = await plugin.builders.structure.parseTrajectory(ligandData, ligandUrl[1]);
    const ligand = await plugin.builders.structure.hierarchy.applyPreset(ligandTrajectory, 'default', { representationPreset: 'atomic-detail' });
    // Compute the interactions
    const update = plugin.build();
    const receptorRef = receptor === null || receptor === void 0 ? void 0 : receptor.structure.ref;
    const ligandRef = ligand === null || ligand === void 0 ? void 0 : ligand.structure.ref;
    const refs = [receptorRef, ligandRef];
    const interactionsRef = update.toRoot()
        .apply(MultiStructureSelectionFromBundle, {
        selections: [
            { key: 'a', ref: receptorRef, bundle: StructureElement.Schema.toBundle(receptor === null || receptor === void 0 ? void 0 : receptor.structure.data, { label_asym_id: options.receptor_label_asym_id }) },
            { key: 'b', ref: ligandRef, bundle: StructureElement.Schema.toBundle(ligand === null || ligand === void 0 ? void 0 : ligand.structure.data, {}) },
        ],
        isTransitive: true,
        label: 'Label'
    }, { dependsOn: refs })
        .apply(ComputeContacts);
    interactionsRef.apply(InteractionsShape).apply(ShapeRepresentation3D);
    await update.commit();
    if (!options.analyzeTrajectory) {
        console.log('Interactions', (_a = interactionsRef.selector.data) === null || _a === void 0 ? void 0 : _a.interactions);
        // Create ball and stick representations for the binding site and focus on the ligand
        await createBindingSiteRepresentation(plugin, [(_b = interactionsRef.selector.data) === null || _b === void 0 ? void 0 : _b.interactions], new Map([[receptorRef, receptor === null || receptor === void 0 ? void 0 : receptor.structure.data]]));
    }
    else {
        const trajectoryInteractions = [];
        const receptorLoci = StructureElement.Schema.toLoci(receptor === null || receptor === void 0 ? void 0 : receptor.structure.data, { label_asym_id: options.receptor_label_asym_id });
        for (let fI = 0; fI < ligandTrajectory.data.frameCount; fI++) {
            const model = await Task.resolveInContext(ligandTrajectory.data.getFrameAtIndex(fI));
            const structure = Structure.ofModel(model);
            const currentInteractions = await plugin.runTask(Task.create('Compute Contacts', ctx => {
                return computeContacts(ctx, [
                    { structureRef: receptorRef, loci: receptorLoci },
                    { structureRef: ligandRef, loci: Structure.toStructureElementLoci(structure) },
                ]);
            }));
            trajectoryInteractions.push(currentInteractions);
        }
        console.log('Interactions', trajectoryInteractions);
        await createBindingSiteRepresentation(plugin, trajectoryInteractions, new Map([[receptorRef, receptor === null || receptor === void 0 ? void 0 : receptor.structure.data]]));
    }
    PluginCommands.Camera.FocusObject(plugin, {
        targets: [{
                targetRef: ligand === null || ligand === void 0 ? void 0 : ligand.representation.representations.all.ref
            }]
    });
}
async function loadCustomExample(plugin) {
    var _a, _b;
    await plugin.clear();
    // Set up the receptor and ligand structures
    const receptorData = await plugin.builders.data.download({ url: '../../../examples/ace2.pdbqt' });
    const receptorTrajectory = await plugin.builders.structure.parseTrajectory(receptorData, 'pdbqt');
    const receptor = await plugin.builders.structure.hierarchy.applyPreset(receptorTrajectory, 'default');
    const ligandData = await plugin.builders.data.download({ url: '../../../examples/ace2-hit.mol2' });
    const ligandTrajectory = await plugin.builders.structure.parseTrajectory(ligandData, 'mol2');
    const ligand = await plugin.builders.structure.hierarchy.applyPreset(ligandTrajectory, 'default', { representationPreset: 'atomic-detail' });
    // Compute the interactions
    const update = plugin.build();
    const receptorRef = receptor === null || receptor === void 0 ? void 0 : receptor.representation.components.polymer.ref;
    const ligandRef = ligand === null || ligand === void 0 ? void 0 : ligand.representation.components.all.ref;
    const refs = [receptorRef, ligandRef];
    const interactionsRef = update.toRoot().apply(CustomInteractions, {
        interactions: [
            {
                kind: 'hydrogen-bond',
                aStructureRef: receptorRef,
                a: { auth_seq_id: 353, auth_atom_id: 'N' },
                bStructureRef: ligandRef,
                b: { atom_index: 9 },
            }
        ]
    }, { dependsOn: refs });
    interactionsRef.apply(InteractionsShape).apply(ShapeRepresentation3D);
    await update.commit();
    console.log('Interactions', (_a = interactionsRef.selector.data) === null || _a === void 0 ? void 0 : _a.interactions);
    // Create ball and stick representations for the binding site and focus on the ligand
    await createBindingSiteRepresentation(plugin, [(_b = interactionsRef.selector.data) === null || _b === void 0 ? void 0 : _b.interactions], new Map([[receptorRef, receptor === null || receptor === void 0 ? void 0 : receptor.representation.components.polymer.data]]));
    PluginCommands.Camera.FocusObject(plugin, {
        targets: [{
                targetRef: ligand === null || ligand === void 0 ? void 0 : ligand.representation.representations.all.ref
            }]
    });
}
async function loadTestAllExample(plugin) {
    var _a, _b;
    await plugin.clear();
    // Set up the receptor and ligand structures
    const receptorData = await plugin.builders.data.download({ url: '../../../examples/ace2.pdbqt' });
    const receptorTrajectory = await plugin.builders.structure.parseTrajectory(receptorData, 'pdbqt');
    const receptor = await plugin.builders.structure.hierarchy.applyPreset(receptorTrajectory, 'default');
    const ligandData = await plugin.builders.data.download({ url: '../../../examples/ace2-hit.mol2' });
    const ligandTrajectory = await plugin.builders.structure.parseTrajectory(ligandData, 'mol2');
    const ligand = await plugin.builders.structure.hierarchy.applyPreset(ligandTrajectory, 'default', { representationPreset: 'atomic-detail' });
    // Compute the interactions
    const update = plugin.build();
    const receptorRef = receptor === null || receptor === void 0 ? void 0 : receptor.representation.components.polymer.ref;
    const ligandRef = ligand === null || ligand === void 0 ? void 0 : ligand.representation.components.all.ref;
    const refs = [receptorRef, ligandRef];
    const basic = (kind, atom_index, description) => {
        return {
            kind,
            aStructureRef: receptorRef,
            a: { auth_seq_id: 354, auth_atom_id: 'N' },
            bStructureRef: ligandRef,
            b: Array.isArray(atom_index) ? { items: { atom_index } } : { atom_index },
            description,
        };
    };
    const covalent = (degree, atom_index) => {
        return {
            kind: 'covalent',
            degree: degree === -1 ? 'aromatic' : Math.abs(degree),
            aStructureRef: receptorRef,
            a: { auth_seq_id: 354, auth_atom_id: 'N' },
            bStructureRef: ligandRef,
            b: { atom_index }
        };
    };
    const interactionsRef = update.toRoot().apply(CustomInteractions, {
        interactions: [
            basic('unknown', 1),
            basic('ionic', 2),
            basic('pi-stacking', 3),
            basic('cation-pi', 4),
            basic('halogen-bond', 5),
            basic('hydrogen-bond', 6),
            basic('weak-hydrogen-bond', 7),
            basic('hydrophobic', 8),
            basic('metal-coordination', 9),
            basic('salt-bridge', 10),
            covalent(1, 11),
            covalent(2, 12),
            covalent(3, 13),
            covalent(-1, 14), // aromatic
            basic('unknown', [0, 1, 2, 3, 13, 14], 'Testing centroid for atom set'),
        ]
    }, { dependsOn: refs });
    interactionsRef.apply(InteractionsShape).apply(ShapeRepresentation3D);
    await update.commit();
    console.log('Interactions', (_a = interactionsRef.selector.data) === null || _a === void 0 ? void 0 : _a.interactions);
    // Create ball and stick representations for the binding site and focus on the ligand
    await createBindingSiteRepresentation(plugin, [(_b = interactionsRef.selector.data) === null || _b === void 0 ? void 0 : _b.interactions], new Map([[receptorRef, receptor === null || receptor === void 0 ? void 0 : receptor.representation.components.polymer.data]]));
    PluginCommands.Camera.FocusObject(plugin, {
        targets: [{
                targetRef: ligand === null || ligand === void 0 ? void 0 : ligand.representation.representations.all.ref
            }]
    });
}
const Examples = {
    'Computed (1iep)': (plugin) => loadComputedExample(plugin, {
        receptorUrl: ['https://files.rcsb.org/download/1IEP.cif', 'mmcif'],
        ligandUrl: ['https://models.rcsb.org/v1/1iep/atoms?label_asym_id=G&copy_all_categories=false', 'mmcif']
    }, { receptor_label_asym_id: 'A' }),
    'Computed (ACE2)': (plugin) => loadComputedExample(plugin, {
        receptorUrl: ['../../../examples/ace2.pdbqt', 'pdbqt'],
        ligandUrl: ['../../../examples/ace2-hit.mol2', 'mol2']
    }, { receptor_label_asym_id: 'B' }),
    'Computed (multiple)': (plugin) => loadComputedExample(plugin, {
        receptorUrl: ['../../../examples/docking/receptor_1.pdb', 'pdb'],
        ligandUrl: ['../../../examples/docking/ligands_1.sdf', 'sdf']
    }, { receptor_label_asym_id: undefined, analyzeTrajectory: true }),
    'Custom': loadCustomExample,
    'Synthetic': loadTestAllExample
};
function SelectExampleUI({ state, load }) {
    const current = useBehavior(state);
    return _jsxs("div", { children: ["Select Example:", ' ', _jsx("select", { value: current.name, onChange: e => load(e.target.value), disabled: current.isLoading, children: Object.keys(Examples).map(k => _jsx("option", { value: k, children: k }, k)) })] });
}
async function init(viewer, controls, defaultExample = 'Computed (1iep)') {
    const root = typeof viewer === 'string' ? document.getElementById('viewer') : viewer;
    const plugin = await createViewer(root);
    const state = new BehaviorSubject({});
    const loadExample = async (name) => {
        state.next({ name, isLoading: true });
        try {
            await Examples[name](plugin);
            state.next({ name });
        }
        catch (e) {
            console.error(e);
            state.next({});
        }
    };
    createRoot(typeof controls === 'string' ? document.getElementById('controls') : controls).render(_jsx(SelectExampleUI, { state: state, load: loadExample }));
    loadExample(defaultExample);
    return { plugin, loadExample };
}
window.initInteractionsExample = init;
