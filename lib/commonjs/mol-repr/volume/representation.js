"use strict";
/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeParams = void 0;
exports.VolumeVisual = VolumeVisual;
exports.VolumeRepresentationProvider = VolumeRepresentationProvider;
exports.VolumeRepresentation = VolumeRepresentation;
const param_definition_1 = require("../../mol-util/param-definition");
const visual_1 = require("../visual");
const volume_1 = require("../../mol-model/volume");
const geometry_1 = require("../../mol-geo/geometry/geometry");
const theme_1 = require("../../mol-theme/theme");
const transform_data_1 = require("../../mol-geo/geometry/transform-data");
const render_object_1 = require("../../mol-gl/render-object");
const loci_1 = require("../../mol-model/loci");
const int_1 = require("../../mol-data/int");
const util_1 = require("../util");
const color_1 = require("../../mol-theme/color");
const mol_util_1 = require("../../mol-util");
const size_data_1 = require("../../mol-geo/geometry/size-data");
const color_data_1 = require("../../mol-geo/geometry/color-data");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const representation_1 = require("../representation");
const base_1 = require("../../mol-geo/geometry/base");
const rxjs_1 = require("rxjs");
const mol_task_1 = require("../../mol-task");
const type_helpers_1 = require("../../mol-util/type-helpers");
const marker_data_1 = require("../../mol-geo/geometry/marker-data");
const size_1 = require("../../mol-theme/size");
function createVolumeRenderObject(volume, geometry, locationIt, theme, props, materialId) {
    const { createValues, createRenderableState } = geometry_1.Geometry.getUtils(geometry);
    const transform = (0, transform_data_1.createIdentityTransform)();
    const values = createValues(geometry, transform, locationIt, theme, props);
    const state = createRenderableState(props);
    return (0, render_object_1.createRenderObject)(geometry.kind, values, state, materialId);
}
function VolumeVisual(builder, materialId) {
    const { defaultProps, createGeometry, createLocationIterator, getLoci, eachLocation, setUpdateState, mustRecreate, dispose } = builder;
    const { updateValues, updateBoundingSphere, updateRenderableState, createPositionIterator } = builder.geometryUtils;
    const updateState = util_1.VisualUpdateState.create();
    let renderObject;
    let newProps;
    let newTheme;
    let newVolume;
    let newKey;
    let currentProps = Object.assign({}, defaultProps);
    let currentTheme = theme_1.Theme.createEmpty();
    let currentVolume;
    let currentKey;
    let geometry;
    let geometryVersion = -1;
    let locationIt;
    let positionIt;
    function prepareUpdate(theme, props, volume, key) {
        if (!volume && !currentVolume) {
            throw new Error('missing volume');
        }
        newProps = Object.assign({}, currentProps, props);
        newTheme = theme;
        newVolume = volume;
        newKey = key;
        util_1.VisualUpdateState.reset(updateState);
        if (!renderObject) {
            updateState.createNew = true;
        }
        else if (!volume_1.Volume.areEquivalent(newVolume, currentVolume) || newKey !== currentKey) {
            updateState.createNew = true;
        }
        if (updateState.createNew) {
            updateState.createGeometry = true;
            return;
        }
        setUpdateState(updateState, volume, newProps, currentProps, newTheme, currentTheme);
        if (!color_1.ColorTheme.areEqual(theme.color, currentTheme.color)) {
            updateState.updateColor = true;
        }
        if (!size_1.SizeTheme.areEqual(theme.size, currentTheme.size)) {
            updateState.updateSize = true;
        }
        if (newProps.instanceGranularity !== currentProps.instanceGranularity) {
            updateState.updateTransform = true;
        }
        if (updateState.updateSize && !('uSize' in renderObject.values)) {
            updateState.createGeometry = true;
        }
        if (updateState.createGeometry) {
            updateState.updateColor = true;
            updateState.updateSize = true;
        }
    }
    function update(newGeometry) {
        if (updateState.createNew) {
            locationIt = createLocationIterator(newVolume, newKey);
            if (newGeometry) {
                renderObject = createVolumeRenderObject(newVolume, newGeometry, locationIt, newTheme, newProps, materialId);
                positionIt = createPositionIterator(newGeometry, renderObject.values);
            }
            else {
                throw new Error('expected geometry to be given');
            }
        }
        else {
            if (!renderObject) {
                throw new Error('expected renderObject to be available');
            }
            if (updateState.updateTransform) {
                // console.log('update transform');
                locationIt = createLocationIterator(newVolume, newKey);
                const { instanceCount, groupCount } = locationIt;
                if (newProps.instanceGranularity) {
                    (0, marker_data_1.createMarkers)(instanceCount, 'instance', renderObject.values);
                }
                else {
                    (0, marker_data_1.createMarkers)(instanceCount * groupCount, 'groupInstance', renderObject.values);
                }
            }
            else {
                locationIt.reset();
            }
            if (updateState.createGeometry) {
                if (newGeometry) {
                    mol_util_1.ValueCell.updateIfChanged(renderObject.values.drawCount, geometry_1.Geometry.getDrawCount(newGeometry));
                    mol_util_1.ValueCell.updateIfChanged(renderObject.values.uVertexCount, geometry_1.Geometry.getVertexCount(newGeometry));
                    mol_util_1.ValueCell.updateIfChanged(renderObject.values.uGroupCount, geometry_1.Geometry.getGroupCount(newGeometry));
                }
                else {
                    throw new Error('expected geometry to be given');
                }
            }
            if (updateState.updateTransform || updateState.createGeometry) {
                updateBoundingSphere(renderObject.values, newGeometry || geometry);
                positionIt = createPositionIterator(newGeometry || geometry, renderObject.values);
            }
            if (updateState.updateSize) {
                // not all geometries have size data, so check here
                if ('uSize' in renderObject.values) {
                    (0, size_data_1.createSizes)(locationIt, newTheme.size, renderObject.values);
                }
            }
            if (updateState.updateColor) {
                (0, color_data_1.createColors)(locationIt, positionIt, newTheme.color, renderObject.values);
            }
            updateValues(renderObject.values, newProps);
            updateRenderableState(renderObject.state, newProps);
        }
        currentProps = newProps;
        currentTheme = newTheme;
        currentVolume = newVolume;
        currentKey = newKey;
        if (newGeometry) {
            geometry = newGeometry;
            geometryVersion += 1;
        }
    }
    function eachInstance(loci, volume, key, apply) {
        let changed = false;
        if (volume_1.Volume.Cell.isLoci(loci)) {
            if (volume_1.Volume.Cell.isLociEmpty(loci))
                return false;
            if (!volume_1.Volume.areEquivalent(loci.volume, volume))
                return false;
            if (apply(int_1.Interval.ofSingleton(0)))
                changed = true;
        }
        else if (volume_1.Volume.Segment.isLoci(loci)) {
            if (volume_1.Volume.Segment.isLociEmpty(loci))
                return false;
            if (!volume_1.Volume.areEquivalent(loci.volume, volume))
                return false;
            if (!int_1.SortedArray.has(loci.segments, key))
                return false;
            if (apply(int_1.Interval.ofSingleton(0)))
                changed = true;
        }
        return changed;
    }
    function lociApply(loci, apply) {
        if ((0, loci_1.isEveryLoci)(loci)) {
            if (currentProps.instanceGranularity) {
                return apply(int_1.Interval.ofBounds(0, locationIt.instanceCount));
            }
            else {
                return apply(int_1.Interval.ofBounds(0, locationIt.groupCount * locationIt.instanceCount));
            }
        }
        else {
            if (currentProps.instanceGranularity) {
                return eachInstance(loci, currentVolume, currentKey, apply);
            }
            else {
                return eachLocation(loci, currentVolume, currentKey, currentProps, apply);
            }
        }
    }
    return {
        get groupCount() { return locationIt ? locationIt.count : 0; },
        get renderObject() { return renderObject; },
        get geometryVersion() { return geometryVersion; },
        async createOrUpdate(ctx, theme, props = {}, volumeKey) {
            prepareUpdate(theme, props, (volumeKey === null || volumeKey === void 0 ? void 0 : volumeKey.volume) || currentVolume, (volumeKey === null || volumeKey === void 0 ? void 0 : volumeKey.key) || currentKey);
            if (updateState.createGeometry) {
                const newGeometry = createGeometry(ctx, newVolume, newKey, newTheme, newProps, geometry);
                return (0, type_helpers_1.isPromiseLike)(newGeometry) ? newGeometry.then(update) : update(newGeometry);
            }
            else {
                update();
            }
        },
        getLoci(pickingId) {
            return renderObject ? getLoci(pickingId, currentVolume, currentKey, currentProps, renderObject.id) : loci_1.EmptyLoci;
        },
        eachLocation(cb) {
            locationIt.reset();
            while (locationIt.hasNext) {
                const { location, isSecondary } = locationIt.move();
                cb(location, isSecondary);
            }
        },
        mark(loci, action) {
            return visual_1.Visual.mark(renderObject, loci, action, lociApply);
        },
        setVisibility(visible) {
            visual_1.Visual.setVisibility(renderObject, visible);
        },
        setAlphaFactor(alphaFactor) {
            visual_1.Visual.setAlphaFactor(renderObject, alphaFactor);
        },
        setPickable(pickable) {
            visual_1.Visual.setPickable(renderObject, pickable);
        },
        setColorOnly(colorOnly) {
            visual_1.Visual.setColorOnly(renderObject, colorOnly);
        },
        setTransform(matrix, instanceMatrices) {
            visual_1.Visual.setTransform(renderObject, matrix, instanceMatrices);
        },
        setOverpaint(overpaint) {
            return visual_1.Visual.setOverpaint(renderObject, overpaint, lociApply, true);
        },
        setTransparency(transparency) {
            return visual_1.Visual.setTransparency(renderObject, transparency, lociApply, true);
        },
        setEmissive(emissive) {
            return visual_1.Visual.setEmissive(renderObject, emissive, lociApply, true);
        },
        setSubstance(substance) {
            return visual_1.Visual.setSubstance(renderObject, substance, lociApply, true);
        },
        setClipping(clipping) {
            return visual_1.Visual.setClipping(renderObject, clipping, lociApply, true);
        },
        setThemeStrength(strength) {
            visual_1.Visual.setThemeStrength(renderObject, strength);
        },
        destroy() {
            dispose === null || dispose === void 0 ? void 0 : dispose(geometry);
            if (renderObject) {
                renderObject.state.disposed = true;
                renderObject = undefined;
            }
        },
        mustRecreate
    };
}
function VolumeRepresentationProvider(p) { return p; }
//
exports.VolumeParams = {
    ...base_1.BaseGeometry.Params,
};
function VolumeRepresentation(label, ctx, getParams, visualCtor, getLoci, getKeys = () => [-1]) {
    let version = 0;
    const { webgl } = ctx;
    const updated = new rxjs_1.Subject();
    const geometryState = new representation_1.Representation.GeometryState();
    const materialId = (0, render_object_1.getNextMaterialId)();
    const renderObjects = [];
    const _state = representation_1.Representation.createState();
    const visuals = new Map();
    let _volume;
    let _keys;
    let _params;
    let _props;
    let _theme = theme_1.Theme.createEmpty();
    async function visual(runtime, key) {
        var _a;
        let visual = visuals.get(key);
        if (!visual) {
            visual = visualCtor(materialId, _volume, key, _props, webgl);
            visuals.set(key, visual);
        }
        else if ((_a = visual.mustRecreate) === null || _a === void 0 ? void 0 : _a.call(visual, { volume: _volume, key }, _props, webgl)) {
            visual.destroy();
            visual = visualCtor(materialId, _volume, key, _props, webgl);
            visuals.set(key, visual);
        }
        return visual.createOrUpdate({ webgl, runtime }, _theme, _props, { volume: _volume, key });
    }
    function createOrUpdate(props = {}, volume) {
        if (volume && volume !== _volume) {
            _params = getParams(ctx, volume);
            _volume = volume;
            if (!_props)
                _props = param_definition_1.ParamDefinition.getDefaultValues(_params);
        }
        const qualityProps = (0, util_1.getQualityProps)(Object.assign({}, _props, props), _volume);
        Object.assign(_props, props, qualityProps);
        _keys = getKeys(_props);
        return mol_task_1.Task.create('Creating or updating VolumeRepresentation', async (runtime) => {
            const toDelete = new Set(visuals.keys());
            for (let i = 0, il = _keys.length; i < il; ++i) {
                const segment = _keys[i];
                toDelete.delete(segment);
                const promise = visual(runtime, segment);
                if (promise)
                    await promise;
            }
            toDelete.forEach(segment => {
                var _a;
                (_a = visuals.get(segment)) === null || _a === void 0 ? void 0 : _a.destroy();
                visuals.delete(segment);
            });
            // update list of renderObjects
            renderObjects.length = 0;
            visuals.forEach(visual => {
                if (visual.renderObject) {
                    renderObjects.push(visual.renderObject);
                    geometryState.add(visual.renderObject.id, visual.geometryVersion);
                }
            });
            geometryState.snapshot();
            // increment version
            updated.next(version++);
        });
    }
    function mark(loci, action) {
        let changed = false;
        visuals.forEach(visual => {
            changed = visual.mark(loci, action) || changed;
        });
        return changed;
    }
    function setVisualState(visual, state) {
        if (state.visible !== undefined && visual)
            visual.setVisibility(state.visible);
        if (state.alphaFactor !== undefined && visual)
            visual.setAlphaFactor(state.alphaFactor);
        if (state.pickable !== undefined && visual)
            visual.setPickable(state.pickable);
        if (state.overpaint !== undefined && visual)
            visual.setOverpaint(state.overpaint);
        if (state.transparency !== undefined && visual)
            visual.setTransparency(state.transparency);
        if (state.emissive !== undefined && visual)
            visual.setEmissive(state.emissive);
        if (state.substance !== undefined && visual)
            visual.setSubstance(state.substance);
        if (state.clipping !== undefined && visual)
            visual.setClipping(state.clipping);
        if (state.transform !== undefined && visual)
            visual.setTransform(state.transform);
        if (state.themeStrength !== undefined && visual)
            visual.setThemeStrength(state.themeStrength);
    }
    function setState(state) {
        const { visible, alphaFactor, pickable, overpaint, transparency, emissive, substance, clipping, transform, themeStrength, syncManually, markerActions } = state;
        const newState = {};
        if (visible !== undefined)
            newState.visible = visible;
        if (alphaFactor !== undefined)
            newState.alphaFactor = alphaFactor;
        if (pickable !== undefined)
            newState.pickable = pickable;
        if (overpaint !== undefined)
            newState.overpaint = overpaint;
        if (transparency !== undefined)
            newState.transparency = transparency;
        if (emissive !== undefined)
            newState.emissive = emissive;
        if (substance !== undefined)
            newState.substance = substance;
        if (clipping !== undefined)
            newState.clipping = clipping;
        if (themeStrength !== undefined)
            newState.themeStrength = themeStrength;
        if (transform !== undefined && !linear_algebra_1.Mat4.areEqual(transform, _state.transform, linear_algebra_1.EPSILON)) {
            newState.transform = transform;
        }
        if (syncManually !== undefined)
            newState.syncManually = syncManually;
        if (markerActions !== undefined)
            newState.markerActions = markerActions;
        visuals.forEach(visual => setVisualState(visual, newState));
        representation_1.Representation.updateState(_state, state);
    }
    function setTheme(theme) {
        _theme = theme;
    }
    function destroy() {
        visuals.forEach(visual => visual.destroy());
        visuals.clear();
    }
    return {
        label,
        get groupCount() {
            let groupCount = 0;
            visuals.forEach(visual => {
                if (visual.renderObject)
                    groupCount += visual.groupCount;
            });
            return groupCount;
        },
        get props() { return _props; },
        get params() { return _params; },
        get state() { return _state; },
        get theme() { return _theme; },
        get geometryVersion() { return geometryState.version; },
        renderObjects,
        updated,
        createOrUpdate,
        setState,
        setTheme,
        getLoci: (pickingId) => {
            let loci = loci_1.EmptyLoci;
            visuals.forEach(visual => {
                const _loci = visual.getLoci(pickingId);
                if (!(0, loci_1.isEmptyLoci)(_loci))
                    loci = _loci;
            });
            return loci;
        },
        getAllLoci: () => {
            return [getLoci(_volume, _props)];
        },
        eachLocation: (cb) => {
            visuals.forEach(visual => {
                visual.eachLocation(cb);
            });
        },
        mark,
        destroy
    };
}
