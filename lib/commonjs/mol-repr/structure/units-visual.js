"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitsImageParams = exports.UnitsTextureMeshParams = exports.UnitsDirectVolumeParams = exports.UnitsTextParams = exports.UnitsLinesParams = exports.UnitsPointsParams = exports.UnitsCylindersParams = exports.UnitsSpheresParams = exports.UnitsMeshParams = void 0;
exports.UnitsVisual = UnitsVisual;
exports.UnitsMeshVisual = UnitsMeshVisual;
exports.UnitsSpheresVisual = UnitsSpheresVisual;
exports.UnitsCylindersVisual = UnitsCylindersVisual;
exports.UnitsPointsVisual = UnitsPointsVisual;
exports.UnitsLinesVisual = UnitsLinesVisual;
exports.UnitsTextVisual = UnitsTextVisual;
exports.UnitsDirectVolumeVisual = UnitsDirectVolumeVisual;
exports.UnitsTextureMeshVisual = UnitsTextureMeshVisual;
exports.UnitsImageVisual = UnitsImageVisual;
const structure_1 = require("../../mol-model/structure");
const visual_1 = require("../visual");
const geometry_1 = require("../../mol-geo/geometry/geometry");
const theme_1 = require("../../mol-theme/theme");
const common_1 = require("./visual/util/common");
const render_object_1 = require("../../mol-gl/render-object");
const loci_1 = require("../../mol-model/loci");
const int_1 = require("../../mol-data/int");
const util_1 = require("../util");
const color_1 = require("../../mol-theme/color");
const marker_data_1 = require("../../mol-geo/geometry/marker-data");
const marker_action_1 = require("../../mol-util/marker-action");
const mol_util_1 = require("../../mol-util");
const size_data_1 = require("../../mol-geo/geometry/size-data");
const color_data_1 = require("../../mol-geo/geometry/color-data");
const mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
const size_1 = require("../../mol-theme/size");
const spheres_1 = require("../../mol-geo/geometry/spheres/spheres");
const cylinders_1 = require("../../mol-geo/geometry/cylinders/cylinders");
const points_1 = require("../../mol-geo/geometry/points/points");
const lines_1 = require("../../mol-geo/geometry/lines/lines");
const text_1 = require("../../mol-geo/geometry/text/text");
const direct_volume_1 = require("../../mol-geo/geometry/direct-volume/direct-volume");
const texture_mesh_1 = require("../../mol-geo/geometry/texture-mesh/texture-mesh");
const image_1 = require("../../mol-geo/geometry/image/image");
const params_1 = require("./params");
const type_helpers_1 = require("../../mol-util/type-helpers");
function createUnitsRenderObject(structureGroup, geometry, locationIt, theme, props, materialId) {
    const { createValues, createRenderableState } = geometry_1.Geometry.getUtils(geometry);
    const transform = (0, common_1.createUnitsTransform)(structureGroup, props.includeParent, geometry.boundingSphere, props.cellSize, props.batchSize);
    const values = createValues(geometry, transform, locationIt, theme, props);
    const state = createRenderableState(props);
    return (0, render_object_1.createRenderObject)(geometry.kind, values, state, materialId);
}
function UnitsVisual(builder, materialId) {
    const { defaultProps, createGeometry, createLocationIterator, getLoci, eachLocation, setUpdateState, initUpdateState, mustRecreate, processValues, dispose } = builder;
    const { createEmpty: createEmptyGeometry, updateValues, updateBoundingSphere, updateRenderableState, createPositionIterator } = builder.geometryUtils;
    const updateState = util_1.VisualUpdateState.create();
    const previousMark = { loci: loci_1.EmptyLoci, action: marker_action_1.MarkerAction.None, status: -1 };
    let renderObject;
    let newProps = Object.assign({}, defaultProps);
    let newTheme = theme_1.Theme.createEmpty();
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
        util_1.VisualUpdateState.reset(updateState);
        if (!renderObject || !currentStructureGroup) {
            initUpdateState === null || initUpdateState === void 0 ? void 0 : initUpdateState(updateState, newProps, newTheme, newStructureGroup);
            // console.log('create new');
            updateState.createNew = true;
            updateState.createGeometry = true;
            return;
        }
        setUpdateState(updateState, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
        if (!structure_1.Structure.areHierarchiesEqual(currentStructureGroup.structure, newStructureGroup.structure)) {
            // console.log('new hierarchy');
            updateState.updateTransform = true;
            updateState.updateColor = true;
            updateState.updateSize = true;
        }
        if (!color_1.ColorTheme.areEqual(newTheme.color, currentTheme.color)) {
            // console.log('new colorTheme');
            updateState.updateColor = true;
        }
        if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size)) {
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
        if (!(0, mol_util_1.deepEqual)(newProps.unitKinds, currentProps.unitKinds)) {
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
        if (!structure_1.Unit.areOperatorsEqual(newUnit, currentUnit)) {
            // console.log('new operators');
            updateState.updateTransform = true;
        }
        if (!structure_1.Unit.areConformationsEqual(newUnit, currentUnit)) {
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
                    (0, marker_data_1.createMarkers)(instanceCount, 'instance', renderObject.values);
                }
                else {
                    (0, marker_data_1.createMarkers)(instanceCount * groupCount, 'groupInstance', renderObject.values);
                }
            }
            if (updateState.updateMatrix) {
                // console.log('update matrix');
                (0, common_1.createUnitsTransform)(newStructureGroup, newProps.includeParent, (newGeometry === null || newGeometry === void 0 ? void 0 : newGeometry.boundingSphere) || renderObject.values.invariantBoundingSphere.ref.value, newProps.cellSize, newProps.batchSize, renderObject.values);
                if ('lodLevels' in renderObject.values) {
                    // to trigger `uLod` update in `renderable.cull`
                    mol_util_1.ValueCell.update(renderObject.values.lodLevels, renderObject.values.lodLevels.ref.value);
                }
            }
            if (updateState.createGeometry) {
                // console.log('update geometry');
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
                    // console.log('update size');
                    (0, size_data_1.createSizes)(locationIt, newTheme.size, renderObject.values);
                }
            }
            if (updateState.updateColor) {
                // console.log('update color');
                (0, color_data_1.createColors)(locationIt, positionIt, newTheme.color, renderObject.values);
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
        return (0, common_1.includesUnitKind)(props.unitKinds, unit)
            ? createGeometry(ctx, unit, structure, theme, props, geometry)
            : createEmptyGeometry(geometry);
    }
    function lociIsSuperset(loci) {
        if ((0, loci_1.isEveryLoci)(loci))
            return true;
        if (structure_1.Structure.isLoci(loci) && structure_1.Structure.areRootsEquivalent(loci.structure, currentStructureGroup.structure))
            return true;
        if (structure_1.StructureElement.Loci.is(loci) && structure_1.Structure.areRootsEquivalent(loci.structure, currentStructureGroup.structure)) {
            if (structure_1.StructureElement.Loci.isWholeStructure(loci))
                return true;
        }
        return false;
    }
    function eachInstance(loci, structureGroup, apply) {
        let changed = false;
        if (structure_1.Bond.isLoci(loci)) {
            const { structure, group } = structureGroup;
            if (!structure_1.Structure.areEquivalent(loci.structure, structure))
                return false;
            for (const b of loci.bonds) {
                if (b.aUnit !== b.bUnit)
                    continue;
                const unitIdx = group.unitIndexMap.get(b.aUnit.id);
                if (unitIdx !== undefined) {
                    if (apply(int_1.Interval.ofSingleton(unitIdx)))
                        changed = true;
                }
            }
        }
        else if (structure_1.StructureElement.Loci.is(loci)) {
            const { structure, group } = structureGroup;
            if (!structure_1.Structure.areEquivalent(loci.structure, structure))
                return false;
            for (const e of loci.elements) {
                const unitIdx = group.unitIndexMap.get(e.unit.id);
                if (unitIdx !== undefined) {
                    if (apply(int_1.Interval.ofSingleton(unitIdx)))
                        changed = true;
                }
            }
        }
        return changed;
    }
    function lociApply(loci, apply, isMarking) {
        if (lociIsSuperset(loci)) {
            if (currentProps.instanceGranularity) {
                return apply(int_1.Interval.ofBounds(0, locationIt.instanceCount));
            }
            else {
                return apply(int_1.Interval.ofBounds(0, locationIt.groupCount * locationIt.instanceCount));
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
                if ((0, type_helpers_1.isPromiseLike)(newGeometry)) {
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
            return renderObject ? getLoci(pickingId, currentStructureGroup, renderObject.id) : loci_1.EmptyLoci;
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
            if (structure_1.StructureElement.Loci.is(loci)) {
                hasInvariantId = false;
                const { invariantId } = currentStructureGroup.group.units[0];
                for (const e of loci.elements) {
                    if (e.unit.invariantId === invariantId) {
                        hasInvariantId = true;
                        break;
                    }
                }
            }
            return hasInvariantId ? visual_1.Visual.mark(renderObject, loci, action, lociApply, previousMark) : false;
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
        setOverpaint(overpaint, webgl) {
            const smoothing = { geometry, props: currentProps, webgl };
            visual_1.Visual.setOverpaint(renderObject, overpaint, lociApply, true, smoothing);
        },
        setTransparency(transparency, webgl) {
            const smoothing = { geometry, props: currentProps, webgl };
            visual_1.Visual.setTransparency(renderObject, transparency, lociApply, true, smoothing);
        },
        setEmissive(emissive, webgl) {
            const smoothing = { geometry, props: currentProps, webgl };
            visual_1.Visual.setEmissive(renderObject, emissive, lociApply, true, smoothing);
        },
        setSubstance(substance, webgl) {
            const smoothing = { geometry, props: currentProps, webgl };
            visual_1.Visual.setSubstance(renderObject, substance, lociApply, true, smoothing);
        },
        setClipping(clipping) {
            visual_1.Visual.setClipping(renderObject, clipping, lociApply, true);
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
// mesh
exports.UnitsMeshParams = { ...params_1.StructureMeshParams, ...params_1.StructureParams };
function UnitsMeshVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: mesh_1.Mesh.Utils
    }, materialId);
}
// spheres
exports.UnitsSpheresParams = { ...params_1.StructureSpheresParams, ...params_1.StructureParams };
function UnitsSpheresVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: spheres_1.Spheres.Utils
    }, materialId);
}
// cylinders
exports.UnitsCylindersParams = { ...params_1.StructureCylindersParams, ...params_1.StructureParams };
function UnitsCylindersVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: cylinders_1.Cylinders.Utils
    }, materialId);
}
// points
exports.UnitsPointsParams = { ...params_1.StructurePointsParams, ...params_1.StructureParams };
function UnitsPointsVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: points_1.Points.Utils
    }, materialId);
}
// lines
exports.UnitsLinesParams = { ...params_1.StructureLinesParams, ...params_1.StructureParams };
function UnitsLinesVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: lines_1.Lines.Utils
    }, materialId);
}
// text
exports.UnitsTextParams = { ...params_1.StructureTextParams, ...params_1.StructureParams };
function UnitsTextVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
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
        geometryUtils: text_1.Text.Utils
    }, materialId);
}
// direct-volume
exports.UnitsDirectVolumeParams = { ...params_1.StructureDirectVolumeParams, ...params_1.StructureParams };
function UnitsDirectVolumeVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: direct_volume_1.DirectVolume.Utils
    }, materialId);
}
// texture-mesh
exports.UnitsTextureMeshParams = { ...params_1.StructureTextureMeshParams, ...params_1.StructureParams };
function UnitsTextureMeshVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: texture_mesh_1.TextureMesh.Utils
    }, materialId);
}
// image
exports.UnitsImageParams = { ...params_1.StructureImageParams, ...params_1.StructureParams };
function UnitsImageVisual(builder, materialId) {
    return UnitsVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: image_1.Image.Utils
    }, materialId);
}
