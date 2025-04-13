/**
 * Copyright (c) 2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { Shape } from '../../mol-model/shape';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { StructureInteractions } from './model';
export declare const InteractionVisualParams: {
    kinds: PD.MultiSelect<"unknown" | "covalent" | "metal-coordination" | "hydrogen-bond" | "ionic" | "hydrophobic" | "pi-stacking" | "cation-pi" | "halogen-bond" | "weak-hydrogen-bond" | "salt-bridge">;
    styles: PD.Group<PD.Normalize<{
        unknown: PD.Normalize<{
            color: /*elided*/ any;
            style: /*elided*/ any;
            radius: /*elided*/ any;
        }>;
        ionic: PD.Normalize<{
            color: /*elided*/ any;
            style: /*elided*/ any;
            radius: /*elided*/ any;
        }>;
        'pi-stacking': PD.Normalize<{
            color: /*elided*/ any;
            style: /*elided*/ any;
            radius: /*elided*/ any;
        }>;
        'cation-pi': PD.Normalize<{
            color: /*elided*/ any;
            style: /*elided*/ any;
            radius: /*elided*/ any;
        }>;
        'halogen-bond': PD.Normalize<{
            color: /*elided*/ any;
            style: /*elided*/ any;
            radius: /*elided*/ any;
        }>;
        'hydrogen-bond': PD.Normalize<{
            color: /*elided*/ any;
            style: /*elided*/ any;
            radius: /*elided*/ any;
            showArrow: /*elided*/ any;
            arrowOffset: /*elided*/ any;
        }>;
        'weak-hydrogen-bond': PD.Normalize<{
            color: /*elided*/ any;
            style: /*elided*/ any;
            radius: /*elided*/ any;
            showArrow: /*elided*/ any;
            arrowOffset: /*elided*/ any;
        }>;
        hydrophobic: PD.Normalize<{
            color: /*elided*/ any;
            style: /*elided*/ any;
            radius: /*elided*/ any;
        }>;
        'metal-coordination': PD.Normalize<{
            color: /*elided*/ any;
            style: /*elided*/ any;
            radius: /*elided*/ any;
        }>;
        'salt-bridge': PD.Normalize<{
            color: /*elided*/ any;
            style: /*elided*/ any;
            radius: /*elided*/ any;
        }>;
        covalent: PD.Normalize<{
            color: /*elided*/ any;
            radius: /*elided*/ any;
        }>;
    }>>;
};
export type InteractionVisualParams = PD.Values<typeof InteractionVisualParams>;
export declare function buildInteractionsShape(interactions: StructureInteractions, params: InteractionVisualParams, prev?: Mesh): Shape<Mesh>;
