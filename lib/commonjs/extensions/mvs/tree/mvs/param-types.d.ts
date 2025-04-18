/**
 * Copyright (c) 2023-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as iots from 'io-ts';
import { ValueFor } from '../generic/field-schema';
/** `format` parameter values for `parse` node in MVS tree */
export declare const ParseFormatT: iots.Type<"map" | "pdb" | "bcif" | "mmcif", "map" | "pdb" | "bcif" | "mmcif", unknown>;
export type ParseFormatT = ValueFor<typeof ParseFormatT>;
/** `format` parameter values for `parse` node in Molstar tree */
export declare const MolstarParseFormatT: iots.Type<"map" | "pdb" | "cif", "map" | "pdb" | "cif", unknown>;
export type MolstarParseFormatT = ValueFor<typeof MolstarParseFormatT>;
/** `kind` parameter values for `structure` node in MVS tree */
export declare const StructureTypeT: iots.Type<"assembly" | "symmetry" | "model" | "symmetry_mates", "assembly" | "symmetry" | "model" | "symmetry_mates", unknown>;
/** `selector` parameter values for `component` node in MVS tree */
export declare const ComponentSelectorT: iots.Type<"all" | "polymer" | "water" | "branched" | "ligand" | "ion" | "protein" | "nucleic" | "coarse", "all" | "polymer" | "water" | "branched" | "ligand" | "ion" | "protein" | "nucleic" | "coarse", unknown>;
/** `selector` parameter values for `component` node in MVS tree */
export declare const ComponentExpressionT: iots.PartialC<{
    label_entity_id: iots.StringC;
    label_asym_id: iots.StringC;
    auth_asym_id: iots.StringC;
    label_seq_id: iots.RefinementC<iots.NumberC, number>;
    auth_seq_id: iots.RefinementC<iots.NumberC, number>;
    pdbx_PDB_ins_code: iots.StringC;
    beg_label_seq_id: iots.RefinementC<iots.NumberC, number>;
    end_label_seq_id: iots.RefinementC<iots.NumberC, number>;
    beg_auth_seq_id: iots.RefinementC<iots.NumberC, number>;
    end_auth_seq_id: iots.RefinementC<iots.NumberC, number>;
    label_atom_id: iots.StringC;
    auth_atom_id: iots.StringC;
    type_symbol: iots.StringC;
    atom_id: iots.RefinementC<iots.NumberC, number>;
    atom_index: iots.RefinementC<iots.NumberC, number>;
}>;
export type ComponentExpressionT = ValueFor<typeof ComponentExpressionT>;
/** `schema` parameter values for `*_from_uri` and `*_from_source` nodes in MVS tree */
export declare const SchemaT: iots.Type<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic", "atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic", unknown>;
/** `format` parameter values for `*_from_uri` nodes in MVS tree */
export declare const SchemaFormatT: iots.Type<"json" | "cif" | "bcif", "json" | "cif" | "bcif", unknown>;
/** Parameter values for vector params, e.g. `position` */
export declare const Vector3: iots.TupleC<[iots.NumberC, iots.NumberC, iots.NumberC]>;
export type Vector3 = ValueFor<typeof Vector3>;
/** Parameter values for matrix params, e.g. `rotation` */
export declare const Matrix: iots.ArrayC<iots.NumberC>;
/** Primitives-related types */
export declare const PrimitiveComponentExpressionT: iots.PartialC<{
    structure_ref: iots.StringC;
    expression_schema: iots.Type<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic", "atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic", unknown>;
    expressions: iots.ArrayC<iots.PartialC<{
        label_entity_id: iots.StringC;
        label_asym_id: iots.StringC;
        auth_asym_id: iots.StringC;
        label_seq_id: iots.RefinementC<iots.NumberC, number>;
        auth_seq_id: iots.RefinementC<iots.NumberC, number>;
        pdbx_PDB_ins_code: iots.StringC;
        beg_label_seq_id: iots.RefinementC<iots.NumberC, number>;
        end_label_seq_id: iots.RefinementC<iots.NumberC, number>;
        beg_auth_seq_id: iots.RefinementC<iots.NumberC, number>;
        end_auth_seq_id: iots.RefinementC<iots.NumberC, number>;
        label_atom_id: iots.StringC;
        auth_atom_id: iots.StringC;
        type_symbol: iots.StringC;
        atom_id: iots.RefinementC<iots.NumberC, number>;
        atom_index: iots.RefinementC<iots.NumberC, number>;
    }>>;
}>;
export type PrimitiveComponentExpressionT = ValueFor<typeof PrimitiveComponentExpressionT>;
export declare const PrimitivePositionT: iots.UnionC<[iots.TupleC<[iots.NumberC, iots.NumberC, iots.NumberC]>, iots.PartialC<{
    label_entity_id: iots.StringC;
    label_asym_id: iots.StringC;
    auth_asym_id: iots.StringC;
    label_seq_id: iots.RefinementC<iots.NumberC, number>;
    auth_seq_id: iots.RefinementC<iots.NumberC, number>;
    pdbx_PDB_ins_code: iots.StringC;
    beg_label_seq_id: iots.RefinementC<iots.NumberC, number>;
    end_label_seq_id: iots.RefinementC<iots.NumberC, number>;
    beg_auth_seq_id: iots.RefinementC<iots.NumberC, number>;
    end_auth_seq_id: iots.RefinementC<iots.NumberC, number>;
    label_atom_id: iots.StringC;
    auth_atom_id: iots.StringC;
    type_symbol: iots.StringC;
    atom_id: iots.RefinementC<iots.NumberC, number>;
    atom_index: iots.RefinementC<iots.NumberC, number>;
}>, iots.PartialC<{
    structure_ref: iots.StringC;
    expression_schema: iots.Type<"atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic", "atom" | "residue" | "entity" | "chain" | "whole_structure" | "auth_chain" | "auth_residue" | "residue_range" | "auth_residue_range" | "auth_atom" | "all_atomic", unknown>;
    expressions: iots.ArrayC<iots.PartialC<{
        label_entity_id: iots.StringC;
        label_asym_id: iots.StringC;
        auth_asym_id: iots.StringC;
        label_seq_id: iots.RefinementC<iots.NumberC, number>;
        auth_seq_id: iots.RefinementC<iots.NumberC, number>;
        pdbx_PDB_ins_code: iots.StringC;
        beg_label_seq_id: iots.RefinementC<iots.NumberC, number>;
        end_label_seq_id: iots.RefinementC<iots.NumberC, number>;
        beg_auth_seq_id: iots.RefinementC<iots.NumberC, number>;
        end_auth_seq_id: iots.RefinementC<iots.NumberC, number>;
        label_atom_id: iots.StringC;
        auth_atom_id: iots.StringC;
        type_symbol: iots.StringC;
        atom_id: iots.RefinementC<iots.NumberC, number>;
        atom_index: iots.RefinementC<iots.NumberC, number>;
    }>>;
}>]>;
export type PrimitivePositionT = ValueFor<typeof PrimitivePositionT>;
export declare const FloatList: iots.ArrayC<iots.NumberC>;
export declare const IntList: iots.ArrayC<iots.RefinementC<iots.NumberC, number>>;
export declare const StrList: iots.ArrayC<iots.StringC>;
/** `color` parameter values for `color` node in MVS tree */
export declare const HexColorT: iots.Type<`#${string}`, `#${string}`, unknown>;
/** `color` parameter values for `color` node in MVS tree */
export declare const ColorNameT: iots.Type<"aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen" | "cornflower" | "laserlemon" | "lightgoldenrod" | "maroon2" | "maroon3" | "purple2" | "purple3", "aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen" | "cornflower" | "laserlemon" | "lightgoldenrod" | "maroon2" | "maroon3" | "purple2" | "purple3", unknown>;
/** `color` parameter values for `color` node in MVS tree */
export declare const ColorNamesT: iots.Type<"aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen" | "cornflower" | "laserlemon" | "lightgoldenrod" | "maroon2" | "maroon3" | "purple2" | "purple3", "aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen" | "cornflower" | "laserlemon" | "lightgoldenrod" | "maroon2" | "maroon3" | "purple2" | "purple3", unknown>;
/** `color` parameter values for `color` node in MVS tree */
export declare const ColorT: iots.UnionC<[iots.Type<"aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen" | "cornflower" | "laserlemon" | "lightgoldenrod" | "maroon2" | "maroon3" | "purple2" | "purple3", "aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen" | "cornflower" | "laserlemon" | "lightgoldenrod" | "maroon2" | "maroon3" | "purple2" | "purple3", unknown>, iots.Type<`#${string}`, `#${string}`, unknown>]>;
export type ColorT = ValueFor<typeof ColorT>;
/** Type helpers */
export declare function isVector3(x: any): x is Vector3;
export declare function isPrimitiveComponentExpressions(x: any): x is PrimitiveComponentExpressionT;
export declare function isComponentExpression(x: any): x is ComponentExpressionT;
