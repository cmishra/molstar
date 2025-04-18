/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { Visual } from '../visual';
import { Bond, Structure, StructureElement } from '../../mol-model/structure';
import { Geometry } from '../../mol-geo/geometry/geometry';
import { Theme } from '../../mol-theme/theme';
import { createIdentityTransform } from '../../mol-geo/geometry/transform-data';
import { createRenderObject } from '../../mol-gl/render-object';
import { isEveryLoci, EmptyLoci } from '../../mol-model/loci';
import { Interval } from '../../mol-data/int';
import { VisualUpdateState } from '../util';
import { ColorTheme } from '../../mol-theme/color';
import { ValueCell, deepEqual } from '../../mol-util';
import { createSizes } from '../../mol-geo/geometry/size-data';
import { createColors } from '../../mol-geo/geometry/color-data';
import { MarkerAction } from '../../mol-util/marker-action';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { Cylinders } from '../../mol-geo/geometry/cylinders/cylinders';
import { Lines } from '../../mol-geo/geometry/lines/lines';
import { Text } from '../../mol-geo/geometry/text/text';
import { SizeTheme } from '../../mol-theme/size';
import { DirectVolume } from '../../mol-geo/geometry/direct-volume/direct-volume';
import { createMarkers } from '../../mol-geo/geometry/marker-data';
import { StructureParams, StructureMeshParams, StructureTextParams, StructureDirectVolumeParams, StructureLinesParams, StructureCylindersParams, StructureTextureMeshParams, StructureSpheresParams, StructurePointsParams, StructureImageParams } from './params';
import { TextureMesh } from '../../mol-geo/geometry/texture-mesh/texture-mesh';
import { isPromiseLike } from '../../mol-util/type-helpers';
import { Spheres } from '../../mol-geo/geometry/spheres/spheres';
import { Points } from '../../mol-geo/geometry/points/points';
import { Image } from '../../mol-geo/geometry/image/image';
function createComplexRenderObject(structure, geometry, locationIt, theme, props, materialId) {
    const { createValues, createRenderableState } = Geometry.getUtils(geometry);
    const transform = createIdentityTransform();
    const values = createValues(geometry, transform, locationIt, theme, props);
    const state = createRenderableState(props);
    return createRenderObject(geometry.kind, values, state, materialId);
}
export function ComplexVisual(builder, materialId) {
    const { defaultProps, createGeometry, createLocationIterator, getLoci, eachLocation, setUpdateState, mustRecreate, processValues, dispose } = builder;
    const { updateValues, updateBoundingSphere, updateRenderableState, createPositionIterator } = builder.geometryUtils;
    const updateState = VisualUpdateState.create();
    const previousMark = { loci: EmptyLoci, action: MarkerAction.None, status: -1 };
    let renderObject;
    let newProps;
    let newTheme;
    let newStructure;
    let currentProps = Object.assign({}, defaultProps);
    let currentTheme = Theme.createEmpty();
    let currentStructure;
    let geometry;
    let geometryVersion = -1;
    let locationIt;
    let positionIt;
    function prepareUpdate(theme, props, structure) {
        if (!structure && !currentStructure) {
            throw new Error('missing structure');
        }
        newProps = Object.assign({}, currentProps, props);
        newTheme = theme;
        newStructure = structure;
        VisualUpdateState.reset(updateState);
        if (!renderObject || !currentStructure) {
            updateState.createNew = true;
            updateState.createGeometry = true;
            return;
        }
        setUpdateState(updateState, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
        if (!Structure.areEquivalent(newStructure, currentStructure)) {
            updateState.createGeometry = true;
        }
        if (!Structure.areHierarchiesEqual(newStructure, currentStructure)) {
            updateState.updateTransform = true;
            updateState.createGeometry = true;
        }
        if (!ColorTheme.areEqual(theme.color, currentTheme.color)) {
            updateState.updateColor = true;
        }
        if (!SizeTheme.areEqual(theme.size, currentTheme.size)) {
            updateState.updateSize = true;
        }
        if (!deepEqual(newProps.unitKinds, currentProps.unitKinds)) {
            updateState.createGeometry = true;
        }
        if (currentStructure.child !== newStructure.child) {
            // console.log('new child');
            updateState.createGeometry = true;
            updateState.updateTransform = true;
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
            locationIt = createLocationIterator(newStructure, newProps);
            if (newGeometry) {
                renderObject = createComplexRenderObject(newStructure, newGeometry, locationIt, newTheme, newProps, materialId);
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
            if (updateState.updateColor || updateState.updateSize || updateState.updateTransform) {
                // console.log('update locationIterator');
                locationIt = createLocationIterator(newStructure, newProps);
            }
            if (updateState.updateTransform) {
                // console.log('update transform')
                const { instanceCount, groupCount } = locationIt;
                if (newProps.instanceGranularity) {
                    createMarkers(instanceCount, 'instance', renderObject.values);
                }
                else {
                    createMarkers(instanceCount * groupCount, 'groupInstance', renderObject.values);
                }
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
                positionIt = createPositionIterator(geometry, renderObject.values);
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
        currentStructure = newStructure;
        if (newGeometry) {
            geometry = newGeometry;
            geometryVersion += 1;
        }
    }
    function lociIsSuperset(loci) {
        if (isEveryLoci(loci))
            return true;
        if (Structure.isLoci(loci) && Structure.areRootsEquivalent(loci.structure, currentStructure))
            return true;
        if (StructureElement.Loci.is(loci) && Structure.areRootsEquivalent(loci.structure, currentStructure)) {
            if (StructureElement.Loci.isWholeStructure(loci))
                return true;
        }
        return false;
    }
    function eachInstance(loci, structure, apply) {
        let changed = false;
        if (!StructureElement.Loci.is(loci) && !Bond.isLoci(loci))
            return false;
        if (!Structure.areEquivalent(loci.structure, structure))
            return false;
        if (apply(Interval.ofSingleton(0)))
            changed = true;
        return changed;
    }
    function lociApply(loci, apply, isMarking) {
        if (lociIsSuperset(loci)) {
            if (currentProps.instanceGranularity) {
                return apply(Interval.ofBounds(0, locationIt.instanceCount));
            }
            else {
                return apply(Interval.ofBounds(0, locationIt.groupCount * locationIt.instanceCount));
            }
        }
        else {
            if (currentProps.instanceGranularity) {
                return eachInstance(loci, currentStructure, apply);
            }
            else {
                return eachLocation(loci, currentStructure, apply, isMarking);
            }
        }
    }
    function finalize(ctx) {
        if (renderObject) {
            processValues === null || processValues === void 0 ? void 0 : processValues(renderObject.values, geometry, currentProps, currentTheme, ctx.webgl);
        }
    }
    return {
        get groupCount() { return locationIt ? locationIt.count : 0; },
        get renderObject() { return locationIt && locationIt.count ? renderObject : undefined; },
        get geometryVersion() { return geometryVersion; },
        createOrUpdate(ctx, theme, props = {}, structure) {
            prepareUpdate(theme, props, structure || currentStructure);
            if (updateState.createGeometry) {
                const newGeometry = createGeometry(ctx, newStructure, newTheme, newProps, geometry);
                if (isPromiseLike(newGeometry)) {
                    return newGeometry.then(g => {
                        update(g);
                        finalize(ctx);
                    });
                }
                update(newGeometry);
            }
            else {
                update();
            }
            finalize(ctx);
        },
        getLoci(pickingId) {
            return renderObject ? getLoci(pickingId, currentStructure, renderObject.id) : EmptyLoci;
        },
        eachLocation(cb) {
            locationIt.reset();
            while (locationIt.hasNext) {
                const { location, isSecondary } = locationIt.move();
                cb(location, isSecondary);
            }
        },
        mark(loci, action) {
            return Visual.mark(renderObject, loci, action, lociApply, previousMark);
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
        setOverpaint(overpaint, webgl) {
            const smoothing = { geometry, props: currentProps, webgl };
            Visual.setOverpaint(renderObject, overpaint, lociApply, true, smoothing);
        },
        setTransparency(transparency, webgl) {
            const smoothing = { geometry, props: currentProps, webgl };
            Visual.setTransparency(renderObject, transparency, lociApply, true, smoothing);
        },
        setEmissive(emissive, webgl) {
            const smoothing = { geometry, props: currentProps, webgl };
            Visual.setEmissive(renderObject, emissive, lociApply, true, smoothing);
        },
        setSubstance(substance, webgl) {
            const smoothing = { geometry, props: currentProps, webgl };
            Visual.setSubstance(renderObject, substance, lociApply, true, smoothing);
        },
        setClipping(clipping) {
            Visual.setClipping(renderObject, clipping, lociApply, true);
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
// mesh
export const ComplexMeshParams = { ...StructureMeshParams, ...StructureParams };
export function ComplexMeshVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: Mesh.Utils
    }, materialId);
}
// spheres
export const ComplexSpheresParams = { ...StructureSpheresParams, ...StructureParams };
export function ComplexSpheresVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: Spheres.Utils
    }, materialId);
}
// cylinders
export const ComplexCylindersParams = { ...StructureCylindersParams, ...StructureParams };
export function ComplexCylindersVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: Cylinders.Utils
    }, materialId);
}
// points
export const ComplexPointsParams = { ...StructurePointsParams, ...StructureParams };
export function ComplexPointsVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: Points.Utils
    }, materialId);
}
// lines
export const ComplexLinesParams = { ...StructureLinesParams, ...StructureParams };
export function ComplexLinesVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: Lines.Utils
    }, materialId);
}
// text
export const ComplexTextParams = { ...StructureTextParams, ...StructureParams };
export function ComplexTextVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
            if (newProps.background !== currentProps.background)
                state.createGeometry = true;
            if (newProps.backgroundMargin !== currentProps.backgroundMargin)
                state.createGeometry = true;
            if (newProps.tether !== currentProps.tether)
                state.createGeometry = true;
            if (newProps.tetherLength !== currentProps.tetherLength)
                state.createGeometry = true;
            if (newProps.tetherBaseWidth !== currentProps.tetherBaseWidth)
                state.createGeometry = true;
            if (newProps.attachment !== currentProps.attachment)
                state.createGeometry = true;
            if (newProps.fontFamily !== currentProps.fontFamily)
                state.createGeometry = true;
            if (newProps.fontQuality !== currentProps.fontQuality)
                state.createGeometry = true;
            if (newProps.fontStyle !== currentProps.fontStyle)
                state.createGeometry = true;
            if (newProps.fontVariant !== currentProps.fontVariant)
                state.createGeometry = true;
            if (newProps.fontWeight !== currentProps.fontWeight)
                state.createGeometry = true;
        },
        geometryUtils: Text.Utils
    }, materialId);
}
// direct-volume
export const ComplexDirectVolumeParams = { ...StructureDirectVolumeParams, ...StructureParams };
export function ComplexDirectVolumeVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: DirectVolume.Utils
    }, materialId);
}
// texture-mesh
export const ComplexTextureMeshParams = { ...StructureTextureMeshParams, ...StructureParams };
export function ComplexTextureMeshVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: TextureMesh.Utils
    }, materialId);
}
// image
export const ComplexImageParams = { ...StructureImageParams, ...StructureParams };
export function ComplexImageVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: Image.Utils
    }, materialId);
}
