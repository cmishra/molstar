"use strict";
/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorTheme = void 0;
exports.ColorThemeProvider = ColorThemeProvider;
const color_1 = require("../mol-util/color");
const carbohydrate_symbol_1 = require("./color/carbohydrate-symbol");
const uniform_1 = require("./color/uniform");
const mol_util_1 = require("../mol-util");
const theme_1 = require("./theme");
const chain_id_1 = require("./color/chain-id");
const element_index_1 = require("./color/element-index");
const element_symbol_1 = require("./color/element-symbol");
const molecule_type_1 = require("./color/molecule-type");
const polymer_id_1 = require("./color/polymer-id");
const polymer_index_1 = require("./color/polymer-index");
const residue_name_1 = require("./color/residue-name");
const secondary_structure_1 = require("./color/secondary-structure");
const sequence_id_1 = require("./color/sequence-id");
const shape_group_1 = require("./color/shape-group");
const unit_index_1 = require("./color/unit-index");
const uncertainty_1 = require("./color/uncertainty");
const entity_source_1 = require("./color/entity-source");
const illustrative_1 = require("./color/illustrative");
const hydrophobicity_1 = require("./color/hydrophobicity");
const trajectory_index_1 = require("./color/trajectory-index");
const occupancy_1 = require("./color/occupancy");
const operator_name_1 = require("./color/operator-name");
const operator_hkl_1 = require("./color/operator-hkl");
const partial_charge_1 = require("./color/partial-charge");
const atom_id_1 = require("./color/atom-id");
const entity_id_1 = require("./color/entity-id");
const volume_value_1 = require("./color/volume-value");
const model_index_1 = require("./color/model-index");
const structure_index_1 = require("./color/structure-index");
const volume_segment_1 = require("./color/volume-segment");
const external_volume_1 = require("./color/external-volume");
const categories_1 = require("./color/categories");
const cartoon_1 = require("./color/cartoon");
const formal_charge_1 = require("./color/formal-charge");
const external_structure_1 = require("./color/external-structure");
const number_1 = require("../mol-util/number");
const sorted_array_1 = require("../mol-data/int/sorted-array");
const interpolate_1 = require("../mol-math/interpolate");
var ColorTheme;
(function (ColorTheme) {
    ColorTheme.Category = categories_1.ColorThemeCategory;
    function Palette(list, kind, domain, defaultColor) {
        const colors = [];
        const hasOffsets = list.every(c => Array.isArray(c));
        if (hasOffsets) {
            let maxPrecision = 0;
            for (const e of list) {
                if (Array.isArray(e)) {
                    const p = (0, number_1.getPrecision)(e[1]);
                    if (p > maxPrecision)
                        maxPrecision = p;
                }
            }
            const count = Math.pow(10, maxPrecision);
            const sorted = [...list];
            sorted.sort((a, b) => a[1] - b[1]);
            const src = sorted.map(c => c[0]);
            const values = sorted_array_1.SortedArray.ofSortedArray(sorted.map(c => c[1]));
            const _off = [];
            for (let i = 0, il = values.length - 1; i < il; ++i) {
                _off.push(values[i] + (values[i + 1] - values[i]) / 2);
            }
            _off.push(values[values.length - 1]);
            const off = sorted_array_1.SortedArray.ofSortedArray(_off);
            for (let i = 0, il = Math.max(count, list.length); i < il; ++i) {
                const t = (0, interpolate_1.normalize)(i, 0, count - 1);
                const j = sorted_array_1.SortedArray.findPredecessorIndex(off, t);
                colors[i] = src[j];
            }
        }
        else {
            for (const e of list) {
                if (Array.isArray(e))
                    colors.push(e[0]);
                else
                    colors.push(e);
            }
        }
        return {
            colors,
            filter: kind === 'set' ? 'nearest' : 'linear',
            domain,
            defaultColor,
        };
    }
    ColorTheme.Palette = Palette;
    ColorTheme.PaletteScale = (1 << 24) - 2; // reserve (1 << 24) - 1 for undefiend values
    ColorTheme.EmptyFactory = () => ColorTheme.Empty;
    const EmptyColor = (0, color_1.Color)(0xCCCCCC);
    ColorTheme.Empty = {
        factory: ColorTheme.EmptyFactory,
        granularity: 'uniform',
        color: () => EmptyColor,
        props: {}
    };
    function areEqual(themeA, themeB) {
        return themeA.contextHash === themeB.contextHash && themeA.factory === themeB.factory && (0, mol_util_1.deepEqual)(themeA.props, themeB.props);
    }
    ColorTheme.areEqual = areEqual;
    ColorTheme.EmptyProvider = { name: '', label: '', category: '', factory: ColorTheme.EmptyFactory, getParams: () => ({}), defaultValues: {}, isApplicable: () => true };
    function createRegistry() {
        return new theme_1.ThemeRegistry(ColorTheme.BuiltIn, ColorTheme.EmptyProvider);
    }
    ColorTheme.createRegistry = createRegistry;
    ColorTheme.BuiltIn = {
        'atom-id': atom_id_1.AtomIdColorThemeProvider,
        'carbohydrate-symbol': carbohydrate_symbol_1.CarbohydrateSymbolColorThemeProvider,
        'cartoon': cartoon_1.CartoonColorThemeProvider,
        'chain-id': chain_id_1.ChainIdColorThemeProvider,
        'element-index': element_index_1.ElementIndexColorThemeProvider,
        'element-symbol': element_symbol_1.ElementSymbolColorThemeProvider,
        'entity-id': entity_id_1.EntityIdColorThemeProvider,
        'entity-source': entity_source_1.EntitySourceColorThemeProvider,
        'external-structure': external_structure_1.ExternalStructureColorThemeProvider,
        'external-volume': external_volume_1.ExternalVolumeColorThemeProvider,
        'formal-charge': formal_charge_1.FormalChargeColorThemeProvider,
        'hydrophobicity': hydrophobicity_1.HydrophobicityColorThemeProvider,
        'illustrative': illustrative_1.IllustrativeColorThemeProvider,
        'model-index': model_index_1.ModelIndexColorThemeProvider,
        'molecule-type': molecule_type_1.MoleculeTypeColorThemeProvider,
        'occupancy': occupancy_1.OccupancyColorThemeProvider,
        'operator-hkl': operator_hkl_1.OperatorHklColorThemeProvider,
        'operator-name': operator_name_1.OperatorNameColorThemeProvider,
        'partial-charge': partial_charge_1.PartialChargeColorThemeProvider,
        'polymer-id': polymer_id_1.PolymerIdColorThemeProvider,
        'polymer-index': polymer_index_1.PolymerIndexColorThemeProvider,
        'residue-name': residue_name_1.ResidueNameColorThemeProvider,
        'secondary-structure': secondary_structure_1.SecondaryStructureColorThemeProvider,
        'sequence-id': sequence_id_1.SequenceIdColorThemeProvider,
        'shape-group': shape_group_1.ShapeGroupColorThemeProvider,
        'structure-index': structure_index_1.StructureIndexColorThemeProvider,
        'trajectory-index': trajectory_index_1.TrajectoryIndexColorThemeProvider,
        'uncertainty': uncertainty_1.UncertaintyColorThemeProvider,
        'unit-index': unit_index_1.UnitIndexColorThemeProvider,
        'uniform': uniform_1.UniformColorThemeProvider,
        'volume-segment': volume_segment_1.VolumeSegmentColorThemeProvider,
        'volume-value': volume_value_1.VolumeValueColorThemeProvider,
    };
})(ColorTheme || (exports.ColorTheme = ColorTheme = {}));
function ColorThemeProvider(p) { return p; }
