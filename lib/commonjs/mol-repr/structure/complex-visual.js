"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplexImageParams = exports.ComplexTextureMeshParams = exports.ComplexDirectVolumeParams = exports.ComplexTextParams = exports.ComplexLinesParams = exports.ComplexPointsParams = exports.ComplexCylindersParams = exports.ComplexSpheresParams = exports.ComplexMeshParams = void 0;
exports.ComplexVisual = ComplexVisual;
exports.ComplexMeshVisual = ComplexMeshVisual;
exports.ComplexSpheresVisual = ComplexSpheresVisual;
exports.ComplexCylindersVisual = ComplexCylindersVisual;
exports.ComplexPointsVisual = ComplexPointsVisual;
exports.ComplexLinesVisual = ComplexLinesVisual;
exports.ComplexTextVisual = ComplexTextVisual;
exports.ComplexDirectVolumeVisual = ComplexDirectVolumeVisual;
exports.ComplexTextureMeshVisual = ComplexTextureMeshVisual;
exports.ComplexImageVisual = ComplexImageVisual;
const visual_1 = require("../visual");
const structure_1 = require("../../mol-model/structure");
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
const marker_action_1 = require("../../mol-util/marker-action");
const mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
const cylinders_1 = require("../../mol-geo/geometry/cylinders/cylinders");
const lines_1 = require("../../mol-geo/geometry/lines/lines");
const text_1 = require("../../mol-geo/geometry/text/text");
const size_1 = require("../../mol-theme/size");
const direct_volume_1 = require("../../mol-geo/geometry/direct-volume/direct-volume");
const marker_data_1 = require("../../mol-geo/geometry/marker-data");
const params_1 = require("./params");
const texture_mesh_1 = require("../../mol-geo/geometry/texture-mesh/texture-mesh");
const type_helpers_1 = require("../../mol-util/type-helpers");
const spheres_1 = require("../../mol-geo/geometry/spheres/spheres");
const points_1 = require("../../mol-geo/geometry/points/points");
const image_1 = require("../../mol-geo/geometry/image/image");
function createComplexRenderObject(structure, geometry, locationIt, theme, props, materialId) {
    const { createValues, createRenderableState } = geometry_1.Geometry.getUtils(geometry);
    const transform = (0, transform_data_1.createIdentityTransform)();
    const values = createValues(geometry, transform, locationIt, theme, props);
    const state = createRenderableState(props);
    return (0, render_object_1.createRenderObject)(geometry.kind, values, state, materialId);
}
function ComplexVisual(builder, materialId) {
    const { defaultProps, createGeometry, createLocationIterator, getLoci, eachLocation, setUpdateState, mustRecreate, processValues, dispose } = builder;
    const { updateValues, updateBoundingSphere, updateRenderableState, createPositionIterator } = builder.geometryUtils;
    const updateState = util_1.VisualUpdateState.create();
    const previousMark = { loci: loci_1.EmptyLoci, action: marker_action_1.MarkerAction.None, status: -1 };
    let renderObject;
    let newProps;
    let newTheme;
    let newStructure;
    let currentProps = Object.assign({}, defaultProps);
    let currentTheme = theme_1.Theme.createEmpty();
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
        util_1.VisualUpdateState.reset(updateState);
        if (!renderObject || !currentStructure) {
            updateState.createNew = true;
            updateState.createGeometry = true;
            return;
        }
        setUpdateState(updateState, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
        if (!structure_1.Structure.areEquivalent(newStructure, currentStructure)) {
            updateState.createGeometry = true;
        }
        if (!structure_1.Structure.areHierarchiesEqual(newStructure, currentStructure)) {
            updateState.updateTransform = true;
            updateState.createGeometry = true;
        }
        if (!color_1.ColorTheme.areEqual(theme.color, currentTheme.color)) {
            updateState.updateColor = true;
        }
        if (!size_1.SizeTheme.areEqual(theme.size, currentTheme.size)) {
            updateState.updateSize = true;
        }
        if (!(0, mol_util_1.deepEqual)(newProps.unitKinds, currentProps.unitKinds)) {
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
                    (0, marker_data_1.createMarkers)(instanceCount, 'instance', renderObject.values);
                }
                else {
                    (0, marker_data_1.createMarkers)(instanceCount * groupCount, 'groupInstance', renderObject.values);
                }
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
                positionIt = createPositionIterator(geometry, renderObject.values);
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
        currentStructure = newStructure;
        if (newGeometry) {
            geometry = newGeometry;
            geometryVersion += 1;
        }
    }
    function lociIsSuperset(loci) {
        if ((0, loci_1.isEveryLoci)(loci))
            return true;
        if (structure_1.Structure.isLoci(loci) && structure_1.Structure.areRootsEquivalent(loci.structure, currentStructure))
            return true;
        if (structure_1.StructureElement.Loci.is(loci) && structure_1.Structure.areRootsEquivalent(loci.structure, currentStructure)) {
            if (structure_1.StructureElement.Loci.isWholeStructure(loci))
                return true;
        }
        return false;
    }
    function eachInstance(loci, structure, apply) {
        let changed = false;
        if (!structure_1.StructureElement.Loci.is(loci) && !structure_1.Bond.isLoci(loci))
            return false;
        if (!structure_1.Structure.areEquivalent(loci.structure, structure))
            return false;
        if (apply(int_1.Interval.ofSingleton(0)))
            changed = true;
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
            return renderObject ? getLoci(pickingId, currentStructure, renderObject.id) : loci_1.EmptyLoci;
        },
        eachLocation(cb) {
            locationIt.reset();
            while (locationIt.hasNext) {
                const { location, isSecondary } = locationIt.move();
                cb(location, isSecondary);
            }
        },
        mark(loci, action) {
            return visual_1.Visual.mark(renderObject, loci, action, lociApply, previousMark);
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
exports.ComplexMeshParams = { ...params_1.StructureMeshParams, ...params_1.StructureParams };
function ComplexMeshVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: mesh_1.Mesh.Utils
    }, materialId);
}
// spheres
exports.ComplexSpheresParams = { ...params_1.StructureSpheresParams, ...params_1.StructureParams };
function ComplexSpheresVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: spheres_1.Spheres.Utils
    }, materialId);
}
// cylinders
exports.ComplexCylindersParams = { ...params_1.StructureCylindersParams, ...params_1.StructureParams };
function ComplexCylindersVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: cylinders_1.Cylinders.Utils
    }, materialId);
}
// points
exports.ComplexPointsParams = { ...params_1.StructurePointsParams, ...params_1.StructureParams };
function ComplexPointsVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: points_1.Points.Utils
    }, materialId);
}
// lines
exports.ComplexLinesParams = { ...params_1.StructureLinesParams, ...params_1.StructureParams };
function ComplexLinesVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.updateSize = true;
        },
        geometryUtils: lines_1.Lines.Utils
    }, materialId);
}
// text
exports.ComplexTextParams = { ...params_1.StructureTextParams, ...params_1.StructureParams };
function ComplexTextVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
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
exports.ComplexDirectVolumeParams = { ...params_1.StructureDirectVolumeParams, ...params_1.StructureParams };
function ComplexDirectVolumeVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: direct_volume_1.DirectVolume.Utils
    }, materialId);
}
// texture-mesh
exports.ComplexTextureMeshParams = { ...params_1.StructureTextureMeshParams, ...params_1.StructureParams };
function ComplexTextureMeshVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: texture_mesh_1.TextureMesh.Utils
    }, materialId);
}
// image
exports.ComplexImageParams = { ...params_1.StructureImageParams, ...params_1.StructureParams };
function ComplexImageVisual(builder, materialId) {
    return ComplexVisual({
        ...builder,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            builder.setUpdateState(state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure);
            if (!size_1.SizeTheme.areEqual(newTheme.size, currentTheme.size))
                state.createGeometry = true;
        },
        geometryUtils: image_1.Image.Utils
    }, materialId);
}
