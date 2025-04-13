"use strict";
/**
 * Copyright (c) 2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionTypeToKind = exports.InteractionKinds = void 0;
const common_1 = require("../../mol-model-props/computed/interactions/common");
exports.InteractionKinds = [
    'unknown',
    'ionic',
    'pi-stacking',
    'cation-pi',
    'halogen-bond',
    'hydrogen-bond',
    'weak-hydrogen-bond',
    'hydrophobic',
    'metal-coordination',
    'salt-bridge',
    'covalent',
];
exports.InteractionTypeToKind = {
    [common_1.InteractionType.Unknown]: 'unknown',
    [common_1.InteractionType.Ionic]: 'ionic',
    [common_1.InteractionType.CationPi]: 'cation-pi',
    [common_1.InteractionType.PiStacking]: 'pi-stacking',
    [common_1.InteractionType.HydrogenBond]: 'hydrogen-bond',
    [common_1.InteractionType.HalogenBond]: 'halogen-bond',
    [common_1.InteractionType.Hydrophobic]: 'hydrophobic',
    [common_1.InteractionType.MetalCoordination]: 'metal-coordination',
    [common_1.InteractionType.WeakHydrogenBond]: 'weak-hydrogen-bond',
};
