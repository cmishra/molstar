"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureSelectionsPlane3D = exports.StructureSelectionsOrientation3D = exports.StructureSelectionsLabel3D = exports.StructureSelectionsDihedral3D = exports.StructureSelectionsAngle3D = exports.StructureSelectionsDistance3D = exports.StructureBoundingBox3D = exports.ModelUnitcell3D = exports.ShapeRepresentation3D = exports.VolumeRepresentation3DHelpers = exports.VolumeRepresentation3D = exports.ThemeStrengthRepresentation3D = exports.ClippingStructureRepresentation3DFromBundle = exports.ClippingStructureRepresentation3DFromScript = exports.SubstanceStructureRepresentation3DFromBundle = exports.SubstanceStructureRepresentation3DFromScript = exports.EmissiveStructureRepresentation3DFromBundle = exports.EmissiveStructureRepresentation3DFromScript = exports.TransparencyStructureRepresentation3DFromBundle = exports.TransparencyStructureRepresentation3DFromScript = exports.OverpaintStructureRepresentation3DFromBundle = exports.OverpaintStructureRepresentation3DFromScript = exports.UnwindStructureAssemblyRepresentation3D = exports.SpinStructureRepresentation3D = exports.ExplodeStructureRepresentation3D = exports.StructureRepresentation3D = void 0;
const structure_1 = require("../../mol-model/structure");
const volume_1 = require("../../mol-model/volume");
const mol_state_1 = require("../../mol-state");
const mol_task_1 = require("../../mol-task");
const theme_1 = require("../../mol-theme/theme");
const param_definition_1 = require("../../mol-util/param-definition");
const objects_1 = require("../objects");
const names_1 = require("../../mol-util/color/names");
const representation_1 = require("../../mol-repr/shape/representation");
const unit_transforms_1 = require("../../mol-model/structure/structure/util/unit-transforms");
const helpers_1 = require("../animation/helpers");
const color_1 = require("../../mol-util/color");
const overpaint_1 = require("../../mol-theme/overpaint");
const transparency_1 = require("../../mol-theme/transparency");
const base_1 = require("../../mol-geo/geometry/base");
const script_1 = require("../../mol-script/script");
const unitcell_1 = require("../../mol-repr/shape/model/unitcell");
const distance_1 = require("../../mol-repr/shape/loci/distance");
const helpers_2 = require("./helpers");
const label_1 = require("../../mol-repr/shape/loci/label");
const orientation_1 = require("../../mol-repr/shape/loci/orientation");
const angle_1 = require("../../mol-repr/shape/loci/angle");
const dihedral_1 = require("../../mol-repr/shape/loci/dihedral");
const symmetry_1 = require("../../mol-model-formats/structure/property/symmetry");
const clipping_1 = require("../../mol-theme/clipping");
const type_helpers_1 = require("../../mol-util/type-helpers");
const mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
const shape_1 = require("./shape");
const shape_2 = require("../../mol-model/shape");
const plane_1 = require("../../mol-repr/shape/loci/plane");
const substance_1 = require("../../mol-theme/substance");
const material_1 = require("../../mol-util/material");
const interpolate_1 = require("../../mol-math/interpolate");
const marker_action_1 = require("../../mol-util/marker-action");
const emissive_1 = require("../../mol-theme/emissive");
const StructureRepresentation3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-representation-3d',
    display: '3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    params: (a, ctx) => {
        const { registry, themes: themeCtx } = ctx.representation.structure;
        const type = registry.get(registry.default.name);
        if (!a) {
            const colorThemeInfo = {
                help: (value) => {
                    const { name, params } = value;
                    const p = themeCtx.colorThemeRegistry.get(name);
                    const ct = p.factory({}, params);
                    return { description: ct.description, legend: ct.legend };
                }
            };
            return {
                type: param_definition_1.ParamDefinition.Mapped(registry.default.name, registry.types, name => param_definition_1.ParamDefinition.Group(registry.get(name).getParams(themeCtx, structure_1.Structure.Empty))),
                colorTheme: param_definition_1.ParamDefinition.Mapped(type.defaultColorTheme.name, themeCtx.colorThemeRegistry.types, name => param_definition_1.ParamDefinition.Group(themeCtx.colorThemeRegistry.get(name).getParams({ structure: structure_1.Structure.Empty })), colorThemeInfo),
                sizeTheme: param_definition_1.ParamDefinition.Mapped(type.defaultSizeTheme.name, themeCtx.sizeThemeRegistry.types, name => param_definition_1.ParamDefinition.Group(themeCtx.sizeThemeRegistry.get(name).getParams({ structure: structure_1.Structure.Empty })))
            };
        }
        const dataCtx = { structure: a.data };
        const colorThemeInfo = {
            help: (value) => {
                const { name, params } = value;
                const p = themeCtx.colorThemeRegistry.get(name);
                const ct = p.factory(dataCtx, params);
                return { description: ct.description, legend: ct.legend };
            }
        };
        return ({
            type: param_definition_1.ParamDefinition.Mapped(registry.default.name, registry.getApplicableTypes(a.data), name => param_definition_1.ParamDefinition.Group(registry.get(name).getParams(themeCtx, a.data))),
            colorTheme: param_definition_1.ParamDefinition.Mapped(type.defaultColorTheme.name, themeCtx.colorThemeRegistry.getApplicableTypes(dataCtx), name => param_definition_1.ParamDefinition.Group(themeCtx.colorThemeRegistry.get(name).getParams(dataCtx)), colorThemeInfo),
            sizeTheme: param_definition_1.ParamDefinition.Mapped(type.defaultSizeTheme.name, themeCtx.sizeThemeRegistry.getApplicableTypes(dataCtx), name => param_definition_1.ParamDefinition.Group(themeCtx.sizeThemeRegistry.get(name).getParams(dataCtx)))
        });
    }
})({
    canAutoUpdate({ a, oldParams, newParams }) {
        // TODO: other criteria as well?
        return a.data.elementCount < 10000 || (oldParams.type.name === newParams.type.name && newParams.type.params.quality !== 'custom');
    },
    apply({ a, params, cache }, plugin) {
        return mol_task_1.Task.create('Structure Representation', async (ctx) => {
            var _a, _b;
            const propertyCtx = { runtime: ctx, assetManager: plugin.managers.asset, errorContext: plugin.errorContext };
            const provider = plugin.representation.structure.registry.get(params.type.name);
            const data = ((_a = provider.getData) === null || _a === void 0 ? void 0 : _a.call(provider, a.data, params.type.params)) || a.data;
            if (provider.ensureCustomProperties)
                await provider.ensureCustomProperties.attach(propertyCtx, data);
            const repr = provider.factory({ webgl: (_b = plugin.canvas3d) === null || _b === void 0 ? void 0 : _b.webgl, ...plugin.representation.structure.themes }, provider.getParams);
            await theme_1.Theme.ensureDependencies(propertyCtx, plugin.representation.structure.themes, { structure: data }, params);
            repr.setTheme(theme_1.Theme.create(plugin.representation.structure.themes, { structure: data }, params));
            const props = params.type.params || {};
            await repr.createOrUpdate(props, data).runInContext(ctx);
            return new objects_1.PluginStateObject.Molecule.Structure.Representation3D({ repr, sourceData: a.data }, { label: provider.label });
        });
    },
    update({ a, b, oldParams, newParams, cache }, plugin) {
        return mol_task_1.Task.create('Structure Representation', async (ctx) => {
            var _a, _b;
            if (newParams.type.name !== oldParams.type.name)
                return mol_state_1.StateTransformer.UpdateResult.Recreate;
            const provider = plugin.representation.structure.registry.get(newParams.type.name);
            if ((_a = provider.mustRecreate) === null || _a === void 0 ? void 0 : _a.call(provider, oldParams.type.params, newParams.type.params))
                return mol_state_1.StateTransformer.UpdateResult.Recreate;
            const data = ((_b = provider.getData) === null || _b === void 0 ? void 0 : _b.call(provider, a.data, newParams.type.params)) || a.data;
            const propertyCtx = { runtime: ctx, assetManager: plugin.managers.asset, errorContext: plugin.errorContext };
            if (provider.ensureCustomProperties)
                await provider.ensureCustomProperties.attach(propertyCtx, data);
            // TODO: if themes had a .needsUpdate method the following block could
            //       be optimized and only executed conditionally
            theme_1.Theme.releaseDependencies(plugin.representation.structure.themes, { structure: b.data.sourceData }, oldParams);
            await theme_1.Theme.ensureDependencies(propertyCtx, plugin.representation.structure.themes, { structure: data }, newParams);
            b.data.repr.setTheme(theme_1.Theme.create(plugin.representation.structure.themes, { structure: data }, newParams));
            const props = { ...b.data.repr.props, ...newParams.type.params };
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = a.data;
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    },
    dispose({ b, params }, plugin) {
        if (!b || !params)
            return;
        const structure = b.data.sourceData;
        const provider = plugin.representation.structure.registry.get(params.type.name);
        if (provider.ensureCustomProperties)
            provider.ensureCustomProperties.detach(structure);
        theme_1.Theme.releaseDependencies(plugin.representation.structure.themes, { structure }, params);
    },
    interpolate(src, tar, t) {
        if (src.colorTheme.name !== 'uniform' || tar.colorTheme.name !== 'uniform') {
            return t <= 0.5 ? src : tar;
        }
        const from = src.colorTheme.params.value, to = tar.colorTheme.params.value;
        const value = color_1.Color.interpolate(from, to, t);
        return {
            type: t <= 0.5 ? src.type : tar.type,
            colorTheme: { name: 'uniform', params: { value } },
            sizeTheme: t <= 0.5 ? src.sizeTheme : tar.sizeTheme,
        };
    }
});
exports.StructureRepresentation3D = StructureRepresentation3D;
const UnwindStructureAssemblyRepresentation3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'unwind-structure-assembly-representation-3d',
    display: 'Unwind Assembly 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: { t: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 1, step: 0.01 }) }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const unitTransforms = new unit_transforms_1.StructureUnitTransforms(structure);
        (0, helpers_1.unwindStructureAssembly)(structure, unitTransforms, params.t);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { unitTransforms },
            initialState: { unitTransforms: new unit_transforms_1.StructureUnitTransforms(structure) },
            info: structure,
            repr: a.data.repr
        }, { label: `Unwind T = ${params.t.toFixed(2)}` });
    },
    update({ a, b, newParams, oldParams }) {
        const structure = b.data.info;
        if (a.data.sourceData !== structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (oldParams.t === newParams.t)
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        const unitTransforms = b.data.state.unitTransforms;
        (0, helpers_1.unwindStructureAssembly)(structure, unitTransforms, newParams.t);
        b.label = `Unwind T = ${newParams.t.toFixed(2)}`;
        b.data.repr = a.data.repr;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.UnwindStructureAssemblyRepresentation3D = UnwindStructureAssemblyRepresentation3D;
const ExplodeStructureRepresentation3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'explode-structure-representation-3d',
    display: 'Explode 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: { t: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 1, step: 0.01 }) }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const unitTransforms = new unit_transforms_1.StructureUnitTransforms(structure);
        (0, helpers_1.explodeStructure)(structure, unitTransforms, params.t, structure.root.boundary.sphere);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { unitTransforms },
            initialState: { unitTransforms: new unit_transforms_1.StructureUnitTransforms(structure) },
            info: structure,
            repr: a.data.repr
        }, { label: `Explode T = ${params.t.toFixed(2)}` });
    },
    update({ a, b, newParams, oldParams }) {
        const structure = a.data.sourceData;
        if (b.data.info !== structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (oldParams.t === newParams.t)
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        const unitTransforms = b.data.state.unitTransforms;
        (0, helpers_1.explodeStructure)(structure, unitTransforms, newParams.t, structure.root.boundary.sphere);
        b.label = `Explode T = ${newParams.t.toFixed(2)}`;
        b.data.repr = a.data.repr;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.ExplodeStructureRepresentation3D = ExplodeStructureRepresentation3D;
const SpinStructureRepresentation3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'spin-structure-representation-3d',
    display: 'Spin 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: {
        t: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 1, step: 0.01 }),
        ...helpers_1.SpinStructureParams
    }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const unitTransforms = new unit_transforms_1.StructureUnitTransforms(structure);
        const { axis, origin } = (0, helpers_1.getSpinStructureAxisAndOrigin)(structure.root, params);
        (0, helpers_1.spinStructure)(structure, unitTransforms, params.t, axis, origin);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { unitTransforms },
            initialState: { unitTransforms: new unit_transforms_1.StructureUnitTransforms(structure) },
            info: structure,
            repr: a.data.repr
        }, { label: `Spin T = ${params.t.toFixed(2)}` });
    },
    update({ a, b, newParams, oldParams }) {
        const structure = a.data.sourceData;
        if (b.data.info !== structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (oldParams.t === newParams.t && oldParams.axis === newParams.axis && oldParams.origin === newParams.origin)
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        const unitTransforms = b.data.state.unitTransforms;
        const { axis, origin } = (0, helpers_1.getSpinStructureAxisAndOrigin)(structure.root, newParams);
        (0, helpers_1.spinStructure)(structure, unitTransforms, newParams.t, axis, origin);
        b.label = `Spin T = ${newParams.t.toFixed(2)}`;
        b.data.repr = a.data.repr;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.SpinStructureRepresentation3D = SpinStructureRepresentation3D;
const OverpaintStructureRepresentation3DFromScript = objects_1.PluginStateTransform.BuiltIn({
    name: 'overpaint-structure-representation-3d-from-script',
    display: 'Overpaint 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: param_definition_1.ParamDefinition.ObjectList({
            script: param_definition_1.ParamDefinition.Script((0, script_1.Script)('(sel.atom.all)', 'mol-script')),
            color: param_definition_1.ParamDefinition.Color(names_1.ColorNames.blueviolet),
            clear: param_definition_1.ParamDefinition.Boolean(false)
        }, e => `${e.clear ? 'Clear' : color_1.Color.toRgbString(e.color)}`, {
            defaultValue: [{
                    script: (0, script_1.Script)('(sel.atom.all)', 'mol-script'),
                    color: names_1.ColorNames.blueviolet,
                    clear: false
                }]
        }),
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const geometryVersion = a.data.repr.geometryVersion;
        const overpaint = overpaint_1.Overpaint.ofScript(params.layers, structure);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { overpaint },
            initialState: { overpaint: overpaint_1.Overpaint.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Overpaint (${overpaint.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && (0, base_1.hasColorSmoothingProp)(a.data.repr.props))
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const oldOverpaint = b.data.state.overpaint;
        const newOverpaint = overpaint_1.Overpaint.ofScript(newParams.layers, newStructure);
        if (overpaint_1.Overpaint.areEqual(oldOverpaint, newOverpaint))
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.overpaint = newOverpaint;
        b.data.repr = a.data.repr;
        b.label = `Overpaint (${newOverpaint.layers.length} Layers)`;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.OverpaintStructureRepresentation3DFromScript = OverpaintStructureRepresentation3DFromScript;
const OverpaintStructureRepresentation3DFromBundle = objects_1.PluginStateTransform.BuiltIn({
    name: 'overpaint-structure-representation-3d-from-bundle',
    display: 'Overpaint 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: param_definition_1.ParamDefinition.ObjectList({
            bundle: param_definition_1.ParamDefinition.Value(structure_1.StructureElement.Bundle.Empty),
            color: param_definition_1.ParamDefinition.Color(names_1.ColorNames.blueviolet),
            clear: param_definition_1.ParamDefinition.Boolean(false)
        }, e => `${e.clear ? 'Clear' : color_1.Color.toRgbString(e.color)}`, {
            defaultValue: [{
                    bundle: structure_1.StructureElement.Bundle.Empty,
                    color: names_1.ColorNames.blueviolet,
                    clear: false
                }],
            isHidden: true
        }),
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const geometryVersion = a.data.repr.geometryVersion;
        const overpaint = overpaint_1.Overpaint.ofBundle(params.layers, structure);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { overpaint },
            initialState: { overpaint: overpaint_1.Overpaint.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Overpaint (${overpaint.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && (0, base_1.hasColorSmoothingProp)(a.data.repr.props))
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const oldOverpaint = b.data.state.overpaint;
        const newOverpaint = overpaint_1.Overpaint.ofBundle(newParams.layers, newStructure);
        if (overpaint_1.Overpaint.areEqual(oldOverpaint, newOverpaint))
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.overpaint = newOverpaint;
        b.data.repr = a.data.repr;
        b.label = `Overpaint (${newOverpaint.layers.length} Layers)`;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.OverpaintStructureRepresentation3DFromBundle = OverpaintStructureRepresentation3DFromBundle;
const TransparencyStructureRepresentation3DFromScript = objects_1.PluginStateTransform.BuiltIn({
    name: 'transparency-structure-representation-3d-from-script',
    display: 'Transparency 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: param_definition_1.ParamDefinition.ObjectList({
            script: param_definition_1.ParamDefinition.Script((0, script_1.Script)('(sel.atom.all)', 'mol-script')),
            value: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, { label: 'Transparency' }),
        }, e => `Transparency (${e.value})`, {
            defaultValue: [{
                    script: (0, script_1.Script)('(sel.atom.all)', 'mol-script'),
                    value: 0.5,
                }]
        })
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const geometryVersion = a.data.repr.geometryVersion;
        const transparency = transparency_1.Transparency.ofScript(params.layers, structure);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { transparency },
            initialState: { transparency: transparency_1.Transparency.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Transparency (${transparency.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && (0, base_1.hasColorSmoothingProp)(a.data.repr.props))
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const oldTransparency = b.data.state.transparency;
        const newTransparency = transparency_1.Transparency.ofScript(newParams.layers, newStructure);
        if (transparency_1.Transparency.areEqual(oldTransparency, newTransparency))
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.transparency = newTransparency;
        b.data.repr = a.data.repr;
        b.label = `Transparency (${newTransparency.layers.length} Layers)`;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.TransparencyStructureRepresentation3DFromScript = TransparencyStructureRepresentation3DFromScript;
const TransparencyStructureRepresentation3DFromBundle = objects_1.PluginStateTransform.BuiltIn({
    name: 'transparency-structure-representation-3d-from-bundle',
    display: 'Transparency 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: param_definition_1.ParamDefinition.ObjectList({
            bundle: param_definition_1.ParamDefinition.Value(structure_1.StructureElement.Bundle.Empty),
            value: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, { label: 'Transparency' }),
        }, e => `Transparency (${e.value})`, {
            defaultValue: [{
                    bundle: structure_1.StructureElement.Bundle.Empty,
                    value: 0.5,
                }],
            isHidden: true
        })
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const geometryVersion = a.data.repr.geometryVersion;
        const transparency = transparency_1.Transparency.ofBundle(params.layers, structure);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { transparency },
            initialState: { transparency: transparency_1.Transparency.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Transparency (${transparency.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && (0, base_1.hasColorSmoothingProp)(a.data.repr.props))
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const oldTransparency = b.data.state.transparency;
        const newTransparency = transparency_1.Transparency.ofBundle(newParams.layers, newStructure);
        if (transparency_1.Transparency.areEqual(oldTransparency, newTransparency))
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.transparency = newTransparency;
        b.data.repr = a.data.repr;
        b.label = `Transparency (${newTransparency.layers.length} Layers)`;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.TransparencyStructureRepresentation3DFromBundle = TransparencyStructureRepresentation3DFromBundle;
const EmissiveStructureRepresentation3DFromScript = objects_1.PluginStateTransform.BuiltIn({
    name: 'emissive-structure-representation-3d-from-script',
    display: 'Emissive 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: param_definition_1.ParamDefinition.ObjectList({
            script: param_definition_1.ParamDefinition.Script((0, script_1.Script)('(sel.atom.all)', 'mol-script')),
            value: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, { label: 'Emissive' }),
        }, e => `Emissive (${e.value})`, {
            defaultValue: [{
                    script: (0, script_1.Script)('(sel.atom.all)', 'mol-script'),
                    value: 0.5,
                }]
        })
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const geometryVersion = a.data.repr.geometryVersion;
        const emissive = emissive_1.Emissive.ofScript(params.layers, structure);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { emissive },
            initialState: { emissive: emissive_1.Emissive.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Emissive (${emissive.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && (0, base_1.hasColorSmoothingProp)(a.data.repr.props))
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const oldEmissive = b.data.state.emissive;
        const newEmissive = emissive_1.Emissive.ofScript(newParams.layers, newStructure);
        if (emissive_1.Emissive.areEqual(oldEmissive, newEmissive))
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.emissive = newEmissive;
        b.data.repr = a.data.repr;
        b.label = `Emissive (${newEmissive.layers.length} Layers)`;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.EmissiveStructureRepresentation3DFromScript = EmissiveStructureRepresentation3DFromScript;
const EmissiveStructureRepresentation3DFromBundle = objects_1.PluginStateTransform.BuiltIn({
    name: 'emissive-structure-representation-3d-from-bundle',
    display: 'Emissive 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: param_definition_1.ParamDefinition.ObjectList({
            bundle: param_definition_1.ParamDefinition.Value(structure_1.StructureElement.Bundle.Empty),
            value: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, { label: 'Emissive' }),
        }, e => `Emissive (${e.value})`, {
            defaultValue: [{
                    bundle: structure_1.StructureElement.Bundle.Empty,
                    value: 0.5,
                }],
            isHidden: true
        })
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const geometryVersion = a.data.repr.geometryVersion;
        const emissive = emissive_1.Emissive.ofBundle(params.layers, structure);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { emissive },
            initialState: { emissive: emissive_1.Emissive.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Emissive (${emissive.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && (0, base_1.hasColorSmoothingProp)(a.data.repr.props))
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const oldEmissive = b.data.state.emissive;
        const newEmissive = emissive_1.Emissive.ofBundle(newParams.layers, newStructure);
        if (emissive_1.Emissive.areEqual(oldEmissive, newEmissive))
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.emissive = newEmissive;
        b.data.repr = a.data.repr;
        b.label = `Emissive (${newEmissive.layers.length} Layers)`;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.EmissiveStructureRepresentation3DFromBundle = EmissiveStructureRepresentation3DFromBundle;
const SubstanceStructureRepresentation3DFromScript = objects_1.PluginStateTransform.BuiltIn({
    name: 'substance-structure-representation-3d-from-script',
    display: 'Substance 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: param_definition_1.ParamDefinition.ObjectList({
            script: param_definition_1.ParamDefinition.Script((0, script_1.Script)('(sel.atom.all)', 'mol-script')),
            material: material_1.Material.getParam(),
            clear: param_definition_1.ParamDefinition.Boolean(false)
        }, e => `${e.clear ? 'Clear' : material_1.Material.toString(e.material)}`, {
            defaultValue: [{
                    script: (0, script_1.Script)('(sel.atom.all)', 'mol-script'),
                    material: (0, material_1.Material)({ roughness: 1 }),
                    clear: false
                }]
        }),
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const geometryVersion = a.data.repr.geometryVersion;
        const substance = substance_1.Substance.ofScript(params.layers, structure);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { substance },
            initialState: { substance: substance_1.Substance.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Substance (${substance.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && (0, base_1.hasColorSmoothingProp)(a.data.repr.props))
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const oldSubstance = b.data.state.substance;
        const newSubstance = substance_1.Substance.ofScript(newParams.layers, newStructure);
        if (substance_1.Substance.areEqual(oldSubstance, newSubstance))
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.substance = newSubstance;
        b.data.repr = a.data.repr;
        b.label = `Substance (${newSubstance.layers.length} Layers)`;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.SubstanceStructureRepresentation3DFromScript = SubstanceStructureRepresentation3DFromScript;
const SubstanceStructureRepresentation3DFromBundle = objects_1.PluginStateTransform.BuiltIn({
    name: 'substance-structure-representation-3d-from-bundle',
    display: 'Substance 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: param_definition_1.ParamDefinition.ObjectList({
            bundle: param_definition_1.ParamDefinition.Value(structure_1.StructureElement.Bundle.Empty),
            material: material_1.Material.getParam(),
            clear: param_definition_1.ParamDefinition.Boolean(false)
        }, e => `${e.clear ? 'Clear' : material_1.Material.toString(e.material)}`, {
            defaultValue: [{
                    bundle: structure_1.StructureElement.Bundle.Empty,
                    material: (0, material_1.Material)({ roughness: 1 }),
                    clear: false
                }],
            isHidden: true
        }),
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const geometryVersion = a.data.repr.geometryVersion;
        const substance = substance_1.Substance.ofBundle(params.layers, structure);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { substance },
            initialState: { substance: substance_1.Substance.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Substance (${substance.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && (0, base_1.hasColorSmoothingProp)(a.data.repr.props))
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const oldSubstance = b.data.state.substance;
        const newSubstance = substance_1.Substance.ofBundle(newParams.layers, newStructure);
        if (substance_1.Substance.areEqual(oldSubstance, newSubstance))
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.substance = newSubstance;
        b.data.repr = a.data.repr;
        b.label = `Substance (${newSubstance.layers.length} Layers)`;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.SubstanceStructureRepresentation3DFromBundle = SubstanceStructureRepresentation3DFromBundle;
const ClippingStructureRepresentation3DFromScript = objects_1.PluginStateTransform.BuiltIn({
    name: 'clipping-structure-representation-3d-from-script',
    display: 'Clipping 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: param_definition_1.ParamDefinition.ObjectList({
            script: param_definition_1.ParamDefinition.Script((0, script_1.Script)('(sel.atom.all)', 'mol-script')),
            groups: param_definition_1.ParamDefinition.Converted((g) => clipping_1.Clipping.Groups.toNames(g), n => clipping_1.Clipping.Groups.fromNames(n), param_definition_1.ParamDefinition.MultiSelect((0, type_helpers_1.ObjectKeys)(clipping_1.Clipping.Groups.Names), param_definition_1.ParamDefinition.objectToOptions(clipping_1.Clipping.Groups.Names))),
        }, e => `${clipping_1.Clipping.Groups.toNames(e.groups).length} group(s)`, {
            defaultValue: [{
                    script: (0, script_1.Script)('(sel.atom.all)', 'mol-script'),
                    groups: clipping_1.Clipping.Groups.Flag.None,
                }]
        }),
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const clipping = clipping_1.Clipping.ofScript(params.layers, structure);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { clipping },
            initialState: { clipping: clipping_1.Clipping.Empty },
            info: structure,
            repr: a.data.repr
        }, { label: `Clipping (${clipping.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const structure = b.data.info;
        if (a.data.sourceData !== structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const oldClipping = b.data.state.clipping;
        const newClipping = clipping_1.Clipping.ofScript(newParams.layers, structure);
        if (clipping_1.Clipping.areEqual(oldClipping, newClipping))
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        b.data.state.clipping = newClipping;
        b.data.repr = a.data.repr;
        b.label = `Clipping (${newClipping.layers.length} Layers)`;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.ClippingStructureRepresentation3DFromScript = ClippingStructureRepresentation3DFromScript;
const ClippingStructureRepresentation3DFromBundle = objects_1.PluginStateTransform.BuiltIn({
    name: 'clipping-structure-representation-3d-from-bundle',
    display: 'Clipping 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: param_definition_1.ParamDefinition.ObjectList({
            bundle: param_definition_1.ParamDefinition.Value(structure_1.StructureElement.Bundle.Empty),
            groups: param_definition_1.ParamDefinition.Converted((g) => clipping_1.Clipping.Groups.toNames(g), n => clipping_1.Clipping.Groups.fromNames(n), param_definition_1.ParamDefinition.MultiSelect((0, type_helpers_1.ObjectKeys)(clipping_1.Clipping.Groups.Names), param_definition_1.ParamDefinition.objectToOptions(clipping_1.Clipping.Groups.Names))),
        }, e => `${clipping_1.Clipping.Groups.toNames(e.groups).length} group(s)`, {
            defaultValue: [{
                    bundle: structure_1.StructureElement.Bundle.Empty,
                    groups: clipping_1.Clipping.Groups.Flag.None,
                }],
            isHidden: true
        }),
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const clipping = clipping_1.Clipping.ofBundle(params.layers, structure);
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: { clipping },
            initialState: { clipping: clipping_1.Clipping.Empty },
            info: structure,
            repr: a.data.repr
        }, { label: `Clipping (${clipping.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const structure = b.data.info;
        if (a.data.sourceData !== structure)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const oldClipping = b.data.state.clipping;
        const newClipping = clipping_1.Clipping.ofBundle(newParams.layers, structure);
        if (clipping_1.Clipping.areEqual(oldClipping, newClipping))
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        b.data.state.clipping = newClipping;
        b.data.repr = a.data.repr;
        b.label = `Clipping (${newClipping.layers.length} Layers)`;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.ClippingStructureRepresentation3DFromBundle = ClippingStructureRepresentation3DFromBundle;
const ThemeStrengthRepresentation3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'theme-strength-representation-3d',
    display: 'Theme Strength 3D Representation',
    from: objects_1.PluginStateObject.Molecule.Structure.Representation3D,
    to: objects_1.PluginStateObject.Molecule.Structure.Representation3DState,
    params: () => ({
        overpaintStrength: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }),
        transparencyStrength: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }),
        emissiveStrength: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }),
        substanceStrength: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }),
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        return new objects_1.PluginStateObject.Molecule.Structure.Representation3DState({
            state: {
                themeStrength: {
                    overpaint: params.overpaintStrength,
                    transparency: params.transparencyStrength,
                    emissive: params.emissiveStrength,
                    substance: params.substanceStrength
                },
            },
            initialState: {
                themeStrength: { overpaint: 1, transparency: 1, emissive: 1, substance: 1 },
            },
            info: {},
            repr: a.data.repr
        }, { label: 'Theme Strength', description: `${params.overpaintStrength.toFixed(2)}, ${params.transparencyStrength.toFixed(2)}, ${params.emissiveStrength.toFixed(2)}, ${params.substanceStrength.toFixed(2)}` });
    },
    update({ a, b, newParams, oldParams }) {
        var _a, _b, _c, _d;
        if (newParams.overpaintStrength === ((_a = b.data.state.themeStrength) === null || _a === void 0 ? void 0 : _a.overpaint) &&
            newParams.transparencyStrength === ((_b = b.data.state.themeStrength) === null || _b === void 0 ? void 0 : _b.transparency) &&
            newParams.emissiveStrength === ((_c = b.data.state.themeStrength) === null || _c === void 0 ? void 0 : _c.emissive) &&
            newParams.substanceStrength === ((_d = b.data.state.themeStrength) === null || _d === void 0 ? void 0 : _d.substance))
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        b.data.state.themeStrength = {
            overpaint: newParams.overpaintStrength,
            transparency: newParams.transparencyStrength,
            emissive: newParams.emissiveStrength,
            substance: newParams.substanceStrength,
        };
        b.data.repr = a.data.repr;
        b.label = 'Theme Strength';
        b.description = `${newParams.overpaintStrength.toFixed(2)}, ${newParams.transparencyStrength.toFixed(2)}, ${newParams.emissiveStrength.toFixed(2)}, ${newParams.substanceStrength.toFixed(2)}`;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    },
    interpolate(src, tar, t) {
        return {
            overpaintStrength: (0, interpolate_1.lerp)(src.overpaintStrength, tar.overpaintStrength, t),
            transparencyStrength: (0, interpolate_1.lerp)(src.transparencyStrength, tar.transparencyStrength, t),
            emissiveStrength: (0, interpolate_1.lerp)(src.emissiveStrength, tar.emissiveStrength, t),
            substanceStrength: (0, interpolate_1.lerp)(src.substanceStrength, tar.substanceStrength, t),
        };
    }
});
exports.ThemeStrengthRepresentation3D = ThemeStrengthRepresentation3D;
//
var VolumeRepresentation3DHelpers;
(function (VolumeRepresentation3DHelpers) {
    function getDefaultParams(ctx, name, volume, volumeParams, colorName, colorParams, sizeName, sizeParams) {
        const type = ctx.representation.volume.registry.get(name);
        const colorType = ctx.representation.volume.themes.colorThemeRegistry.get(colorName || type.defaultColorTheme.name);
        const sizeType = ctx.representation.volume.themes.sizeThemeRegistry.get(sizeName || type.defaultSizeTheme.name);
        const volumeDefaultParams = param_definition_1.ParamDefinition.getDefaultValues(type.getParams(ctx.representation.volume.themes, volume));
        return ({
            type: { name, params: volumeParams ? { ...volumeDefaultParams, ...volumeParams } : volumeDefaultParams },
            colorTheme: { name: colorType.name, params: colorParams ? { ...colorType.defaultValues, ...colorParams } : colorType.defaultValues },
            sizeTheme: { name: sizeType.name, params: sizeParams ? { ...sizeType.defaultValues, ...sizeParams } : sizeType.defaultValues }
        });
    }
    VolumeRepresentation3DHelpers.getDefaultParams = getDefaultParams;
    function getDefaultParamsStatic(ctx, name, volumeParams, colorName, colorParams, sizeName, sizeParams) {
        const type = ctx.representation.volume.registry.get(name);
        const colorType = ctx.representation.volume.themes.colorThemeRegistry.get(colorName || type.defaultColorTheme.name);
        const sizeType = ctx.representation.volume.themes.sizeThemeRegistry.get(sizeName || type.defaultSizeTheme.name);
        return ({
            type: { name, params: volumeParams ? { ...type.defaultValues, ...volumeParams } : type.defaultValues },
            colorTheme: { name: type.defaultColorTheme.name, params: colorParams ? { ...colorType.defaultValues, ...colorParams } : colorType.defaultValues },
            sizeTheme: { name: type.defaultSizeTheme.name, params: sizeParams ? { ...sizeType.defaultValues, ...sizeParams } : sizeType.defaultValues }
        });
    }
    VolumeRepresentation3DHelpers.getDefaultParamsStatic = getDefaultParamsStatic;
    function getDescription(props) {
        var _a, _b, _c, _d;
        if (props.isoValue) {
            return volume_1.Volume.IsoValue.toString(props.isoValue);
        }
        else if ((_b = (_a = props.renderMode) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.isoValue) {
            return volume_1.Volume.IsoValue.toString((_d = (_c = props.renderMode) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.isoValue);
        }
    }
    VolumeRepresentation3DHelpers.getDescription = getDescription;
})(VolumeRepresentation3DHelpers || (exports.VolumeRepresentation3DHelpers = VolumeRepresentation3DHelpers = {}));
const VolumeRepresentation3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'volume-representation-3d',
    display: '3D Representation',
    from: objects_1.PluginStateObject.Volume.Data,
    to: objects_1.PluginStateObject.Volume.Representation3D,
    params: (a, ctx) => {
        const { registry, themes: themeCtx } = ctx.representation.volume;
        const type = registry.get(registry.default.name);
        if (!a) {
            return {
                type: param_definition_1.ParamDefinition.Mapped(registry.default.name, registry.types, name => param_definition_1.ParamDefinition.Group(registry.get(name).getParams(themeCtx, volume_1.Volume.One))),
                colorTheme: param_definition_1.ParamDefinition.Mapped(type.defaultColorTheme.name, themeCtx.colorThemeRegistry.types, name => param_definition_1.ParamDefinition.Group(themeCtx.colorThemeRegistry.get(name).getParams({ volume: volume_1.Volume.One }))),
                sizeTheme: param_definition_1.ParamDefinition.Mapped(type.defaultSizeTheme.name, themeCtx.sizeThemeRegistry.types, name => param_definition_1.ParamDefinition.Group(themeCtx.sizeThemeRegistry.get(name).getParams({ volume: volume_1.Volume.One })))
            };
        }
        const dataCtx = { volume: a.data };
        return ({
            type: param_definition_1.ParamDefinition.Mapped(registry.default.name, registry.types, name => param_definition_1.ParamDefinition.Group(registry.get(name).getParams(themeCtx, a.data))),
            colorTheme: param_definition_1.ParamDefinition.Mapped(type.defaultColorTheme.name, themeCtx.colorThemeRegistry.getApplicableTypes(dataCtx), name => param_definition_1.ParamDefinition.Group(themeCtx.colorThemeRegistry.get(name).getParams(dataCtx))),
            sizeTheme: param_definition_1.ParamDefinition.Mapped(type.defaultSizeTheme.name, themeCtx.sizeThemeRegistry.getApplicableTypes(dataCtx), name => param_definition_1.ParamDefinition.Group(themeCtx.sizeThemeRegistry.get(name).getParams(dataCtx)))
        });
    }
})({
    canAutoUpdate({ oldParams, newParams }) {
        return oldParams.type.name === newParams.type.name;
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Volume Representation', async (ctx) => {
            var _a;
            const propertyCtx = { runtime: ctx, assetManager: plugin.managers.asset, errorContext: plugin.errorContext };
            const provider = plugin.representation.volume.registry.get(params.type.name);
            if (provider.ensureCustomProperties)
                await provider.ensureCustomProperties.attach(propertyCtx, a.data);
            const repr = provider.factory({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.volume.themes }, provider.getParams);
            repr.setTheme(theme_1.Theme.create(plugin.representation.volume.themes, { volume: a.data, locationKinds: provider.locationKinds }, params));
            const props = params.type.params || {};
            await repr.createOrUpdate(props, a.data).runInContext(ctx);
            return new objects_1.PluginStateObject.Volume.Representation3D({ repr, sourceData: a.data }, { label: provider.label, description: VolumeRepresentation3DHelpers.getDescription(props) });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return mol_task_1.Task.create('Volume Representation', async (ctx) => {
            var _a;
            const oldProvider = plugin.representation.volume.registry.get(oldParams.type.name);
            if (newParams.type.name !== oldParams.type.name) {
                (_a = oldProvider.ensureCustomProperties) === null || _a === void 0 ? void 0 : _a.detach(a.data);
                return mol_state_1.StateTransformer.UpdateResult.Recreate;
            }
            const props = { ...b.data.repr.props, ...newParams.type.params };
            b.data.repr.setTheme(theme_1.Theme.create(plugin.representation.volume.themes, { volume: a.data, locationKinds: oldProvider.locationKinds }, newParams));
            await b.data.repr.createOrUpdate(props, a.data).runInContext(ctx);
            b.data.sourceData = a.data;
            b.description = VolumeRepresentation3DHelpers.getDescription(props);
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    }
});
exports.VolumeRepresentation3D = VolumeRepresentation3D;
const ShapeRepresentation3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'shape-representation-3d',
    display: '3D Representation',
    from: objects_1.PluginStateObject.Shape.Provider,
    to: objects_1.PluginStateObject.Shape.Representation3D,
    params: (a, ctx) => {
        return a ? a.data.params : base_1.BaseGeometry.Params;
    }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Shape Representation', async (ctx) => {
            const props = { ...param_definition_1.ParamDefinition.getDefaultValues(a.data.params), ...params };
            const repr = (0, representation_1.ShapeRepresentation)(a.data.getShape, a.data.geometryUtils);
            await repr.createOrUpdate(props, a.data.data).runInContext(ctx);
            return new objects_1.PluginStateObject.Shape.Representation3D({ repr, sourceData: a.data }, { label: a.data.label });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return mol_task_1.Task.create('Shape Representation', async (ctx) => {
            const props = { ...b.data.repr.props, ...newParams };
            await b.data.repr.createOrUpdate(props, a.data.data).runInContext(ctx);
            b.data.sourceData = a.data;
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    }
});
exports.ShapeRepresentation3D = ShapeRepresentation3D;
const ModelUnitcell3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'model-unitcell-3d',
    display: 'Model Unit Cell',
    from: objects_1.PluginStateObject.Molecule.Model,
    to: objects_1.PluginStateObject.Shape.Representation3D,
    params: () => ({
        ...unitcell_1.UnitcellParams,
    })
})({
    isApplicable: a => !!symmetry_1.ModelSymmetry.Provider.get(a.data),
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Model Unit Cell', async (ctx) => {
            var _a;
            const symmetry = symmetry_1.ModelSymmetry.Provider.get(a.data);
            if (!symmetry)
                return mol_state_1.StateObject.Null;
            const data = (0, unitcell_1.getUnitcellData)(a.data, symmetry, params);
            const repr = (0, unitcell_1.UnitcellRepresentation)({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => unitcell_1.UnitcellParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            return new objects_1.PluginStateObject.Shape.Representation3D({ repr, sourceData: data }, { label: `Unit Cell`, description: symmetry.spacegroup.name });
        });
    },
    update({ a, b, newParams }) {
        return mol_task_1.Task.create('Model Unit Cell', async (ctx) => {
            const symmetry = symmetry_1.ModelSymmetry.Provider.get(a.data);
            if (!symmetry)
                return mol_state_1.StateTransformer.UpdateResult.Null;
            const props = { ...b.data.repr.props, ...newParams };
            const data = (0, unitcell_1.getUnitcellData)(a.data, symmetry, props);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    }
});
exports.ModelUnitcell3D = ModelUnitcell3D;
const StructureBoundingBox3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-bounding-box-3d',
    display: 'Bounding Box',
    from: objects_1.PluginStateObject.Molecule.Structure,
    to: objects_1.PluginStateObject.Shape.Representation3D,
    params: {
        radius: param_definition_1.ParamDefinition.Numeric(0.05, { min: 0.01, max: 4, step: 0.01 }, { isEssential: true }),
        color: param_definition_1.ParamDefinition.Color(names_1.ColorNames.red, { isEssential: true }),
        ...mesh_1.Mesh.Params,
    }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Bounding Box', async (ctx) => {
            const repr = (0, representation_1.ShapeRepresentation)((_, data, __, shape) => {
                const mesh = (0, shape_1.getBoxMesh)(data.box, data.radius, shape === null || shape === void 0 ? void 0 : shape.geometry);
                return shape_2.Shape.create('Bouding Box', data, mesh, () => data.color, () => 1, () => 'Bounding Box');
            }, mesh_1.Mesh.Utils);
            await repr.createOrUpdate(params, { box: a.data.boundary.box, radius: params.radius, color: params.color }).runInContext(ctx);
            return new objects_1.PluginStateObject.Shape.Representation3D({ repr, sourceData: a.data }, { label: `Bounding Box` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return mol_task_1.Task.create('Bounding Box', async (ctx) => {
            await b.data.repr.createOrUpdate(newParams, { box: a.data.boundary.box, radius: newParams.radius, color: newParams.color }).runInContext(ctx);
            b.data.sourceData = a.data;
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    }
});
exports.StructureBoundingBox3D = StructureBoundingBox3D;
const StructureSelectionsDistance3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-selections-distance-3d',
    display: '3D Distance',
    from: objects_1.PluginStateObject.Molecule.Structure.Selections,
    to: objects_1.PluginStateObject.Shape.Representation3D,
    params: () => ({
        ...distance_1.DistanceParams,
    })
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Structure Distance', async (ctx) => {
            var _a;
            const data = (0, helpers_2.getDistanceDataFromStructureSelections)(a.data);
            const repr = (0, distance_1.DistanceRepresentation)({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => distance_1.DistanceParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            return new objects_1.PluginStateObject.Shape.Representation3D({ repr, sourceData: data }, { label: `Distance` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return mol_task_1.Task.create('Structure Distance', async (ctx) => {
            const props = { ...b.data.repr.props, ...newParams };
            const data = (0, helpers_2.getDistanceDataFromStructureSelections)(a.data);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    },
});
exports.StructureSelectionsDistance3D = StructureSelectionsDistance3D;
const StructureSelectionsAngle3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-selections-angle-3d',
    display: '3D Angle',
    from: objects_1.PluginStateObject.Molecule.Structure.Selections,
    to: objects_1.PluginStateObject.Shape.Representation3D,
    params: () => ({
        ...angle_1.AngleParams,
    })
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Structure Angle', async (ctx) => {
            var _a;
            const data = (0, helpers_2.getAngleDataFromStructureSelections)(a.data);
            const repr = (0, angle_1.AngleRepresentation)({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => angle_1.AngleParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            return new objects_1.PluginStateObject.Shape.Representation3D({ repr, sourceData: data }, { label: `Angle` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return mol_task_1.Task.create('Structure Angle', async (ctx) => {
            const props = { ...b.data.repr.props, ...newParams };
            const data = (0, helpers_2.getAngleDataFromStructureSelections)(a.data);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    },
});
exports.StructureSelectionsAngle3D = StructureSelectionsAngle3D;
const StructureSelectionsDihedral3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-selections-dihedral-3d',
    display: '3D Dihedral',
    from: objects_1.PluginStateObject.Molecule.Structure.Selections,
    to: objects_1.PluginStateObject.Shape.Representation3D,
    params: () => ({
        ...dihedral_1.DihedralParams,
    })
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Structure Dihedral', async (ctx) => {
            var _a;
            const data = (0, helpers_2.getDihedralDataFromStructureSelections)(a.data);
            const repr = (0, dihedral_1.DihedralRepresentation)({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => dihedral_1.DihedralParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            return new objects_1.PluginStateObject.Shape.Representation3D({ repr, sourceData: data }, { label: `Dihedral` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return mol_task_1.Task.create('Structure Dihedral', async (ctx) => {
            const props = { ...b.data.repr.props, ...newParams };
            const data = (0, helpers_2.getDihedralDataFromStructureSelections)(a.data);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    },
});
exports.StructureSelectionsDihedral3D = StructureSelectionsDihedral3D;
const StructureSelectionsLabel3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-selections-label-3d',
    display: '3D Label',
    from: objects_1.PluginStateObject.Molecule.Structure.Selections,
    to: objects_1.PluginStateObject.Shape.Representation3D,
    params: () => ({
        ...label_1.LabelParams,
    })
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Structure Label', async (ctx) => {
            var _a, _b, _c;
            const data = (0, helpers_2.getLabelDataFromStructureSelections)(a.data);
            const repr = (0, label_1.LabelRepresentation)({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => label_1.LabelParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            // Support interactivity when needed
            const pickable = !!(((_b = params.snapshotKey) === null || _b === void 0 ? void 0 : _b.trim()) || ((_c = params.tooltip) === null || _c === void 0 ? void 0 : _c.trim()));
            repr.setState({ pickable, markerActions: pickable ? marker_action_1.MarkerActions.Highlighting : marker_action_1.MarkerAction.None });
            return new objects_1.PluginStateObject.Shape.Representation3D({ repr, sourceData: data }, { label: `Label` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return mol_task_1.Task.create('Structure Label', async (ctx) => {
            var _a, _b;
            const props = { ...b.data.repr.props, ...newParams };
            const data = (0, helpers_2.getLabelDataFromStructureSelections)(a.data);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            // Update interactivity
            const pickable = !!(((_a = newParams.snapshotKey) === null || _a === void 0 ? void 0 : _a.trim()) || ((_b = newParams.tooltip) === null || _b === void 0 ? void 0 : _b.trim()));
            b.data.repr.setState({ pickable, markerActions: pickable ? marker_action_1.MarkerActions.Highlighting : marker_action_1.MarkerAction.None });
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    },
});
exports.StructureSelectionsLabel3D = StructureSelectionsLabel3D;
const StructureSelectionsOrientation3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-selections-orientation-3d',
    display: '3D Orientation',
    from: objects_1.PluginStateObject.Molecule.Structure.Selections,
    to: objects_1.PluginStateObject.Shape.Representation3D,
    params: () => ({
        ...orientation_1.OrientationParams,
    })
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Structure Orientation', async (ctx) => {
            var _a;
            const data = (0, helpers_2.getOrientationDataFromStructureSelections)(a.data);
            const repr = (0, orientation_1.OrientationRepresentation)({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => orientation_1.OrientationParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            return new objects_1.PluginStateObject.Shape.Representation3D({ repr, sourceData: data }, { label: `Orientation` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return mol_task_1.Task.create('Structure Orientation', async (ctx) => {
            const props = { ...b.data.repr.props, ...newParams };
            const data = (0, helpers_2.getOrientationDataFromStructureSelections)(a.data);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    },
});
exports.StructureSelectionsOrientation3D = StructureSelectionsOrientation3D;
const StructureSelectionsPlane3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-selections-plane-3d',
    display: '3D Plane',
    from: objects_1.PluginStateObject.Molecule.Structure.Selections,
    to: objects_1.PluginStateObject.Shape.Representation3D,
    params: () => ({
        ...plane_1.PlaneParams,
    })
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Structure Plane', async (ctx) => {
            var _a;
            const data = (0, helpers_2.getPlaneDataFromStructureSelections)(a.data);
            const repr = (0, plane_1.PlaneRepresentation)({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => plane_1.PlaneParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            return new objects_1.PluginStateObject.Shape.Representation3D({ repr, sourceData: data }, { label: `Plane` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return mol_task_1.Task.create('Structure Plane', async (ctx) => {
            const props = { ...b.data.repr.props, ...newParams };
            const data = (0, helpers_2.getPlaneDataFromStructureSelections)(a.data);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    },
});
exports.StructureSelectionsPlane3D = StructureSelectionsPlane3D;
