/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure, StructureElement } from '../../mol-model/structure';
import { Volume } from '../../mol-model/volume';
import { StateTransformer, StateObject } from '../../mol-state';
import { Task } from '../../mol-task';
import { Theme } from '../../mol-theme/theme';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginStateObject as SO, PluginStateTransform } from '../objects';
import { ColorNames } from '../../mol-util/color/names';
import { ShapeRepresentation } from '../../mol-repr/shape/representation';
import { StructureUnitTransforms } from '../../mol-model/structure/structure/util/unit-transforms';
import { unwindStructureAssembly, explodeStructure, spinStructure, SpinStructureParams, getSpinStructureAxisAndOrigin } from '../animation/helpers';
import { Color } from '../../mol-util/color';
import { Overpaint } from '../../mol-theme/overpaint';
import { Transparency } from '../../mol-theme/transparency';
import { BaseGeometry, hasColorSmoothingProp } from '../../mol-geo/geometry/base';
import { Script } from '../../mol-script/script';
import { UnitcellParams, UnitcellRepresentation, getUnitcellData } from '../../mol-repr/shape/model/unitcell';
import { DistanceParams, DistanceRepresentation } from '../../mol-repr/shape/loci/distance';
import { getDistanceDataFromStructureSelections, getLabelDataFromStructureSelections, getOrientationDataFromStructureSelections, getAngleDataFromStructureSelections, getDihedralDataFromStructureSelections, getPlaneDataFromStructureSelections } from './helpers';
import { LabelParams, LabelRepresentation } from '../../mol-repr/shape/loci/label';
import { OrientationRepresentation, OrientationParams } from '../../mol-repr/shape/loci/orientation';
import { AngleParams, AngleRepresentation } from '../../mol-repr/shape/loci/angle';
import { DihedralParams, DihedralRepresentation } from '../../mol-repr/shape/loci/dihedral';
import { ModelSymmetry } from '../../mol-model-formats/structure/property/symmetry';
import { Clipping } from '../../mol-theme/clipping';
import { ObjectKeys } from '../../mol-util/type-helpers';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { getBoxMesh } from './shape';
import { Shape } from '../../mol-model/shape';
import { PlaneParams, PlaneRepresentation } from '../../mol-repr/shape/loci/plane';
import { Substance } from '../../mol-theme/substance';
import { Material } from '../../mol-util/material';
import { lerp } from '../../mol-math/interpolate';
import { MarkerAction, MarkerActions } from '../../mol-util/marker-action';
import { Emissive } from '../../mol-theme/emissive';
export { StructureRepresentation3D };
export { ExplodeStructureRepresentation3D };
export { SpinStructureRepresentation3D };
export { UnwindStructureAssemblyRepresentation3D };
export { OverpaintStructureRepresentation3DFromScript };
export { OverpaintStructureRepresentation3DFromBundle };
export { TransparencyStructureRepresentation3DFromScript };
export { TransparencyStructureRepresentation3DFromBundle };
export { EmissiveStructureRepresentation3DFromScript };
export { EmissiveStructureRepresentation3DFromBundle };
export { SubstanceStructureRepresentation3DFromScript };
export { SubstanceStructureRepresentation3DFromBundle };
export { ClippingStructureRepresentation3DFromScript };
export { ClippingStructureRepresentation3DFromBundle };
export { ThemeStrengthRepresentation3D };
export { VolumeRepresentation3D };
const StructureRepresentation3D = PluginStateTransform.BuiltIn({
    name: 'structure-representation-3d',
    display: '3D Representation',
    from: SO.Molecule.Structure,
    to: SO.Molecule.Structure.Representation3D,
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
                type: PD.Mapped(registry.default.name, registry.types, name => PD.Group(registry.get(name).getParams(themeCtx, Structure.Empty))),
                colorTheme: PD.Mapped(type.defaultColorTheme.name, themeCtx.colorThemeRegistry.types, name => PD.Group(themeCtx.colorThemeRegistry.get(name).getParams({ structure: Structure.Empty })), colorThemeInfo),
                sizeTheme: PD.Mapped(type.defaultSizeTheme.name, themeCtx.sizeThemeRegistry.types, name => PD.Group(themeCtx.sizeThemeRegistry.get(name).getParams({ structure: Structure.Empty })))
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
            type: PD.Mapped(registry.default.name, registry.getApplicableTypes(a.data), name => PD.Group(registry.get(name).getParams(themeCtx, a.data))),
            colorTheme: PD.Mapped(type.defaultColorTheme.name, themeCtx.colorThemeRegistry.getApplicableTypes(dataCtx), name => PD.Group(themeCtx.colorThemeRegistry.get(name).getParams(dataCtx)), colorThemeInfo),
            sizeTheme: PD.Mapped(type.defaultSizeTheme.name, themeCtx.sizeThemeRegistry.getApplicableTypes(dataCtx), name => PD.Group(themeCtx.sizeThemeRegistry.get(name).getParams(dataCtx)))
        });
    }
})({
    canAutoUpdate({ a, oldParams, newParams }) {
        // TODO: other criteria as well?
        return a.data.elementCount < 10000 || (oldParams.type.name === newParams.type.name && newParams.type.params.quality !== 'custom');
    },
    apply({ a, params, cache }, plugin) {
        return Task.create('Structure Representation', async (ctx) => {
            var _a, _b;
            const propertyCtx = { runtime: ctx, assetManager: plugin.managers.asset, errorContext: plugin.errorContext };
            const provider = plugin.representation.structure.registry.get(params.type.name);
            const data = ((_a = provider.getData) === null || _a === void 0 ? void 0 : _a.call(provider, a.data, params.type.params)) || a.data;
            if (provider.ensureCustomProperties)
                await provider.ensureCustomProperties.attach(propertyCtx, data);
            const repr = provider.factory({ webgl: (_b = plugin.canvas3d) === null || _b === void 0 ? void 0 : _b.webgl, ...plugin.representation.structure.themes }, provider.getParams);
            await Theme.ensureDependencies(propertyCtx, plugin.representation.structure.themes, { structure: data }, params);
            repr.setTheme(Theme.create(plugin.representation.structure.themes, { structure: data }, params));
            const props = params.type.params || {};
            await repr.createOrUpdate(props, data).runInContext(ctx);
            return new SO.Molecule.Structure.Representation3D({ repr, sourceData: a.data }, { label: provider.label });
        });
    },
    update({ a, b, oldParams, newParams, cache }, plugin) {
        return Task.create('Structure Representation', async (ctx) => {
            var _a, _b;
            if (newParams.type.name !== oldParams.type.name)
                return StateTransformer.UpdateResult.Recreate;
            const provider = plugin.representation.structure.registry.get(newParams.type.name);
            if ((_a = provider.mustRecreate) === null || _a === void 0 ? void 0 : _a.call(provider, oldParams.type.params, newParams.type.params))
                return StateTransformer.UpdateResult.Recreate;
            const data = ((_b = provider.getData) === null || _b === void 0 ? void 0 : _b.call(provider, a.data, newParams.type.params)) || a.data;
            const propertyCtx = { runtime: ctx, assetManager: plugin.managers.asset, errorContext: plugin.errorContext };
            if (provider.ensureCustomProperties)
                await provider.ensureCustomProperties.attach(propertyCtx, data);
            // TODO: if themes had a .needsUpdate method the following block could
            //       be optimized and only executed conditionally
            Theme.releaseDependencies(plugin.representation.structure.themes, { structure: b.data.sourceData }, oldParams);
            await Theme.ensureDependencies(propertyCtx, plugin.representation.structure.themes, { structure: data }, newParams);
            b.data.repr.setTheme(Theme.create(plugin.representation.structure.themes, { structure: data }, newParams));
            const props = { ...b.data.repr.props, ...newParams.type.params };
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = a.data;
            return StateTransformer.UpdateResult.Updated;
        });
    },
    dispose({ b, params }, plugin) {
        if (!b || !params)
            return;
        const structure = b.data.sourceData;
        const provider = plugin.representation.structure.registry.get(params.type.name);
        if (provider.ensureCustomProperties)
            provider.ensureCustomProperties.detach(structure);
        Theme.releaseDependencies(plugin.representation.structure.themes, { structure }, params);
    },
    interpolate(src, tar, t) {
        if (src.colorTheme.name !== 'uniform' || tar.colorTheme.name !== 'uniform') {
            return t <= 0.5 ? src : tar;
        }
        const from = src.colorTheme.params.value, to = tar.colorTheme.params.value;
        const value = Color.interpolate(from, to, t);
        return {
            type: t <= 0.5 ? src.type : tar.type,
            colorTheme: { name: 'uniform', params: { value } },
            sizeTheme: t <= 0.5 ? src.sizeTheme : tar.sizeTheme,
        };
    }
});
const UnwindStructureAssemblyRepresentation3D = PluginStateTransform.BuiltIn({
    name: 'unwind-structure-assembly-representation-3d',
    display: 'Unwind Assembly 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: { t: PD.Numeric(0, { min: 0, max: 1, step: 0.01 }) }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const unitTransforms = new StructureUnitTransforms(structure);
        unwindStructureAssembly(structure, unitTransforms, params.t);
        return new SO.Molecule.Structure.Representation3DState({
            state: { unitTransforms },
            initialState: { unitTransforms: new StructureUnitTransforms(structure) },
            info: structure,
            repr: a.data.repr
        }, { label: `Unwind T = ${params.t.toFixed(2)}` });
    },
    update({ a, b, newParams, oldParams }) {
        const structure = b.data.info;
        if (a.data.sourceData !== structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        if (oldParams.t === newParams.t)
            return StateTransformer.UpdateResult.Unchanged;
        const unitTransforms = b.data.state.unitTransforms;
        unwindStructureAssembly(structure, unitTransforms, newParams.t);
        b.label = `Unwind T = ${newParams.t.toFixed(2)}`;
        b.data.repr = a.data.repr;
        return StateTransformer.UpdateResult.Updated;
    }
});
const ExplodeStructureRepresentation3D = PluginStateTransform.BuiltIn({
    name: 'explode-structure-representation-3d',
    display: 'Explode 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: { t: PD.Numeric(0, { min: 0, max: 1, step: 0.01 }) }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const unitTransforms = new StructureUnitTransforms(structure);
        explodeStructure(structure, unitTransforms, params.t, structure.root.boundary.sphere);
        return new SO.Molecule.Structure.Representation3DState({
            state: { unitTransforms },
            initialState: { unitTransforms: new StructureUnitTransforms(structure) },
            info: structure,
            repr: a.data.repr
        }, { label: `Explode T = ${params.t.toFixed(2)}` });
    },
    update({ a, b, newParams, oldParams }) {
        const structure = a.data.sourceData;
        if (b.data.info !== structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        if (oldParams.t === newParams.t)
            return StateTransformer.UpdateResult.Unchanged;
        const unitTransforms = b.data.state.unitTransforms;
        explodeStructure(structure, unitTransforms, newParams.t, structure.root.boundary.sphere);
        b.label = `Explode T = ${newParams.t.toFixed(2)}`;
        b.data.repr = a.data.repr;
        return StateTransformer.UpdateResult.Updated;
    }
});
const SpinStructureRepresentation3D = PluginStateTransform.BuiltIn({
    name: 'spin-structure-representation-3d',
    display: 'Spin 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: {
        t: PD.Numeric(0, { min: 0, max: 1, step: 0.01 }),
        ...SpinStructureParams
    }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const unitTransforms = new StructureUnitTransforms(structure);
        const { axis, origin } = getSpinStructureAxisAndOrigin(structure.root, params);
        spinStructure(structure, unitTransforms, params.t, axis, origin);
        return new SO.Molecule.Structure.Representation3DState({
            state: { unitTransforms },
            initialState: { unitTransforms: new StructureUnitTransforms(structure) },
            info: structure,
            repr: a.data.repr
        }, { label: `Spin T = ${params.t.toFixed(2)}` });
    },
    update({ a, b, newParams, oldParams }) {
        const structure = a.data.sourceData;
        if (b.data.info !== structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        if (oldParams.t === newParams.t && oldParams.axis === newParams.axis && oldParams.origin === newParams.origin)
            return StateTransformer.UpdateResult.Unchanged;
        const unitTransforms = b.data.state.unitTransforms;
        const { axis, origin } = getSpinStructureAxisAndOrigin(structure.root, newParams);
        spinStructure(structure, unitTransforms, newParams.t, axis, origin);
        b.label = `Spin T = ${newParams.t.toFixed(2)}`;
        b.data.repr = a.data.repr;
        return StateTransformer.UpdateResult.Updated;
    }
});
const OverpaintStructureRepresentation3DFromScript = PluginStateTransform.BuiltIn({
    name: 'overpaint-structure-representation-3d-from-script',
    display: 'Overpaint 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: PD.ObjectList({
            script: PD.Script(Script('(sel.atom.all)', 'mol-script')),
            color: PD.Color(ColorNames.blueviolet),
            clear: PD.Boolean(false)
        }, e => `${e.clear ? 'Clear' : Color.toRgbString(e.color)}`, {
            defaultValue: [{
                    script: Script('(sel.atom.all)', 'mol-script'),
                    color: ColorNames.blueviolet,
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
        const overpaint = Overpaint.ofScript(params.layers, structure);
        return new SO.Molecule.Structure.Representation3DState({
            state: { overpaint },
            initialState: { overpaint: Overpaint.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Overpaint (${overpaint.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && hasColorSmoothingProp(a.data.repr.props))
            return StateTransformer.UpdateResult.Recreate;
        const oldOverpaint = b.data.state.overpaint;
        const newOverpaint = Overpaint.ofScript(newParams.layers, newStructure);
        if (Overpaint.areEqual(oldOverpaint, newOverpaint))
            return StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.overpaint = newOverpaint;
        b.data.repr = a.data.repr;
        b.label = `Overpaint (${newOverpaint.layers.length} Layers)`;
        return StateTransformer.UpdateResult.Updated;
    }
});
const OverpaintStructureRepresentation3DFromBundle = PluginStateTransform.BuiltIn({
    name: 'overpaint-structure-representation-3d-from-bundle',
    display: 'Overpaint 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: PD.ObjectList({
            bundle: PD.Value(StructureElement.Bundle.Empty),
            color: PD.Color(ColorNames.blueviolet),
            clear: PD.Boolean(false)
        }, e => `${e.clear ? 'Clear' : Color.toRgbString(e.color)}`, {
            defaultValue: [{
                    bundle: StructureElement.Bundle.Empty,
                    color: ColorNames.blueviolet,
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
        const overpaint = Overpaint.ofBundle(params.layers, structure);
        return new SO.Molecule.Structure.Representation3DState({
            state: { overpaint },
            initialState: { overpaint: Overpaint.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Overpaint (${overpaint.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && hasColorSmoothingProp(a.data.repr.props))
            return StateTransformer.UpdateResult.Recreate;
        const oldOverpaint = b.data.state.overpaint;
        const newOverpaint = Overpaint.ofBundle(newParams.layers, newStructure);
        if (Overpaint.areEqual(oldOverpaint, newOverpaint))
            return StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.overpaint = newOverpaint;
        b.data.repr = a.data.repr;
        b.label = `Overpaint (${newOverpaint.layers.length} Layers)`;
        return StateTransformer.UpdateResult.Updated;
    }
});
const TransparencyStructureRepresentation3DFromScript = PluginStateTransform.BuiltIn({
    name: 'transparency-structure-representation-3d-from-script',
    display: 'Transparency 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: PD.ObjectList({
            script: PD.Script(Script('(sel.atom.all)', 'mol-script')),
            value: PD.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, { label: 'Transparency' }),
        }, e => `Transparency (${e.value})`, {
            defaultValue: [{
                    script: Script('(sel.atom.all)', 'mol-script'),
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
        const transparency = Transparency.ofScript(params.layers, structure);
        return new SO.Molecule.Structure.Representation3DState({
            state: { transparency },
            initialState: { transparency: Transparency.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Transparency (${transparency.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && hasColorSmoothingProp(a.data.repr.props))
            return StateTransformer.UpdateResult.Recreate;
        const oldTransparency = b.data.state.transparency;
        const newTransparency = Transparency.ofScript(newParams.layers, newStructure);
        if (Transparency.areEqual(oldTransparency, newTransparency))
            return StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.transparency = newTransparency;
        b.data.repr = a.data.repr;
        b.label = `Transparency (${newTransparency.layers.length} Layers)`;
        return StateTransformer.UpdateResult.Updated;
    }
});
const TransparencyStructureRepresentation3DFromBundle = PluginStateTransform.BuiltIn({
    name: 'transparency-structure-representation-3d-from-bundle',
    display: 'Transparency 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: PD.ObjectList({
            bundle: PD.Value(StructureElement.Bundle.Empty),
            value: PD.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, { label: 'Transparency' }),
        }, e => `Transparency (${e.value})`, {
            defaultValue: [{
                    bundle: StructureElement.Bundle.Empty,
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
        const transparency = Transparency.ofBundle(params.layers, structure);
        return new SO.Molecule.Structure.Representation3DState({
            state: { transparency },
            initialState: { transparency: Transparency.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Transparency (${transparency.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && hasColorSmoothingProp(a.data.repr.props))
            return StateTransformer.UpdateResult.Recreate;
        const oldTransparency = b.data.state.transparency;
        const newTransparency = Transparency.ofBundle(newParams.layers, newStructure);
        if (Transparency.areEqual(oldTransparency, newTransparency))
            return StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.transparency = newTransparency;
        b.data.repr = a.data.repr;
        b.label = `Transparency (${newTransparency.layers.length} Layers)`;
        return StateTransformer.UpdateResult.Updated;
    }
});
const EmissiveStructureRepresentation3DFromScript = PluginStateTransform.BuiltIn({
    name: 'emissive-structure-representation-3d-from-script',
    display: 'Emissive 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: PD.ObjectList({
            script: PD.Script(Script('(sel.atom.all)', 'mol-script')),
            value: PD.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, { label: 'Emissive' }),
        }, e => `Emissive (${e.value})`, {
            defaultValue: [{
                    script: Script('(sel.atom.all)', 'mol-script'),
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
        const emissive = Emissive.ofScript(params.layers, structure);
        return new SO.Molecule.Structure.Representation3DState({
            state: { emissive },
            initialState: { emissive: Emissive.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Emissive (${emissive.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && hasColorSmoothingProp(a.data.repr.props))
            return StateTransformer.UpdateResult.Recreate;
        const oldEmissive = b.data.state.emissive;
        const newEmissive = Emissive.ofScript(newParams.layers, newStructure);
        if (Emissive.areEqual(oldEmissive, newEmissive))
            return StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.emissive = newEmissive;
        b.data.repr = a.data.repr;
        b.label = `Emissive (${newEmissive.layers.length} Layers)`;
        return StateTransformer.UpdateResult.Updated;
    }
});
const EmissiveStructureRepresentation3DFromBundle = PluginStateTransform.BuiltIn({
    name: 'emissive-structure-representation-3d-from-bundle',
    display: 'Emissive 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: PD.ObjectList({
            bundle: PD.Value(StructureElement.Bundle.Empty),
            value: PD.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, { label: 'Emissive' }),
        }, e => `Emissive (${e.value})`, {
            defaultValue: [{
                    bundle: StructureElement.Bundle.Empty,
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
        const emissive = Emissive.ofBundle(params.layers, structure);
        return new SO.Molecule.Structure.Representation3DState({
            state: { emissive },
            initialState: { emissive: Emissive.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Emissive (${emissive.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && hasColorSmoothingProp(a.data.repr.props))
            return StateTransformer.UpdateResult.Recreate;
        const oldEmissive = b.data.state.emissive;
        const newEmissive = Emissive.ofBundle(newParams.layers, newStructure);
        if (Emissive.areEqual(oldEmissive, newEmissive))
            return StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.emissive = newEmissive;
        b.data.repr = a.data.repr;
        b.label = `Emissive (${newEmissive.layers.length} Layers)`;
        return StateTransformer.UpdateResult.Updated;
    }
});
const SubstanceStructureRepresentation3DFromScript = PluginStateTransform.BuiltIn({
    name: 'substance-structure-representation-3d-from-script',
    display: 'Substance 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: PD.ObjectList({
            script: PD.Script(Script('(sel.atom.all)', 'mol-script')),
            material: Material.getParam(),
            clear: PD.Boolean(false)
        }, e => `${e.clear ? 'Clear' : Material.toString(e.material)}`, {
            defaultValue: [{
                    script: Script('(sel.atom.all)', 'mol-script'),
                    material: Material({ roughness: 1 }),
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
        const substance = Substance.ofScript(params.layers, structure);
        return new SO.Molecule.Structure.Representation3DState({
            state: { substance },
            initialState: { substance: Substance.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Substance (${substance.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && hasColorSmoothingProp(a.data.repr.props))
            return StateTransformer.UpdateResult.Recreate;
        const oldSubstance = b.data.state.substance;
        const newSubstance = Substance.ofScript(newParams.layers, newStructure);
        if (Substance.areEqual(oldSubstance, newSubstance))
            return StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.substance = newSubstance;
        b.data.repr = a.data.repr;
        b.label = `Substance (${newSubstance.layers.length} Layers)`;
        return StateTransformer.UpdateResult.Updated;
    }
});
const SubstanceStructureRepresentation3DFromBundle = PluginStateTransform.BuiltIn({
    name: 'substance-structure-representation-3d-from-bundle',
    display: 'Substance 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: PD.ObjectList({
            bundle: PD.Value(StructureElement.Bundle.Empty),
            material: Material.getParam(),
            clear: PD.Boolean(false)
        }, e => `${e.clear ? 'Clear' : Material.toString(e.material)}`, {
            defaultValue: [{
                    bundle: StructureElement.Bundle.Empty,
                    material: Material({ roughness: 1 }),
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
        const substance = Substance.ofBundle(params.layers, structure);
        return new SO.Molecule.Structure.Representation3DState({
            state: { substance },
            initialState: { substance: Substance.Empty },
            info: { structure, geometryVersion },
            repr: a.data.repr
        }, { label: `Substance (${substance.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const info = b.data.info;
        const newStructure = a.data.sourceData;
        if (newStructure !== info.structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        const newGeometryVersion = a.data.repr.geometryVersion;
        // smoothing needs to be re-calculated when geometry changes
        if (newGeometryVersion !== info.geometryVersion && hasColorSmoothingProp(a.data.repr.props))
            return StateTransformer.UpdateResult.Recreate;
        const oldSubstance = b.data.state.substance;
        const newSubstance = Substance.ofBundle(newParams.layers, newStructure);
        if (Substance.areEqual(oldSubstance, newSubstance))
            return StateTransformer.UpdateResult.Unchanged;
        info.geometryVersion = newGeometryVersion;
        b.data.state.substance = newSubstance;
        b.data.repr = a.data.repr;
        b.label = `Substance (${newSubstance.layers.length} Layers)`;
        return StateTransformer.UpdateResult.Updated;
    }
});
const ClippingStructureRepresentation3DFromScript = PluginStateTransform.BuiltIn({
    name: 'clipping-structure-representation-3d-from-script',
    display: 'Clipping 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: PD.ObjectList({
            script: PD.Script(Script('(sel.atom.all)', 'mol-script')),
            groups: PD.Converted((g) => Clipping.Groups.toNames(g), n => Clipping.Groups.fromNames(n), PD.MultiSelect(ObjectKeys(Clipping.Groups.Names), PD.objectToOptions(Clipping.Groups.Names))),
        }, e => `${Clipping.Groups.toNames(e.groups).length} group(s)`, {
            defaultValue: [{
                    script: Script('(sel.atom.all)', 'mol-script'),
                    groups: Clipping.Groups.Flag.None,
                }]
        }),
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        const structure = a.data.sourceData;
        const clipping = Clipping.ofScript(params.layers, structure);
        return new SO.Molecule.Structure.Representation3DState({
            state: { clipping },
            initialState: { clipping: Clipping.Empty },
            info: structure,
            repr: a.data.repr
        }, { label: `Clipping (${clipping.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const structure = b.data.info;
        if (a.data.sourceData !== structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        const oldClipping = b.data.state.clipping;
        const newClipping = Clipping.ofScript(newParams.layers, structure);
        if (Clipping.areEqual(oldClipping, newClipping))
            return StateTransformer.UpdateResult.Unchanged;
        b.data.state.clipping = newClipping;
        b.data.repr = a.data.repr;
        b.label = `Clipping (${newClipping.layers.length} Layers)`;
        return StateTransformer.UpdateResult.Updated;
    }
});
const ClippingStructureRepresentation3DFromBundle = PluginStateTransform.BuiltIn({
    name: 'clipping-structure-representation-3d-from-bundle',
    display: 'Clipping 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: () => ({
        layers: PD.ObjectList({
            bundle: PD.Value(StructureElement.Bundle.Empty),
            groups: PD.Converted((g) => Clipping.Groups.toNames(g), n => Clipping.Groups.fromNames(n), PD.MultiSelect(ObjectKeys(Clipping.Groups.Names), PD.objectToOptions(Clipping.Groups.Names))),
        }, e => `${Clipping.Groups.toNames(e.groups).length} group(s)`, {
            defaultValue: [{
                    bundle: StructureElement.Bundle.Empty,
                    groups: Clipping.Groups.Flag.None,
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
        const clipping = Clipping.ofBundle(params.layers, structure);
        return new SO.Molecule.Structure.Representation3DState({
            state: { clipping },
            initialState: { clipping: Clipping.Empty },
            info: structure,
            repr: a.data.repr
        }, { label: `Clipping (${clipping.layers.length} Layers)` });
    },
    update({ a, b, newParams, oldParams }) {
        const structure = b.data.info;
        if (a.data.sourceData !== structure)
            return StateTransformer.UpdateResult.Recreate;
        if (a.data.repr !== b.data.repr)
            return StateTransformer.UpdateResult.Recreate;
        const oldClipping = b.data.state.clipping;
        const newClipping = Clipping.ofBundle(newParams.layers, structure);
        if (Clipping.areEqual(oldClipping, newClipping))
            return StateTransformer.UpdateResult.Unchanged;
        b.data.state.clipping = newClipping;
        b.data.repr = a.data.repr;
        b.label = `Clipping (${newClipping.layers.length} Layers)`;
        return StateTransformer.UpdateResult.Updated;
    }
});
const ThemeStrengthRepresentation3D = PluginStateTransform.BuiltIn({
    name: 'theme-strength-representation-3d',
    display: 'Theme Strength 3D Representation',
    from: SO.Molecule.Structure.Representation3D,
    to: SO.Molecule.Structure.Representation3DState,
    params: () => ({
        overpaintStrength: PD.Numeric(1, { min: 0, max: 1, step: 0.01 }),
        transparencyStrength: PD.Numeric(1, { min: 0, max: 1, step: 0.01 }),
        emissiveStrength: PD.Numeric(1, { min: 0, max: 1, step: 0.01 }),
        substanceStrength: PD.Numeric(1, { min: 0, max: 1, step: 0.01 }),
    })
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }) {
        return new SO.Molecule.Structure.Representation3DState({
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
            return StateTransformer.UpdateResult.Unchanged;
        b.data.state.themeStrength = {
            overpaint: newParams.overpaintStrength,
            transparency: newParams.transparencyStrength,
            emissive: newParams.emissiveStrength,
            substance: newParams.substanceStrength,
        };
        b.data.repr = a.data.repr;
        b.label = 'Theme Strength';
        b.description = `${newParams.overpaintStrength.toFixed(2)}, ${newParams.transparencyStrength.toFixed(2)}, ${newParams.emissiveStrength.toFixed(2)}, ${newParams.substanceStrength.toFixed(2)}`;
        return StateTransformer.UpdateResult.Updated;
    },
    interpolate(src, tar, t) {
        return {
            overpaintStrength: lerp(src.overpaintStrength, tar.overpaintStrength, t),
            transparencyStrength: lerp(src.transparencyStrength, tar.transparencyStrength, t),
            emissiveStrength: lerp(src.emissiveStrength, tar.emissiveStrength, t),
            substanceStrength: lerp(src.substanceStrength, tar.substanceStrength, t),
        };
    }
});
//
export var VolumeRepresentation3DHelpers;
(function (VolumeRepresentation3DHelpers) {
    function getDefaultParams(ctx, name, volume, volumeParams, colorName, colorParams, sizeName, sizeParams) {
        const type = ctx.representation.volume.registry.get(name);
        const colorType = ctx.representation.volume.themes.colorThemeRegistry.get(colorName || type.defaultColorTheme.name);
        const sizeType = ctx.representation.volume.themes.sizeThemeRegistry.get(sizeName || type.defaultSizeTheme.name);
        const volumeDefaultParams = PD.getDefaultValues(type.getParams(ctx.representation.volume.themes, volume));
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
            return Volume.IsoValue.toString(props.isoValue);
        }
        else if ((_b = (_a = props.renderMode) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.isoValue) {
            return Volume.IsoValue.toString((_d = (_c = props.renderMode) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.isoValue);
        }
    }
    VolumeRepresentation3DHelpers.getDescription = getDescription;
})(VolumeRepresentation3DHelpers || (VolumeRepresentation3DHelpers = {}));
const VolumeRepresentation3D = PluginStateTransform.BuiltIn({
    name: 'volume-representation-3d',
    display: '3D Representation',
    from: SO.Volume.Data,
    to: SO.Volume.Representation3D,
    params: (a, ctx) => {
        const { registry, themes: themeCtx } = ctx.representation.volume;
        const type = registry.get(registry.default.name);
        if (!a) {
            return {
                type: PD.Mapped(registry.default.name, registry.types, name => PD.Group(registry.get(name).getParams(themeCtx, Volume.One))),
                colorTheme: PD.Mapped(type.defaultColorTheme.name, themeCtx.colorThemeRegistry.types, name => PD.Group(themeCtx.colorThemeRegistry.get(name).getParams({ volume: Volume.One }))),
                sizeTheme: PD.Mapped(type.defaultSizeTheme.name, themeCtx.sizeThemeRegistry.types, name => PD.Group(themeCtx.sizeThemeRegistry.get(name).getParams({ volume: Volume.One })))
            };
        }
        const dataCtx = { volume: a.data };
        return ({
            type: PD.Mapped(registry.default.name, registry.types, name => PD.Group(registry.get(name).getParams(themeCtx, a.data))),
            colorTheme: PD.Mapped(type.defaultColorTheme.name, themeCtx.colorThemeRegistry.getApplicableTypes(dataCtx), name => PD.Group(themeCtx.colorThemeRegistry.get(name).getParams(dataCtx))),
            sizeTheme: PD.Mapped(type.defaultSizeTheme.name, themeCtx.sizeThemeRegistry.getApplicableTypes(dataCtx), name => PD.Group(themeCtx.sizeThemeRegistry.get(name).getParams(dataCtx)))
        });
    }
})({
    canAutoUpdate({ oldParams, newParams }) {
        return oldParams.type.name === newParams.type.name;
    },
    apply({ a, params }, plugin) {
        return Task.create('Volume Representation', async (ctx) => {
            var _a;
            const propertyCtx = { runtime: ctx, assetManager: plugin.managers.asset, errorContext: plugin.errorContext };
            const provider = plugin.representation.volume.registry.get(params.type.name);
            if (provider.ensureCustomProperties)
                await provider.ensureCustomProperties.attach(propertyCtx, a.data);
            const repr = provider.factory({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.volume.themes }, provider.getParams);
            repr.setTheme(Theme.create(plugin.representation.volume.themes, { volume: a.data, locationKinds: provider.locationKinds }, params));
            const props = params.type.params || {};
            await repr.createOrUpdate(props, a.data).runInContext(ctx);
            return new SO.Volume.Representation3D({ repr, sourceData: a.data }, { label: provider.label, description: VolumeRepresentation3DHelpers.getDescription(props) });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return Task.create('Volume Representation', async (ctx) => {
            var _a;
            const oldProvider = plugin.representation.volume.registry.get(oldParams.type.name);
            if (newParams.type.name !== oldParams.type.name) {
                (_a = oldProvider.ensureCustomProperties) === null || _a === void 0 ? void 0 : _a.detach(a.data);
                return StateTransformer.UpdateResult.Recreate;
            }
            const props = { ...b.data.repr.props, ...newParams.type.params };
            b.data.repr.setTheme(Theme.create(plugin.representation.volume.themes, { volume: a.data, locationKinds: oldProvider.locationKinds }, newParams));
            await b.data.repr.createOrUpdate(props, a.data).runInContext(ctx);
            b.data.sourceData = a.data;
            b.description = VolumeRepresentation3DHelpers.getDescription(props);
            return StateTransformer.UpdateResult.Updated;
        });
    }
});
//
export { ShapeRepresentation3D };
const ShapeRepresentation3D = PluginStateTransform.BuiltIn({
    name: 'shape-representation-3d',
    display: '3D Representation',
    from: SO.Shape.Provider,
    to: SO.Shape.Representation3D,
    params: (a, ctx) => {
        return a ? a.data.params : BaseGeometry.Params;
    }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }, plugin) {
        return Task.create('Shape Representation', async (ctx) => {
            const props = { ...PD.getDefaultValues(a.data.params), ...params };
            const repr = ShapeRepresentation(a.data.getShape, a.data.geometryUtils);
            await repr.createOrUpdate(props, a.data.data).runInContext(ctx);
            return new SO.Shape.Representation3D({ repr, sourceData: a.data }, { label: a.data.label });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return Task.create('Shape Representation', async (ctx) => {
            const props = { ...b.data.repr.props, ...newParams };
            await b.data.repr.createOrUpdate(props, a.data.data).runInContext(ctx);
            b.data.sourceData = a.data;
            return StateTransformer.UpdateResult.Updated;
        });
    }
});
export { ModelUnitcell3D };
const ModelUnitcell3D = PluginStateTransform.BuiltIn({
    name: 'model-unitcell-3d',
    display: 'Model Unit Cell',
    from: SO.Molecule.Model,
    to: SO.Shape.Representation3D,
    params: () => ({
        ...UnitcellParams,
    })
})({
    isApplicable: a => !!ModelSymmetry.Provider.get(a.data),
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return Task.create('Model Unit Cell', async (ctx) => {
            var _a;
            const symmetry = ModelSymmetry.Provider.get(a.data);
            if (!symmetry)
                return StateObject.Null;
            const data = getUnitcellData(a.data, symmetry, params);
            const repr = UnitcellRepresentation({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => UnitcellParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            return new SO.Shape.Representation3D({ repr, sourceData: data }, { label: `Unit Cell`, description: symmetry.spacegroup.name });
        });
    },
    update({ a, b, newParams }) {
        return Task.create('Model Unit Cell', async (ctx) => {
            const symmetry = ModelSymmetry.Provider.get(a.data);
            if (!symmetry)
                return StateTransformer.UpdateResult.Null;
            const props = { ...b.data.repr.props, ...newParams };
            const data = getUnitcellData(a.data, symmetry, props);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            return StateTransformer.UpdateResult.Updated;
        });
    }
});
export { StructureBoundingBox3D };
const StructureBoundingBox3D = PluginStateTransform.BuiltIn({
    name: 'structure-bounding-box-3d',
    display: 'Bounding Box',
    from: SO.Molecule.Structure,
    to: SO.Shape.Representation3D,
    params: {
        radius: PD.Numeric(0.05, { min: 0.01, max: 4, step: 0.01 }, { isEssential: true }),
        color: PD.Color(ColorNames.red, { isEssential: true }),
        ...Mesh.Params,
    }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params }, plugin) {
        return Task.create('Bounding Box', async (ctx) => {
            const repr = ShapeRepresentation((_, data, __, shape) => {
                const mesh = getBoxMesh(data.box, data.radius, shape === null || shape === void 0 ? void 0 : shape.geometry);
                return Shape.create('Bouding Box', data, mesh, () => data.color, () => 1, () => 'Bounding Box');
            }, Mesh.Utils);
            await repr.createOrUpdate(params, { box: a.data.boundary.box, radius: params.radius, color: params.color }).runInContext(ctx);
            return new SO.Shape.Representation3D({ repr, sourceData: a.data }, { label: `Bounding Box` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return Task.create('Bounding Box', async (ctx) => {
            await b.data.repr.createOrUpdate(newParams, { box: a.data.boundary.box, radius: newParams.radius, color: newParams.color }).runInContext(ctx);
            b.data.sourceData = a.data;
            return StateTransformer.UpdateResult.Updated;
        });
    }
});
export { StructureSelectionsDistance3D };
const StructureSelectionsDistance3D = PluginStateTransform.BuiltIn({
    name: 'structure-selections-distance-3d',
    display: '3D Distance',
    from: SO.Molecule.Structure.Selections,
    to: SO.Shape.Representation3D,
    params: () => ({
        ...DistanceParams,
    })
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return Task.create('Structure Distance', async (ctx) => {
            var _a;
            const data = getDistanceDataFromStructureSelections(a.data);
            const repr = DistanceRepresentation({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => DistanceParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            return new SO.Shape.Representation3D({ repr, sourceData: data }, { label: `Distance` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return Task.create('Structure Distance', async (ctx) => {
            const props = { ...b.data.repr.props, ...newParams };
            const data = getDistanceDataFromStructureSelections(a.data);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            return StateTransformer.UpdateResult.Updated;
        });
    },
});
export { StructureSelectionsAngle3D };
const StructureSelectionsAngle3D = PluginStateTransform.BuiltIn({
    name: 'structure-selections-angle-3d',
    display: '3D Angle',
    from: SO.Molecule.Structure.Selections,
    to: SO.Shape.Representation3D,
    params: () => ({
        ...AngleParams,
    })
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return Task.create('Structure Angle', async (ctx) => {
            var _a;
            const data = getAngleDataFromStructureSelections(a.data);
            const repr = AngleRepresentation({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => AngleParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            return new SO.Shape.Representation3D({ repr, sourceData: data }, { label: `Angle` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return Task.create('Structure Angle', async (ctx) => {
            const props = { ...b.data.repr.props, ...newParams };
            const data = getAngleDataFromStructureSelections(a.data);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            return StateTransformer.UpdateResult.Updated;
        });
    },
});
export { StructureSelectionsDihedral3D };
const StructureSelectionsDihedral3D = PluginStateTransform.BuiltIn({
    name: 'structure-selections-dihedral-3d',
    display: '3D Dihedral',
    from: SO.Molecule.Structure.Selections,
    to: SO.Shape.Representation3D,
    params: () => ({
        ...DihedralParams,
    })
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return Task.create('Structure Dihedral', async (ctx) => {
            var _a;
            const data = getDihedralDataFromStructureSelections(a.data);
            const repr = DihedralRepresentation({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => DihedralParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            return new SO.Shape.Representation3D({ repr, sourceData: data }, { label: `Dihedral` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return Task.create('Structure Dihedral', async (ctx) => {
            const props = { ...b.data.repr.props, ...newParams };
            const data = getDihedralDataFromStructureSelections(a.data);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            return StateTransformer.UpdateResult.Updated;
        });
    },
});
export { StructureSelectionsLabel3D };
const StructureSelectionsLabel3D = PluginStateTransform.BuiltIn({
    name: 'structure-selections-label-3d',
    display: '3D Label',
    from: SO.Molecule.Structure.Selections,
    to: SO.Shape.Representation3D,
    params: () => ({
        ...LabelParams,
    })
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return Task.create('Structure Label', async (ctx) => {
            var _a, _b, _c;
            const data = getLabelDataFromStructureSelections(a.data);
            const repr = LabelRepresentation({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => LabelParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            // Support interactivity when needed
            const pickable = !!(((_b = params.snapshotKey) === null || _b === void 0 ? void 0 : _b.trim()) || ((_c = params.tooltip) === null || _c === void 0 ? void 0 : _c.trim()));
            repr.setState({ pickable, markerActions: pickable ? MarkerActions.Highlighting : MarkerAction.None });
            return new SO.Shape.Representation3D({ repr, sourceData: data }, { label: `Label` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return Task.create('Structure Label', async (ctx) => {
            var _a, _b;
            const props = { ...b.data.repr.props, ...newParams };
            const data = getLabelDataFromStructureSelections(a.data);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            // Update interactivity
            const pickable = !!(((_a = newParams.snapshotKey) === null || _a === void 0 ? void 0 : _a.trim()) || ((_b = newParams.tooltip) === null || _b === void 0 ? void 0 : _b.trim()));
            b.data.repr.setState({ pickable, markerActions: pickable ? MarkerActions.Highlighting : MarkerAction.None });
            return StateTransformer.UpdateResult.Updated;
        });
    },
});
export { StructureSelectionsOrientation3D };
const StructureSelectionsOrientation3D = PluginStateTransform.BuiltIn({
    name: 'structure-selections-orientation-3d',
    display: '3D Orientation',
    from: SO.Molecule.Structure.Selections,
    to: SO.Shape.Representation3D,
    params: () => ({
        ...OrientationParams,
    })
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return Task.create('Structure Orientation', async (ctx) => {
            var _a;
            const data = getOrientationDataFromStructureSelections(a.data);
            const repr = OrientationRepresentation({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => OrientationParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            return new SO.Shape.Representation3D({ repr, sourceData: data }, { label: `Orientation` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return Task.create('Structure Orientation', async (ctx) => {
            const props = { ...b.data.repr.props, ...newParams };
            const data = getOrientationDataFromStructureSelections(a.data);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            return StateTransformer.UpdateResult.Updated;
        });
    },
});
export { StructureSelectionsPlane3D };
const StructureSelectionsPlane3D = PluginStateTransform.BuiltIn({
    name: 'structure-selections-plane-3d',
    display: '3D Plane',
    from: SO.Molecule.Structure.Selections,
    to: SO.Shape.Representation3D,
    params: () => ({
        ...PlaneParams,
    })
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin) {
        return Task.create('Structure Plane', async (ctx) => {
            var _a;
            const data = getPlaneDataFromStructureSelections(a.data);
            const repr = PlaneRepresentation({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.structure.themes }, () => PlaneParams);
            await repr.createOrUpdate(params, data).runInContext(ctx);
            return new SO.Shape.Representation3D({ repr, sourceData: data }, { label: `Plane` });
        });
    },
    update({ a, b, oldParams, newParams }, plugin) {
        return Task.create('Structure Plane', async (ctx) => {
            const props = { ...b.data.repr.props, ...newParams };
            const data = getPlaneDataFromStructureSelections(a.data);
            await b.data.repr.createOrUpdate(props, data).runInContext(ctx);
            b.data.sourceData = data;
            return StateTransformer.UpdateResult.Updated;
        });
    },
});
