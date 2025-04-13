/**
 * Copyright (c) 2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StructureElement } from '../../mol-model/structure';
interface InteractionElementSchemaBase {
    aStructureRef?: string;
    a: StructureElement.Schema;
    bStructureRef?: string;
    b: StructureElement.Schema;
    description?: string;
}
export type InteractionElementSchema = {
    kind: 'unknown';
} & InteractionElementSchemaBase | {
    kind: 'ionic';
} & InteractionElementSchemaBase | {
    kind: 'pi-stacking';
} & InteractionElementSchemaBase | {
    kind: 'cation-pi';
} & InteractionElementSchemaBase | {
    kind: 'halogen-bond';
} & InteractionElementSchemaBase | {
    kind: 'hydrogen-bond';
} & InteractionElementSchemaBase | {
    kind: 'weak-hydrogen-bond';
} & InteractionElementSchemaBase | {
    kind: 'hydrophobic';
} & InteractionElementSchemaBase | {
    kind: 'metal-coordination';
} & InteractionElementSchemaBase | {
    kind: 'salt-bridge';
} & InteractionElementSchemaBase | {
    kind: 'covalent';
    degree?: 'aromatic' | 1 | 2 | 3 | 4;
} & InteractionElementSchemaBase;
export type InteractionKind = InteractionElementSchema['kind'];
export declare const InteractionKinds: InteractionKind[];
export type InteractionInfo = {
    kind: 'unknown';
} | {
    kind: 'ionic';
} | {
    kind: 'pi-stacking';
} | {
    kind: 'cation-pi';
} | {
    kind: 'halogen-bond';
} | {
    kind: 'hydrogen-bond';
    hydrogenStructureRef?: string;
    hydrogen?: StructureElement.Loci;
} | {
    kind: 'weak-hydrogen-bond';
    hydrogenStructureRef?: string;
    hydrogen?: StructureElement.Loci;
} | {
    kind: 'hydrophobic';
} | {
    kind: 'metal-coordination';
} | {
    kind: 'salt-bridge';
} | {
    kind: 'covalent';
    degree?: 'aromatic' | 1 | 2 | 3 | 4;
};
export interface StructureInteractionElement {
    sourceSchema?: InteractionElementSchema;
    info: InteractionInfo;
    aStructureRef?: string;
    a: StructureElement.Loci;
    bStructureRef?: string;
    b: StructureElement.Loci;
}
export interface StructureInteractions {
    kind: 'structure-interactions';
    elements: StructureInteractionElement[];
}
export declare const InteractionTypeToKind: {
    0: InteractionKind;
    1: InteractionKind;
    2: InteractionKind;
    3: InteractionKind;
    4: InteractionKind;
    5: InteractionKind;
    6: InteractionKind;
    7: InteractionKind;
    8: InteractionKind;
};
export {};
