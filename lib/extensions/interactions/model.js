/**
 * Copyright (c) 2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { InteractionType } from '../../mol-model-props/computed/interactions/common';
export const InteractionKinds = [
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
export const InteractionTypeToKind = {
    [InteractionType.Unknown]: 'unknown',
    [InteractionType.Ionic]: 'ionic',
    [InteractionType.CationPi]: 'cation-pi',
    [InteractionType.PiStacking]: 'pi-stacking',
    [InteractionType.HydrogenBond]: 'hydrogen-bond',
    [InteractionType.HalogenBond]: 'halogen-bond',
    [InteractionType.Hydrophobic]: 'hydrophobic',
    [InteractionType.MetalCoordination]: 'metal-coordination',
    [InteractionType.WeakHydrogenBond]: 'weak-hydrogen-bond',
};
