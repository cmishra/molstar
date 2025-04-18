/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Visual } from '../visual';
import { Volume } from '../../mol-model/volume';
import { Geometry } from '../../mol-geo/geometry/geometry';
import { Theme } from '../../mol-theme/theme';
import { createIdentityTransform } from '../../mol-geo/geometry/transform-data';
import { createRenderObject, getNextMaterialId } from '../../mol-gl/render-object';
import { isEveryLoci, EmptyLoci, isEmptyLoci } from '../../mol-model/loci';
import { Interval, SortedArray } from '../../mol-data/int';
import { getQualityProps, VisualUpdateState } from '../util';
import { ColorTheme } from '../../mol-theme/color';
import { ValueCell } from '../../mol-util';
import { createSizes } from '../../mol-geo/geometry/size-data';
import { createColors } from '../../mol-geo/geometry/color-data';
import { EPSILON, Mat4 } from '../../mol-math/linear-algebra';
import { Representation } from '../representation';
import { BaseGeometry } from '../../mol-geo/geometry/base';
import { Subject } from 'rxjs';
import { Task } from '../../mol-task';
import { isPromiseLike } from '../../mol-util/type-helpers';
import { createMarkers } from '../../mol-geo/geometry/marker-data';
import { SizeTheme } from '../../mol-theme/size';
function createVolumeRenderObject(volume, geometry, locationIt, theme, props, materialId) {
    const { createValues, createRenderableState } = Geometry.getUtils(geometry);
    const transform = createIdentityTransform();
    const values = createValues(geometry, transform, locationIt, theme, props);
    const state = createRenderableState(props);
    return createRenderObject(geometry.kind, values, state, materialId);
}
export function VolumeVisual(builder, materialId) {
    const { defaultProps, createGeometry, createLocationIterator, getLoci, eachLocation, setUpdateState, mustRecreate, dispose } = builder;
    const { updateValues, updateBoundingSphere, updateRenderableState, createPositionIterator } = builder.geometryUtils;
    const updateState = VisualUpdateState.create();
    let renderObject;
    let newProps;
    let newTheme;
    let newVolume;
    let newKey;
    let currentProps = Object.assign({}, defaultProps);
    let currentTheme = Theme.createEmpty();
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
        VisualUpdateState.reset(updateState);
        if (!renderObject) {
            updateState.createNew = true;
        }
        else if (!Volume.areEquivalent(newVolume, currentVolume) || newKey !== currentKey) {
            updateState.createNew = true;
        }
        if (updateState.createNew) {
            updateState.createGeometry = true;
            return;
        }
        setUpdateState(updateState, volume, newProps, currentProps, newTheme, currentTheme);
        if (!ColorTheme.areEqual(theme.color, currentTheme.color)) {
            updateState.updateColor = true;
        }
        if (!SizeTheme.areEqual(theme.size, currentTheme.size)) {
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
                    createMarkers(instanceCount, 'instance', renderObject.values);
                }
                else {
                    createMarkers(instanceCount * groupCount, 'groupInstance', renderObject.values);
                }
            }
            else {
                locationIt.reset();
            }
            if (updateState.createGeometry) {
                if (newGeometry) {
                    ValueCell.updateIfChanged(renderObject.values.drawCount, Geometry.getDrawCount(newGeometry));
                    ValueCell.updateIfChanged(renderObject.values.uVertexCount, Geometry.getVertexCount(newGeometry));
                    ValueCell.updateIfChanged(renderObject.values.uGroupCount, Geometry.getGroupCount(newGeometry));
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
                    createSizes(locationIt, newTheme.size, renderObject.values);
                }
            }
            if (updateState.updateColor) {
                createColors(locationIt, positionIt, newTheme.color, renderObject.values);
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
        if (Volume.Cell.isLoci(loci)) {
            if (Volume.Cell.isLociEmpty(loci))
                return false;
            if (!Volume.areEquivalent(loci.volume, volume))
                return false;
            if (apply(Interval.ofSingleton(0)))
                changed = true;
        }
        else if (Volume.Segment.isLoci(loci)) {
            if (Volume.Segment.isLociEmpty(loci))
                return false;
            if (!Volume.areEquivalent(loci.volume, volume))
                return false;
            if (!SortedArray.has(loci.segments, key))
                return false;
            if (apply(Interval.ofSingleton(0)))
                changed = true;
        }
        return changed;
    }
    function lociApply(loci, apply) {
        if (isEveryLoci(loci)) {
            if (currentProps.instanceGranularity) {
                return apply(Interval.ofBounds(0, locationIt.instanceCount));
            }
            else {
                return apply(Interval.ofBounds(0, locationIt.groupCount * locationIt.instanceCount));
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
                return isPromiseLike(newGeometry) ? newGeometry.then(update) : update(newGeometry);
            }
            else {
                update();
            }
        },
        getLoci(pickingId) {
            return renderObject ? getLoci(pickingId, currentVolume, currentKey, currentProps, renderObject.id) : EmptyLoci;
        },
        eachLocation(cb) {
            locationIt.reset();
            while (locationIt.hasNext) {
                const { location, isSecondary } = locationIt.move();
                cb(location, isSecondary);
            }
        },
        mark(loci, action) {
            return Visual.mark(renderObject, loci, action, lociApply);
        },
        setVisibility(visible) {
            Visual.setVisibility(renderObject, visible);
        },
        setAlphaFactor(alphaFactor) {
            Visual.setAlphaFactor(renderObject, alphaFactor);
        },
        setPickable(pickable) {
            Visual.setPickable(renderObject, pickable);
        },
        setColorOnly(colorOnly) {
            Visual.setColorOnly(renderObject, colorOnly);
        },
        setTransform(matrix, instanceMatrices) {
            Visual.setTransform(renderObject, matrix, instanceMatrices);
        },
        setOverpaint(overpaint) {
            return Visual.setOverpaint(renderObject, overpaint, lociApply, true);
        },
        setTransparency(transparency) {
            return Visual.setTransparency(renderObject, transparency, lociApply, true);
        },
        setEmissive(emissive) {
            return Visual.setEmissive(renderObject, emissive, lociApply, true);
        },
        setSubstance(substance) {
            return Visual.setSubstance(renderObject, substance, lociApply, true);
        },
        setClipping(clipping) {
            return Visual.setClipping(renderObject, clipping, lociApply, true);
        },
        setThemeStrength(strength) {
            Visual.setThemeStrength(renderObject, strength);
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
export function VolumeRepresentationProvider(p) { return p; }
//
export const VolumeParams = {
    ...BaseGeometry.Params,
};
export function VolumeRepresentation(label, ctx, getParams, visualCtor, getLoci, getKeys = () => [-1]) {
    let version = 0;
    const { webgl } = ctx;
    const updated = new Subject();
    const geometryState = new Representation.GeometryState();
    const materialId = getNextMaterialId();
    const renderObjects = [];
    const _state = Representation.createState();
    const visuals = new Map();
    let _volume;
    let _keys;
    let _params;
    let _props;
    let _theme = Theme.createEmpty();
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
                _props = PD.getDefaultValues(_params);
        }
        const qualityProps = getQualityProps(Object.assign({}, _props, props), _volume);
        Object.assign(_props, props, qualityProps);
        _keys = getKeys(_props);
        return Task.create('Creating or updating VolumeRepresentation', async (runtime) => {
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
        if (transform !== undefined && !Mat4.areEqual(transform, _state.transform, EPSILON)) {
            newState.transform = transform;
        }
        if (syncManually !== undefined)
            newState.syncManually = syncManually;
        if (markerActions !== undefined)
            newState.markerActions = markerActions;
        visuals.forEach(visual => setVisualState(visual, newState));
        Representation.updateState(_state, state);
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
            let loci = EmptyLoci;
            visuals.forEach(visual => {
                const _loci = visual.getLoci(pickingId);
                if (!isEmptyLoci(_loci))
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
