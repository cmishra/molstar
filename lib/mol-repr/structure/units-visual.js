/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { Structure, Unit, StructureElement, Bond } from '../../mol-model/structure';
import { Visual } from '../visual';
import { Geometry } from '../../mol-geo/geometry/geometry';
import { Theme } from '../../mol-theme/theme';
import { createUnitsTransform, includesUnitKind } from './visual/util/common';
import { createRenderObject } from '../../mol-gl/render-object';
import { isEveryLoci, EmptyLoci } from '../../mol-model/loci';
import { Interval } from '../../mol-data/int';
import { VisualUpdateState } from '../util';
import { ColorTheme } from '../../mol-theme/color';
import { createMarkers } from '../../mol-geo/geometry/marker-data';
import { MarkerAction } from '../../mol-util/marker-action';
import { ValueCell, deepEqual } from '../../mol-util';
import { createSizes } from '../../mol-geo/geometry/size-data';
import { createColors } from '../../mol-geo/geometry/color-data';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { SizeTheme } from '../../mol-theme/size';
import { Spheres } from '../../mol-geo/geometry/spheres/spheres';
import { Cylinders } from '../../mol-geo/geometry/cylinders/cylinders';
import { Points } from '../../mol-geo/geometry/points/points';
import { Lines } from '../../mol-geo/geometry/lines/lines';
import { Text } from '../../mol-geo/geometry/text/text';
import { DirectVolume } from '../../mol-geo/geometry/direct-volume/direct-volume';
import { TextureMesh } from '../../mol-geo/geometry/texture-mesh/texture-mesh';
import { Image } from '../../mol-geo/geometry/image/image';
import { StructureParams, StructureMeshParams, StructureSpheresParams, StructurePointsParams, StructureLinesParams, StructureTextParams, StructureDirectVolumeParams, StructureTextureMeshParams, StructureCylindersParams, StructureImageParams } from './params';
import { isPromiseLike } from '../../mol-util/type-helpers';
function createUnitsRenderObject(structureGroup, geometry, locationIt, theme, props, materialId) {
    const { createValues, createRenderableState } = Geometry.getUtils(geometry);
    const transform = createUnitsTransform(structureGroup, props.includeParent, geometry.boundingSphere, props.cellSize, props.batchSize);
    const values = createValues(geometry, transform, locationIt, theme, props);
    const state = createRenderableState(props);
    return createRenderObject(geometry.kind, values, state, materialId);
}
export function UnitsVisual(builder, materialId) {
    const { defaultProps, createGeometry, createLocationIterator, getLoci, eachLocation, setUpdateState, initUpdateState, mustRecreate, processValues, dispose } = builder;
    const { createEmpty: createEmptyGeometry, updateValues, updateBoundingSphere, updateRenderableState, createPositionIterator } = builder.geometryUtils;
    const updateState = VisualUpdateState.create();
    const previousMark = { loci: EmptyLoci, action: MarkerAction.None, status: -1 };
    let renderObject;
    let newProps = Object.assign({}, defaultProps);
    let newTheme = Theme.createEmpty();
    let newStructureGroup;
    let currentProps;
    let currentTheme;
    let currentStructureGroup;
    let geometry;
    let geometryVersion = -1;
    let locationIt;
    let positionIt;
    function prepareUpdate(theme, props, structureGroup) {
        if (!structureGroup && !currentStructureGroup) {
            throw new Error('missing structureGroup');
        }
        newProps = props;
        newTheme = theme;
        newStructureGroup = structureGroup;
        VisualUpdateState.reset(updateState);
        if (!renderObject || !currentStructureGroup) {
            initUpdateState === null || initUpdateState === void 0 ? void 0 : initUpdateState(updateState, newProps, newTheme, newStructureGroup);
            // console.log('create new');
            updateState.createNew = true;
            updateState.createGeometry = true;
            return;
        }
        setUpdateState(updateState, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
        if (!Structure.areHierarchiesEqual(currentStructureGroup.structure, newStructureGroup.structure)) {
            // console.log('new hierarchy');
            updateState.updateTransform = true;
            updateState.updateColor = true;
            updateState.updateSize = true;
        }
        if (!ColorTheme.areEqual(newTheme.color, currentTheme.color)) {
            // console.log('new colorTheme');
            updateState.updateColor = true;
        }
        if (!SizeTheme.areEqual(newTheme.size, currentTheme.size)) {
            // console.log('new sizeTheme');
            updateState.updateSize = true;
        }
        if (currentStructureGroup.structure.child !== newStructureGroup.structure.child) {
            // console.log('new child');
            updateState.createGeometry = true;
            updateState.updateTransform = true;
        }
        if (newProps.instanceGranularity !== currentProps.instanceGranularity || newProps.cellSize !== currentProps.cellSize || newProps.batchSize !== currentProps.batchSize) {
            updateState.updateTransform = true;
        }
        if (!deepEqual(newProps.unitKinds, currentProps.unitKinds)) {
            // console.log('new unitKinds');
            updateState.createGeometry = true;
        }
        if (newStructureGroup.group.transformHash !== currentStructureGroup.group.transformHash) {
            // console.log('new transformHash');
            if (newStructureGroup.group.units.length !== currentStructureGroup.group.units.length || updateState.updateColor) {
                updateState.updateTransform = true;
            }
            else {
                updateState.updateMatrix = true;
            }
        }
        // check if the operator or conformation of unit has changed
        const newUnit = newStructureGroup.group.units[0];
        const currentUnit = currentStructureGroup.group.units[0];
        if (!Unit.areOperatorsEqual(newUnit, currentUnit)) {
            // console.log('new operators');
            updateState.updateTransform = true;
        }
        if (!Unit.areConformationsEqual(newUnit, currentUnit)) {
            // console.log('new conformation');
            updateState.createGeometry = true;
        }
        if (updateState.updateTransform) {
            updateState.updateMatrix = true;
        }
        if (updateState.updateSize && !('uSize' in renderObject.values)) {
            updateState.createGeometry = true;
        }
        if (updateState.createGeometry || updateState.updateTransform) {
            if (currentStructureGroup.structure.hashCode !== newStructureGroup.structure.hashCode) {
                // console.log('new hashCode');
                updateState.updateColor = true;
                updateState.updateSize = true;
            }
            if (newTheme.color.granularity.startsWith('vertex') ||
                renderObject.values.dColorType.ref.value.startsWith('vertex') ||
                newTheme.color.granularity.startsWith('volume') ||
                renderObject.values.dColorType.ref.value.startsWith('volume')) {
                updateState.updateColor = true;
            }
        }
    }
    function update(newGeometry) {
        if (updateState.createNew) {
            locationIt = createLocationIterator(newStructureGroup, newProps);
            if (newGeometry) {
                renderObject = createUnitsRenderObject(newStructureGroup, newGeometry, locationIt, newTheme, newProps, materialId);
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
                locationIt = createLocationIterator(newStructureGroup, newProps);
            }
            if (updateState.updateTransform) {
                // console.log('update transform');
                const { instanceCount, groupCount } = locationIt;
                if (newProps.instanceGranularity) {
                    createMarkers(instanceCount, 'instance', renderObject.values);
                }
                else {
                    createMarkers(instanceCount * groupCount, 'groupInstance', renderObject.values);
                }
            }
            if (updateState.updateMatrix) {
                // console.log('update matrix');
                createUnitsTransform(newStructureGroup, newProps.includeParent, (newGeometry === null || newGeometry === void 0 ? void 0 : newGeometry.boundingSphere) || renderObject.values.invariantBoundingSphere.ref.value, newProps.cellSize, newProps.batchSize, renderObject.values);
                if ('lodLevels' in renderObject.values) {
                    // to trigger `uLod` update in `renderable.cull`
                    ValueCell.update(renderObject.values.lodLevels, renderObject.values.lodLevels.ref.value);
                }
            }
            if (updateState.createGeometry) {
                // console.log('update geometry');
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
                    // console.log('update size');
                    createSizes(locationIt, newTheme.size, renderObject.values);
                }
            }
            if (updateState.updateColor) {
                // console.log('update color');
                createColors(locationIt, positionIt, newTheme.color, renderObject.values);
            }
            updateValues(renderObject.values, newProps);
            updateRenderableState(renderObject.state, newProps);
        }
        currentProps = newProps;
        currentTheme = newTheme;
        currentStructureGroup = newStructureGroup;
        if (newGeometry) {
            geometry = newGeometry;
            geometryVersion += 1;
        }
    }
    function _createGeometry(ctx, unit, structure, theme, props, geometry) {
        return includesUnitKind(props.unitKinds, unit)
            ? createGeometry(ctx, unit, structure, theme, props, geometry)
            : createEmptyGeometry(geometry);
    }
    function lociIsSuperset(loci) {
        if (isEveryLoci(loci))
            return true;
        if (Structure.isLoci(loci) && Structure.areRootsEquivalent(loci.structure, currentStructureGroup.structure))
            return true;
        if (StructureElement.Loci.is(loci) && Structure.areRootsEquivalent(loci.structure, currentStructureGroup.structure)) {
            if (StructureElement.Loci.isWholeStructure(loci))
                return true;
        }
        return false;
    }
    function eachInstance(loci, structureGroup, apply) {
        let changed = false;
        if (Bond.isLoci(loci)) {
            const { structure, group } = structureGroup;
            if (!Structure.areEquivalent(loci.structure, structure))
                return false;
            for (const b of loci.bonds) {
                if (b.aUnit !== b.bUnit)
                    continue;
                const unitIdx = group.unitIndexMap.get(b.aUnit.id);
                if (unitIdx !== undefined) {
                    if (apply(Interval.ofSingleton(unitIdx)))
                        changed = true;
                }
            }
        }
        else if (StructureElement.Loci.is(loci)) {
            const { structure, group } = structureGroup;
            if (!Structure.areEquivalent(loci.structure, structure))
                return false;
            for (const e of loci.elements) {
                const unitIdx = group.unitIndexMap.get(e.unit.id);
                if (unitIdx !== undefined) {
                    if (apply(Interval.ofSingleton(unitIdx)))
                        changed = true;
                }
            }
        }
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
                return eachInstance(loci, currentStructureGroup, apply);
            }
            else {
                return eachLocation(loci, currentStructureGroup, apply, isMarking);
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
        createOrUpdate(ctx, theme, props, structureGroup) {
            prepareUpdate(theme, props, structureGroup || currentStructureGroup);
            if (updateState.createGeometry) {
                const newGeometry = _createGeometry(ctx, newStructureGroup.group.units[0], newStructureGroup.structure, newTheme, newProps, geometry);
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
            return renderObject ? getLoci(pickingId, currentStructureGroup, renderObject.id) : EmptyLoci;
        },
        eachLocation(cb) {
            locationIt.reset();
            while (locationIt.hasNext) {
                const { location, isSecondary } = locationIt.move();
                cb(location, isSecondary);
            }
        },
        mark(loci, action) {
            let hasInvariantId = true;
            if (StructureElement.Loci.is(loci)) {
                hasInvariantId = false;
                const { invariantId } = currentStructureGroup.group.units[0];
                for (const e of loci.elements) {
                    if (e.unit.invariantId === invariantId) {
                        hasInvariantId = true;
                        break;
                    }
                }
            }
            return hasInvariantId ? Visual.mark(renderObject, loci, action, lociApply, previousMark) : false;
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
export const UnitsMeshParams = { ...StructureMeshParams, ...StructureParams };
export function UnitsMeshVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: Mesh.Utils
    }, materialId);
}
// spheres
export const UnitsSpheresParams = { ...StructureSpheresParams, ...StructureParams };
export function UnitsSpheresVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: Spheres.Utils
    }, materialId);
}
// cylinders
export const UnitsCylindersParams = { ...StructureCylindersParams, ...StructureParams };
export function UnitsCylindersVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: Cylinders.Utils
    }, materialId);
}
// points
export const UnitsPointsParams = { ...StructurePointsParams, ...StructureParams };
export function UnitsPointsVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: Points.Utils
    }, materialId);
}
// lines
export const UnitsLinesParams = { ...StructureLinesParams, ...StructureParams };
export function UnitsLinesVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: Lines.Utils
    }, materialId);
}
// text
export const UnitsTextParams = { ...StructureTextParams, ...StructureParams };
export function UnitsTextVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
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
export const UnitsDirectVolumeParams = { ...StructureDirectVolumeParams, ...StructureParams };
export function UnitsDirectVolumeVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: DirectVolume.Utils
    }, materialId);
}
// texture-mesh
export const UnitsTextureMeshParams = { ...StructureTextureMeshParams, ...StructureParams };
export function UnitsTextureMeshVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: TextureMesh.Utils
    }, materialId);
}
// image
export const UnitsImageParams = { ...StructureImageParams, ...StructureParams };
export function UnitsImageVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: Image.Utils
    }, materialId);
}
