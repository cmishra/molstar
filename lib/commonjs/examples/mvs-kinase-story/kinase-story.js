"use strict";
/**
 * Copyright (c) 2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStory = buildStory;
const utils_1 = require("../../extensions/mvs/helpers/utils");
const mvs_builder_1 = require("../../extensions/mvs/tree/mvs/mvs-builder");
const param_types_1 = require("../../extensions/mvs/tree/mvs/param-types");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const Domains = {
    ChainA: { auth_asym_id: 'A' },
    SH2: { auth_asym_id: 'A', beg_auth_seq_id: 146, end_auth_seq_id: 247 },
    SH3: { auth_asym_id: 'A', beg_auth_seq_id: 83, end_auth_seq_id: 145 },
    P_loop: { auth_asym_id: 'A', beg_auth_seq_id: 246, end_auth_seq_id: 255 },
    Activation_loop: { auth_asym_id: 'A', beg_auth_seq_id: 384, end_auth_seq_id: 402 },
};
const DomainColors = {
    SH2: '#8ED1A4',
    SH2_BCR: '#D03B4B',
    SH3: '#64B9AA',
    P_loop: 'pink',
    Activation_loop: 'red',
    DFG_motif: 'orange',
};
const Colors = {
    '1opl': '#4577B2',
    '2gqg': '#BC536D',
    '1iep': '#B9E3A0',
    '3ik3': '#F3774B',
    '3oxz': '#7D7EA5',
    'active-site': '#F3794C',
    'binding-site': '#FEEB9F',
};
// Obtained using https://www.rcsb.org/alignment
const Superpositions = {
    '1opl': [-0.6321036327, 0.3450463255, 0.6938213248, 0, -0.6288677634, -0.7515716885, -0.1991615756, 0, 0.4527364948, -0.5622126202, 0.6920597055, 0, 36.3924122492, 118.2516908402, -26.4992054179, 1],
    '3ik3': [-0.7767826245, -0.6295936551, 0.0148520572, 0, 0.6059737752, -0.7408035481, 0.2898376906, 0, -0.1714775143, 0.2341408391, 0.9569605684, 0, 21.0648276775, 53.0266628762, -0.3385906075, 1],
    '2gqg': [0.0648740828, -0.7163272638, 0.6947421137, 0, 0.0160329972, -0.6953706204, -0.7184724374, 0, 0.9977646498, 0.0577490387, -0.0336266582, 0, -31.0690973964, 146.0940883054, 39.7107422531, 1],
    '3oxz': [0.7989033646, 0.5984398921, -0.0601922711, 0, -0.1303123126, 0.269921501, 0.9540236289, 0, 0.5871729857, -0.754328893, 0.2936252816, 0, -8.0697093741, 58.1709160658, 19.0363028443, 1],
};
const Steps = [
    {
        header: 'A Kinase Out of Control',
        key: 'intro',
        description: `
### The Structural Story of BCR-ABL: A Kinase Out of Control

BCR-ABL is a classic case of how structural biology can drive drug discovery. This story will help you understand:

- How the [ABL kinase is normally regulated](#regulated-kinase).
- How a small genetic fusion creates a [rogue kinase](#rogue-kinase).
- How ATP binding fuels [uncontrolled cancer growth](#unstoppable-signaling).
- How [Imatinib revolutionized treatment](#imatinib) by locking the kinase in an inactive state.
- How a [single mutation (T315I) enabled resistance](#mutation) and brought new challenges.
- How [Ponatinib](#ponatinib) and future inhibitors are being designed to keep up in this ongoing battle.
`,
        state: () => {
            const builder = (0, mvs_builder_1.createMVSBuilder)();
            const _1opl = structure(builder, '1opl');
            const [_1opl_poly,] = polymer(_1opl, { color: Colors['1opl'] });
            _1opl_poly.label({ text: 'ABL Kinase' });
            ligand(_1opl, {
                selector: { label_asym_id: 'C' },
                uniform_color: Colors['1opl'],
            });
            ligand(_1opl, {
                selector: { label_asym_id: 'D' },
                surface: true,
                carbon_color: Colors['1opl'],
            });
            return builder;
        },
        camera: {
            position: [103.72, 69.35, 20.52],
            target: [0.36, 55.32, 21.8],
            up: [-0.01, 0.01, -1],
        },
    }, {
        header: 'The ABL Kinase: A Well-Regulated Enzyme',
        key: 'regulated-kinase',
        description: `
### The ABL Kinase: A Well-Regulated Enzyme

Normally, the ABL kinase ([PDB ID 1OPL](${wwPDBLink('1opl')})) is a well-regulated enzyme, kept in check by its SH3 and SH2 domains which fold back onto the kinase domain like a safety lock.
`,
        state: () => {
            const builder = (0, mvs_builder_1.createMVSBuilder)();
            const _1opl = structure(builder, '1opl');
            const [_1opl_poly, _1opl_poly_repr] = polymer(_1opl, { color: Colors['1opl'] });
            ligand(_1opl, {
                selector: { label_asym_id: 'C' },
                uniform_color: Colors['1opl'],
            });
            ligand(_1opl, {
                selector: { label_asym_id: 'D' },
                surface: true,
                carbon_color: Colors['1opl'],
            });
            domains(_1opl, _1opl_poly_repr, [
                [Domains.SH2, DomainColors.SH2, 'SH2'],
                [Domains.SH3, DomainColors.SH3, 'SH3'],
            ], { label_size: 9 });
            return builder;
        },
        camera: {
            position: [-18.33, -30.35, 48.2],
            target: [-10.37, 49.7, 12.68],
            up: [-0.27, -0.37, -0.89],
        },
    }, {
        header: 'The Birth of a Rogue Kinase',
        key: 'rogue-kinase',
        transition_duration_ms: 750,
        description: `
### The Birth of a Rogue Kinase

But in BCR-ABL, this safety mechanism is gone. A reciprocal translocation between chromosomes 9 and 22 creates the Philadelphia chromosome (Ph),
fusing the ABL1 gene from chromosome 9 with the BCR gene on chromosome 22. This fusion produces the chimeric protein, BCR-ABL, which lacks the
regulation of the wildtype protein. Read more about this [here](https://www.cancer.gov/publications/dictionaries/cancer-terms/def/philadelphia-chromosome)
and [the history of its discovery](https://pmc.ncbi.nlm.nih.gov/articles/PMC1934591/).

Comparing the normal protein to the kinase domain alone ([PDB ID 2GQG](${wwPDBLink('2gqg')}), in light red), you can
see how the SH3 and SH2 domains (teal in normal ABL, red in BCR-ABL, with SH3 domain being unresolved in the crystal structure) are no longer positioned to restrain the kinase.

With this lock removed, BCR-ABL is stuck in an active conformation, like an accelerator pedal jammed to the floor. Without
its normal regulation, BCR-ABL will keep signaling, unchecked causing unregulated cell growth and cancer — [chronic myeloid leukemia (CML)](https://en.wikipedia.org/wiki/Chronic_myelogenous_leukemia).
`,
        state: () => {
            const builder = (0, mvs_builder_1.createMVSBuilder)();
            const _1opl = structure(builder, '1opl');
            const [_1opl_poly, _1opl_poly_repr] = polymer(_1opl, { color: Colors['1opl'] });
            ligand(_1opl, {
                selector: { label_asym_id: 'C' },
                uniform_color: Colors['1opl'],
            });
            ligand(_1opl, {
                selector: { label_asym_id: 'D' },
                surface: true,
                carbon_color: Colors['1opl'],
            });
            domains(_1opl, _1opl_poly_repr, [
                [Domains.SH2, DomainColors.SH2, 'SH2'],
                [Domains.SH3, DomainColors.SH3, 'SH3'],
            ], { label_size: 9 });
            const _2gqg = structure(builder, '2gqg');
            const [, _2gqg_poly_repr] = polymer(_2gqg, { color: '#BF99A1' });
            domains(_2gqg, _2gqg_poly_repr, [
                [Domains.SH2, DomainColors['SH2_BCR'], 'SH2 (BCR)'],
            ], { label_size: 6 });
            return builder;
        },
        camera: {
            position: [30.7, -18.5, 13.47],
            target: [3.99, 47.45, 0.08],
            up: [-0.22, -0.28, -0.94],
        },
    }, {
        header: 'ATP Binding and Unstoppable Signaling [1/2]',
        key: 'unstoppable-signaling',
        description: `
### ATP Binding and Unstoppable Signaling

To function, every kinase needs [ATP](https://en.wikipedia.org/wiki/Kinase), and BCR-ABL is no exception.
Here, you can see non-hydrolysable ATP analogue ([AMP-PNP](https://www.ebi.ac.uk/pdbe-srv/pdbechem/chemicalCompound/show/ANP))
nestled in the active site. Look closely at the active site residues—Lys271, Glu286, and Asp381 (in orange).
They form a crucial network that stabilizes the AMP-PNP (and also the ATP) and in the ATP bound kinase  catalyzes phosphorylation,
allowing BCR-ABL to continuously activate downstream signaling pathways.
`,
        state: () => {
            const builder = (0, mvs_builder_1.createMVSBuilder)();
            const _2gqg = structure(builder, '2gqg');
            const [, _2gqg_poly_repr] = polymer(_2gqg, { color: Colors['2gqg'] });
            ligand(_2gqg, {
                selector: { label_asym_id: 'C' },
                surface: true,
                label: 'AMP-PNP ATP',
                label_size: 2,
                label_color: Colors['2gqg'],
            });
            domains(_2gqg, _2gqg_poly_repr, [
                [Domains.SH2, DomainColors['SH2_BCR'], 'SH2'],
                [Domains.P_loop, DomainColors['P_loop'], 'P Loop'],
                [Domains.Activation_loop, DomainColors['Activation_loop'], 'Activation Loop (active)', { label_size: 3 }],
            ], { label_size: 3 });
            drawInteractions(_2gqg, [
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 318, auth_atom_id: 'O' }, { label_asym_id: 'C', label_atom_id: 'N' }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 318, auth_atom_id: 'N' }, { label_asym_id: 'C', label_atom_id: 'N1' }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 315, auth_atom_id: 'OG1' }, { label_asym_id: 'C', label_atom_id: 'N2' }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 620, auth_atom_id: 'O' }, { label_asym_id: 'C', label_atom_id: 'N3' }],
            ]);
            bindingSite(_2gqg, [
                [{ auth_asym_id: 'A', auth_seq_id: 271 }, 'Lys271'],
                [{ auth_asym_id: 'A', auth_seq_id: 286 }, 'Glu286'],
                [{ auth_asym_id: 'A', auth_seq_id: 381 }, 'Asp381'],
            ], { color: Colors['active-site'] });
            return builder;
        },
        camera: {
            position: [38.76, 81.69, 5.8],
            target: [13.01, 60.13, 11.63],
            up: [0.19, -0.46, -0.87],
        },
    }, {
        header: 'ATP Binding and Unstoppable Signaling [2/2]',
        description: `
### ATP Binding and Unstoppable Signaling

Note the location of the activation loop (in red) which sits in its active conformation.

In a normal kinase, ATP binding is a carefully controlled step. But in BCR-ABL, there's no regulation. ATP binds, reactions happen, and
the leukemia-driving signals keep firing.
`,
        state: () => {
            var _a;
            return (_a = Steps.find((s) => s.key === 'unstoppable-signaling')) === null || _a === void 0 ? void 0 : _a.state();
        },
        camera: {
            position: [98.66, 82.23, 14.15],
            target: [12.31, 54.23, 18.79],
            up: [0.06, -0.35, -0.93],
        },
    }, {
        header: 'Imatinib: The Drug That Changed Everything [1/2]',
        key: 'imatinib',
        description: `
### Imatinib: The Drug That Changed Everything

For years, chronic myeloid leukemia (CML) was a death sentence. Then came Imatinib (Gleevec), a molecule designed to fit into the ATP-binding pocket
and lock BCR-ABL in an inactive conformation. The Imatinib-bound structure ([PDB ID 1IEP](${wwPDBLink('1iep')}))
shows the difference: the kinase is frozen. The drug forms a key hydrogen bond with Thr315, known as the gatekeeper residue; as well as Met318, Asp381, Glu286, Ile360 and His361.
`,
        state: () => {
            const builder = (0, mvs_builder_1.createMVSBuilder)();
            const _1iep = structure(builder, '1iep');
            const [, _1iep_poly_repr] = polymer(_1iep, { color: Colors['1iep'] });
            ligand(_1iep, {
                selector: { label_asym_id: 'G' },
                surface: true,
                label: 'Imatinib',
                label_size: 2,
                label_color: Colors['1iep'],
            });
            drawInteractions(_1iep, [
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 286, auth_atom_id: 'OE2' }, { label_asym_id: 'G', label_atom_id: 'N21' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 315, auth_atom_id: 'OG1' }, { label_asym_id: 'G', label_atom_id: 'N13' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 318, auth_atom_id: 'N' }, { label_asym_id: 'G', label_atom_id: 'N3' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 318, auth_atom_id: 'O' }, { label_asym_id: 'G', label_atom_id: 'N3' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 360, auth_atom_id: 'O' }, { label_asym_id: 'G', label_atom_id: 'N51' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 361, auth_atom_id: 'O' }, { label_asym_id: 'G', label_atom_id: 'N51' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 381, auth_atom_id: 'N' }, { label_asym_id: 'G', label_atom_id: 'O29' }, { skipResidue: true }],
            ]);
            ligand(_1iep, {
                selector: { auth_asym_id: 'A', auth_seq_id: 315 },
                label: 'Thr315',
                label_size: 2,
                carbon_color: 'red',
                label_color: 'red',
            });
            bindingSite(_1iep, [
                [{ auth_asym_id: 'A', auth_seq_id: 271 }, 'Lys271'],
                [{ auth_asym_id: 'A', auth_seq_id: 286 }, 'Glu286'],
                [{ auth_asym_id: 'A', auth_seq_id: 381 }, 'Asp381'],
            ], { color: Colors['active-site'] });
            bindingSite(_1iep, [
                [{ auth_asym_id: 'A', auth_seq_id: 318 }, 'Met318'],
                [{ auth_asym_id: 'A', auth_seq_id: 360 }, 'Ile360'],
                [{ auth_asym_id: 'A', auth_seq_id: 361 }, 'His361'],
            ], { color: Colors['binding-site'] });
            return builder;
        },
        camera: {
            position: [40.32, 68.65, 13.5],
            target: [16, 53.82, 14.88],
            up: [0.26, -0.5, -0.83],
        },
    }, {
        header: 'Imatinib: The Drug That Changed Everything [2/2]',
        description: `
### Imatinib: The Drug That Changed Everything

Notice how the P-loop, which normally cradles ATP, has shifted into a closed conformation and the activation loop is also flipped into its closed
conformation. Imatinib doesn't just block ATP—it forces the kinase into a state where it can't function at all. The change is decisive: BCR-ABL is silenced.
`,
        state: () => {
            const builder = (0, mvs_builder_1.createMVSBuilder)();
            const _1iep = structure(builder, '1iep');
            const [, _1iep_poly_repr] = polymer(_1iep, { color: Colors['1iep'] });
            ligand(_1iep, {
                selector: { label_asym_id: 'G' },
                surface: true,
                label: 'Imatinib',
                label_size: 2,
                label_color: Colors['1iep'],
            });
            domains(_1iep, _1iep_poly_repr, [
                [Domains.P_loop, DomainColors['P_loop'], 'P Loop'],
                [Domains.Activation_loop, DomainColors['Activation_loop'], 'Activation Loop (inactive)', { label_size: 3 }],
            ], { label_size: 3 });
            drawInteractions(_1iep, [
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 286, auth_atom_id: 'OE2' }, { label_asym_id: 'G', label_atom_id: 'N21' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 315, auth_atom_id: 'OG1' }, { label_asym_id: 'G', label_atom_id: 'N13' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 318, auth_atom_id: 'N' }, { label_asym_id: 'G', label_atom_id: 'N3' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 318, auth_atom_id: 'O' }, { label_asym_id: 'G', label_atom_id: 'N3' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 360, auth_atom_id: 'O' }, { label_asym_id: 'G', label_atom_id: 'N51' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 361, auth_atom_id: 'O' }, { label_asym_id: 'G', label_atom_id: 'N51' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 381, auth_atom_id: 'N' }, { label_asym_id: 'G', label_atom_id: 'O29' }, { skipResidue: true }],
            ]);
            ligand(_1iep, {
                selector: { auth_asym_id: 'A', auth_seq_id: 315 },
                label: 'Thr315',
                label_size: 2,
                carbon_color: 'red',
                label_color: 'red',
            });
            bindingSite(_1iep, [
                [{ auth_asym_id: 'A', auth_seq_id: 271 }, 'Lys271'],
                [{ auth_asym_id: 'A', auth_seq_id: 286 }, 'Glu286'],
                [{ auth_asym_id: 'A', auth_seq_id: 381 }, 'Asp381'],
            ], { color: Colors['active-site'] });
            bindingSite(_1iep, [
                [{ auth_asym_id: 'A', auth_seq_id: 318 }, 'Met318'],
                [{ auth_asym_id: 'A', auth_seq_id: 360 }, 'Ile360'],
                [{ auth_asym_id: 'A', auth_seq_id: 361 }, 'His361'],
            ], { color: Colors['binding-site'] });
            return builder;
        },
        camera: {
            position: [91.47, 73.63, 20.78],
            target: [12.53, 54.2, 19.09],
            up: [0.04, -0.07, -1],
        },
    }, {
        header: 'Resistance Strikes: The T315I Mutation [1/2]',
        key: 'mutation',
        description: `
### Resistance Strikes: The T315I Mutation

For a while, it seemed like leukemia had been beaten. But then, in some patients, the cancer returned. The culprit?
What was once a threonine (Thr) is now an isoleucine (Ile), a single mutation [T315I](https://doi.org/10.1016/j.ccr.2011.03.003), shown on [PDB ID 3IK3](${wwPDBLink('3ik3')}) in orange.

Forming a hydrogen bond with Imatinib, Thr315 was a crucial contact point. With bulkier and non-polar isoleucine in its place, the contact is lost and the drug won't bind.
`,
        state: () => {
            const builder = (0, mvs_builder_1.createMVSBuilder)();
            const _1iep = structure(builder, '1iep');
            const [, _1iep_poly_repr] = polymer(_1iep, { color: Colors['1iep'] });
            ligand(_1iep, {
                selector: { label_asym_id: 'G' },
                surface: true,
                label: 'Imatinib',
                label_size: 2,
                label_color: Colors['1iep'],
            });
            ligand(_1iep, {
                selector: { auth_asym_id: 'A', auth_seq_id: 315 },
                carbon_color: Colors['1iep'],
                opacity: 0.51,
            });
            const _3ik3 = structure(builder, '3ik3');
            const [, _3ik3_poly_repr] = polymer(_3ik3, { color: Colors['3ik3'] });
            ligand(_3ik3, {
                selector: { auth_asym_id: 'A', auth_seq_id: 315 },
                label: 'T315I',
                label_size: 2,
                carbon_color: 'red',
                label_color: 'red',
            });
            return builder;
        },
        camera: {
            position: [13.69, 72.8, 4.44],
            target: [13.02, 54.12, 9.71],
            up: [0.39, -0.26, -0.88],
        },
    }, {
        header: 'Resistance Strikes: The T315I Mutation [2/2]',
        description: `
### Resistance Strikes: The T315I Mutation

This mutation prevents Imatinib binding but still allows ANP-PNP ATP to nestle into the active site.
The result? Resistance. BCR-ABL is active again, and the leukemia returns, this time untouchable by Imatinib.
`,
        state: () => {
            const builder = (0, mvs_builder_1.createMVSBuilder)();
            const _2gqg = structure(builder, '2gqg');
            const [, _2gqg_poly_repr] = polymer(_2gqg, { color: Colors['2gqg'] });
            ligand(_2gqg, {
                selector: { label_asym_id: 'C' },
                surface: true,
                label: 'ANP-PNP ATP',
                label_size: 2,
                label_color: Colors['2gqg'],
            });
            drawInteractions(_2gqg, [
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 318, auth_atom_id: 'O' }, { label_asym_id: 'C', label_atom_id: 'N' }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 318, auth_atom_id: 'N' }, { label_asym_id: 'C', label_atom_id: 'N1' }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 620, auth_atom_id: 'O' }, { label_asym_id: 'C', label_atom_id: 'N3' }],
            ]);
            bindingSite(_2gqg, [
                [{ auth_asym_id: 'A', auth_seq_id: 271 }, 'Lys271'],
                [{ auth_asym_id: 'A', auth_seq_id: 286 }, 'Glu286'],
                [{ auth_asym_id: 'A', auth_seq_id: 381 }, 'Asp381'],
            ], { color: Colors['active-site'] });
            const _3ik3 = structure(builder, '3ik3');
            const [, _3ik3_poly_repr] = polymer(_3ik3, { color: Colors['3ik3'] });
            ligand(_3ik3, {
                selector: { auth_asym_id: 'A', auth_seq_id: 315 },
                label: 'T315I',
                label_size: 2,
                carbon_color: 'red',
                label_color: 'red',
            });
            return builder;
        },
        camera: {
            position: [19.42, 97.24, -0.29],
            target: [13.02, 54.12, 9.71],
            up: [0.37, -0.26, -0.89],
        },
    }, {
        header: 'Fighting Back: Ponatinib and the Future of Kinase Inhibitors',
        key: 'ponatinib',
        description: `
### Fighting Back: Ponatinib and the Future of Kinase Inhibitors

The battle didn't end there. Scientists knew they needed a new inhibitor—one that could work even against T315I. Enter Ponatinib (shown in [PDB ID 3OXZ](${wwPDBLink('3oxz')})), a next-generation
drug designed to bypass this resistance. Viewing the Ponatinib-bound structure, you'll see how it differs from Imatinib. Instead of being blocked by T315I,
Ponatinib has a flexible triple-bond linker, allowing it to slip into the binding site without clashing with the mutation. 

Look closely at the interactions—Ponatinib forms new hydrophobic contacts that compensate for the loss of the Thr315 interaction. This structure tells a story of rational drug design: scientists
used everything they learned about BCR-ABL's structure to engineer a molecule that could fit where others failed.

But the story isn't over. New mutations continue to arise, and leukemia is still finding ways to outmaneuver our drugs. The future may lie in allosteric
inhibitors that bind outside the ATP pocket, or even in protein degradation strategies that eliminate BCR-ABL entirely. Whatever the next breakthrough is,
it will start here—with a deep understanding of structure and function, and the power of visualization to reveal the molecular battles happening
inside every cancer cell.
`,
        state: () => {
            const builder = (0, mvs_builder_1.createMVSBuilder)();
            const _3oxz = structure(builder, '3oxz');
            const [, _3oxz_poly_repr] = polymer(_3oxz, { color: Colors['3oxz'] });
            ligand(_3oxz, {
                selector: { label_asym_id: 'B' },
                surface: true,
                label: 'Ponatinib',
                label_size: 2,
                label_color: Colors['3oxz'],
            });
            ligand(_3oxz, {
                selector: { auth_asym_id: 'A', auth_seq_id: 315 },
                label: 'T315I',
                label_size: 2,
                carbon_color: 'red',
                label_color: 'red',
            });
            drawInteractions(_3oxz, [
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 360, auth_atom_id: 'O' }, { label_asym_id: 'B', label_atom_id: 'N4' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 361, auth_atom_id: 'O' }, { label_asym_id: 'B', label_atom_id: 'N4' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 286, auth_atom_id: 'OE2' }, { label_asym_id: 'B', label_atom_id: 'N2' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 381, auth_atom_id: 'N' }, { label_asym_id: 'B', label_atom_id: 'O1' }, { skipResidue: true }],
                ['H-bond', { auth_asym_id: 'A', auth_seq_id: 318, auth_atom_id: 'N' }, { label_asym_id: 'B', label_atom_id: 'N1' }, { skipResidue: true }],
            ]);
            bindingSite(_3oxz, [
                [{ auth_asym_id: 'A', auth_seq_id: 286 }, 'Glu286'],
                [{ auth_asym_id: 'A', auth_seq_id: 318 }, 'Met318'],
                [{ auth_asym_id: 'A', auth_seq_id: 360 }, 'Ile360'],
                [{ auth_asym_id: 'A', auth_seq_id: 361 }, 'His361'],
                [{ auth_asym_id: 'A', auth_seq_id: 381 }, 'Asp381'],
            ], { color: Colors['active-site'] });
            return builder;
        },
        camera: {
            position: [61.15, 66.58, 19.72],
            target: [9.61, 50.49, 14.08],
            up: [0.15, -0.15, -0.98],
        },
    }, {
        header: 'The End',
        key: 'end',
        description: `
### The End

That's all folks! We hope you enjoyed this interactive journey through the structural biology of BCR-ABL.

The next time you look at a macromolecular structure, remember: each atom tells a story, and each discovery shapes the future of medicine.

Read more [here](https://pmc.ncbi.nlm.nih.gov/articles/PMC3513788/).
`,
        state: () => {
            return Steps[0].state();
        },
        camera: {
            position: [103.72, 69.35, 20.52],
            target: [0.36, 55.32, 21.8],
            up: [-0.01, 0.01, -1],
        },
    }
];
function drawInteractions(structure, interactions) {
    const primitives = structure.primitives();
    const interactingResidues = [];
    const addedResidues = new Set();
    for (const [tooltip, a, b, options] of interactions) {
        primitives.tube({ start: a, end: b, color: '#4289B5', tooltip, radius: 0.1, dash_length: 0.1 });
        if (options === null || options === void 0 ? void 0 : options.skipResidue)
            continue;
        const expressions = (0, param_types_1.isPrimitiveComponentExpressions)(a) ? a.expressions : [a];
        for (const _e of expressions) {
            const e = { ..._e };
            delete e.auth_atom_id;
            delete e.label_atom_id;
            const key = JSON.stringify(e);
            if (addedResidues.has(key))
                continue;
            interactingResidues.push(e);
            addedResidues.add(key);
        }
    }
    if (interactingResidues.length === 0)
        return;
    structure
        .component({ selector: interactingResidues })
        .representation({ type: 'ball_and_stick' })
        .color({
        custom: {
            molstar_color_theme_name: 'element-symbol',
            molstar_color_theme_params: { carbonColor: { name: 'element-symbol', params: {} } },
        }
    });
}
function transform(structure, id) {
    const rotation = linear_algebra_1.Mat3.fromMat4(linear_algebra_1.Mat3.zero(), Superpositions[id]);
    const translation = linear_algebra_1.Mat4.getTranslation(linear_algebra_1.Vec3.zero(), Superpositions[id]);
    return structure.transform({ rotation, translation });
}
function wwPDBLink(id) {
    return `https://doi.org/10.2210/pdb${id.toLowerCase()}/pdb`;
}
function structure(builder, id) {
    let ret = builder
        .download({ url: pdbUrl(id) })
        .parse({ format: 'bcif' })
        .modelStructure();
    if (id in Superpositions) {
        ret = transform(ret, id);
    }
    return ret;
}
function domains(structure, reprensentation, domains, options) {
    var _a, _b;
    const hasLabels = domains.some(d => !!d[2]);
    const primitives = hasLabels ? structure.primitives() : undefined;
    for (const [selector, color, label, opts] of domains) {
        reprensentation.color({ selector, color });
        if (label)
            primitives.label({ position: selector, text: label, label_color: color, label_size: (_b = (_a = opts === null || opts === void 0 ? void 0 : opts.label_size) !== null && _a !== void 0 ? _a : options === null || options === void 0 ? void 0 : options.label_size) !== null && _b !== void 0 ? _b : 1.5 });
    }
}
function polymer(structure, options) {
    const component = structure.component({ selector: { label_asym_id: 'A' } });
    const reprensentation = component.representation({ type: 'cartoon' });
    reprensentation.color({ color: options.color });
    return [component, reprensentation];
}
function ligand(structure, options) {
    var _a, _b, _c, _d;
    const comp = structure.component({ selector: options.selector });
    const coloring = options.uniform_color
        ? { color: options.uniform_color }
        : {
            custom: {
                molstar_color_theme_name: 'element-symbol',
                molstar_color_theme_params: { carbonColor: (options === null || options === void 0 ? void 0 : options.carbon_color) ? { name: 'uniform', params: { value: (0, utils_1.decodeColor)(options === null || options === void 0 ? void 0 : options.carbon_color) } } : { name: 'element-symbol', params: {} } }
            }
        };
    if (options.surface)
        comp.representation({ type: 'surface' }).color(coloring).opacity({ opacity: 0.33 });
    const repr = comp.representation({ type: 'ball_and_stick' }).color(coloring);
    if (options.opacity)
        repr.opacity({ opacity: options.opacity });
    const label_color = (_c = (_b = (_a = options === null || options === void 0 ? void 0 : options.label_color) !== null && _a !== void 0 ? _a : options.uniform_color) !== null && _b !== void 0 ? _b : options.carbon_color) !== null && _c !== void 0 ? _c : '#5B53A4';
    if (options.label) {
        structure.primitives().label({
            position: Array.isArray(options.selector) ? { expressions: options.selector } : options.selector,
            text: options.label,
            label_color,
            label_size: (_d = options === null || options === void 0 ? void 0 : options.label_size) !== null && _d !== void 0 ? _d : 1.5
        });
    }
    return comp;
}
function bindingSite(structure, residues, options) {
    var _a, _b;
    const color = (_a = options.color) !== null && _a !== void 0 ? _a : '#5B53A4';
    const coloring = {
        custom: {
            molstar_color_theme_name: 'element-symbol',
            molstar_color_theme_params: { carbonColor: { name: 'uniform', params: { value: (0, utils_1.decodeColor)(color) } } }
        }
    };
    structure.component({ selector: residues.map(r => r[0]) }).representation({ type: 'ball_and_stick' }).color(coloring);
    const primitives = structure.primitives();
    for (const [selector, label] of residues) {
        primitives.label({
            position: selector,
            text: label,
            label_color: color,
            label_size: (_b = options === null || options === void 0 ? void 0 : options.label_size) !== null && _b !== void 0 ? _b : 1.5
        });
    }
}
function pdbUrl(id) {
    return `https://www.ebi.ac.uk/pdbe/entry-files/download/${id.toLowerCase()}.bcif`;
}
function buildStory() {
    const snapshots = Steps.map((s, i) => {
        var _a;
        const builder = s.state();
        if (s.camera)
            builder.camera(s.camera);
        const description = i > 0 ? `${s.description}\n\n[Go to start](#intro)` : s.description;
        return builder.getSnapshot({
            title: s.header,
            key: s.key,
            description,
            description_format: 'markdown',
            linger_duration_ms: 5000,
            transition_duration_ms: (_a = s.transition_duration_ms) !== null && _a !== void 0 ? _a : 1500,
        });
    });
    return {
        kind: 'multiple',
        snapshots,
        metadata: {
            title: 'The Structural Story of BCR-ABL: A Kinase Out of Control',
            version: '1.0',
            timestamp: new Date().toISOString(),
        }
    };
}
