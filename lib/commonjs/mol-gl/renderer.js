"use strict";
/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = exports.RendererParams = exports.MarkingType = exports.PickType = void 0;
const util_1 = require("../mol-canvas3d/camera/util");
const linear_algebra_1 = require("../mol-math/linear-algebra");
const color_1 = require("../mol-util/color");
const mol_util_1 = require("../mol-util");
const param_definition_1 = require("../mol-util/param-definition");
const misc_1 = require("../mol-math/misc");
const array_1 = require("../mol-util/array");
const interpolate_1 = require("../mol-math/interpolate");
const debug_1 = require("../mol-util/debug");
const frustum3d_1 = require("../mol-math/geometry/primitives/frustum3d");
const plane3d_1 = require("../mol-math/geometry/primitives/plane3d");
var PickType;
(function (PickType) {
    PickType[PickType["None"] = 0] = "None";
    PickType[PickType["Object"] = 1] = "Object";
    PickType[PickType["Instance"] = 2] = "Instance";
    PickType[PickType["Group"] = 3] = "Group";
})(PickType || (exports.PickType = PickType = {}));
var MarkingType;
(function (MarkingType) {
    MarkingType[MarkingType["None"] = 0] = "None";
    MarkingType[MarkingType["Depth"] = 1] = "Depth";
    MarkingType[MarkingType["Mask"] = 2] = "Mask";
})(MarkingType || (exports.MarkingType = MarkingType = {}));
exports.RendererParams = {
    backgroundColor: param_definition_1.ParamDefinition.Color((0, color_1.Color)(0x000000), { description: 'Background color of the 3D canvas' }),
    pickingAlphaThreshold: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0.0, max: 1.0, step: 0.01 }, { description: 'The minimum opacity value needed for an object to be pickable.' }),
    interiorDarkening: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0.0, max: 1.0, step: 0.01 }),
    interiorColorFlag: param_definition_1.ParamDefinition.Boolean(true, { label: 'Use Interior Color' }),
    interiorColor: param_definition_1.ParamDefinition.Color(color_1.Color.fromNormalizedRgb(0.3, 0.3, 0.3)),
    colorMarker: param_definition_1.ParamDefinition.Boolean(true, { description: 'Enable color marker' }),
    highlightColor: param_definition_1.ParamDefinition.Color(color_1.Color.fromNormalizedRgb(1.0, 0.4, 0.6)),
    selectColor: param_definition_1.ParamDefinition.Color(color_1.Color.fromNormalizedRgb(0.2, 1.0, 0.1)),
    dimColor: param_definition_1.ParamDefinition.Color(color_1.Color.fromNormalizedRgb(1.0, 1.0, 1.0)),
    highlightStrength: param_definition_1.ParamDefinition.Numeric(0.3, { min: 0.0, max: 1.0, step: 0.1 }),
    selectStrength: param_definition_1.ParamDefinition.Numeric(0.3, { min: 0.0, max: 1.0, step: 0.1 }),
    dimStrength: param_definition_1.ParamDefinition.Numeric(0.0, { min: 0.0, max: 1.0, step: 0.1 }),
    markerPriority: param_definition_1.ParamDefinition.Select(1, [[1, 'Highlight'], [2, 'Select']]),
    xrayEdgeFalloff: param_definition_1.ParamDefinition.Numeric(1, { min: 0.0, max: 3.0, step: 0.1 }),
    celSteps: param_definition_1.ParamDefinition.Numeric(5, { min: 2, max: 16, step: 1 }),
    exposure: param_definition_1.ParamDefinition.Numeric(1, { min: 0.0, max: 3.0, step: 0.01 }),
    light: param_definition_1.ParamDefinition.ObjectList({
        inclination: param_definition_1.ParamDefinition.Numeric(150, { min: 0, max: 180, step: 1 }),
        azimuth: param_definition_1.ParamDefinition.Numeric(320, { min: 0, max: 360, step: 1 }),
        color: param_definition_1.ParamDefinition.Color(color_1.Color.fromNormalizedRgb(1.0, 1.0, 1.0)),
        intensity: param_definition_1.ParamDefinition.Numeric(0.6, { min: 0.0, max: 5.0, step: 0.01 }),
    }, o => color_1.Color.toHexString(o.color), { defaultValue: [{
                inclination: 150,
                azimuth: 320,
                color: color_1.Color.fromNormalizedRgb(1.0, 1.0, 1.0),
                intensity: 0.6
            }] }),
    ambientColor: param_definition_1.ParamDefinition.Color(color_1.Color.fromNormalizedRgb(1.0, 1.0, 1.0)),
    ambientIntensity: param_definition_1.ParamDefinition.Numeric(0.4, { min: 0.0, max: 2.0, step: 0.01 }),
};
const tmpDir = (0, linear_algebra_1.Vec3)();
const tmpColor = (0, linear_algebra_1.Vec3)();
function getLight(props, light) {
    const count = props.length;
    const { direction, color } = light || {
        direction: (new Array(count * 3)).fill(0),
        color: (new Array(count * 3)).fill(0),
    };
    for (let i = 0; i < count; ++i) {
        const p = props[i];
        linear_algebra_1.Vec3.directionFromSpherical(tmpDir, (0, misc_1.degToRad)(p.inclination), (0, misc_1.degToRad)(p.azimuth), 1);
        linear_algebra_1.Vec3.toArray(tmpDir, direction, i * 3);
        linear_algebra_1.Vec3.scale(tmpColor, color_1.Color.toVec3Normalized(tmpColor, p.color), p.intensity);
        linear_algebra_1.Vec3.toArray(tmpColor, color, i * 3);
    }
    return { count, direction, color };
}
var Renderer;
(function (Renderer) {
    function create(ctx, props = {}) {
        const { gl, state, stats } = ctx;
        const p = param_definition_1.ParamDefinition.merge(exports.RendererParams, param_definition_1.ParamDefinition.getDefaultValues(exports.RendererParams), props);
        const light = getLight(p.light);
        const viewport = (0, util_1.Viewport)();
        const drawingBufferSize = linear_algebra_1.Vec2.create(gl.drawingBufferWidth, gl.drawingBufferHeight);
        const bgColor = color_1.Color.toVec3Normalized((0, linear_algebra_1.Vec3)(), p.backgroundColor);
        let transparentBackground = false;
        let isOccluded = null;
        const emptyDepthTexture = ctx.resources.texture('image-uint8', 'rgba', 'ubyte', 'nearest');
        emptyDepthTexture.define(1, 1);
        emptyDepthTexture.load({ array: new Uint8Array([255, 255, 255, 255]), width: 1, height: 1 });
        const sharedTexturesList = [
            ['tDepth', emptyDepthTexture]
        ];
        const view = (0, linear_algebra_1.Mat4)();
        const invView = (0, linear_algebra_1.Mat4)();
        const modelView = (0, linear_algebra_1.Mat4)();
        const invModelView = (0, linear_algebra_1.Mat4)();
        const invProjection = (0, linear_algebra_1.Mat4)();
        const modelViewProjection = (0, linear_algebra_1.Mat4)();
        const invModelViewProjection = (0, linear_algebra_1.Mat4)();
        const cameraDir = (0, linear_algebra_1.Vec3)();
        const cameraPosition = (0, linear_algebra_1.Vec3)();
        const cameraPlane = (0, plane3d_1.Plane3D)();
        const viewOffset = (0, linear_algebra_1.Vec2)();
        const frustum = (0, frustum3d_1.Frustum3D)();
        const ambientColor = (0, linear_algebra_1.Vec3)();
        linear_algebra_1.Vec3.scale(ambientColor, color_1.Color.toArrayNormalized(p.ambientColor, ambientColor, 0), p.ambientIntensity);
        const globalUniforms = {
            uDrawId: mol_util_1.ValueCell.create(0),
            uModel: mol_util_1.ValueCell.create(linear_algebra_1.Mat4.identity()),
            uView: mol_util_1.ValueCell.create(view),
            uInvView: mol_util_1.ValueCell.create(invView),
            uModelView: mol_util_1.ValueCell.create(modelView),
            uInvModelView: mol_util_1.ValueCell.create(invModelView),
            uInvProjection: mol_util_1.ValueCell.create(invProjection),
            uProjection: mol_util_1.ValueCell.create((0, linear_algebra_1.Mat4)()),
            uModelViewProjection: mol_util_1.ValueCell.create(modelViewProjection),
            uInvModelViewProjection: mol_util_1.ValueCell.create(invModelViewProjection),
            uIsOrtho: mol_util_1.ValueCell.create(1),
            uViewOffset: mol_util_1.ValueCell.create(viewOffset),
            uPixelRatio: mol_util_1.ValueCell.create(ctx.pixelRatio),
            uViewport: mol_util_1.ValueCell.create(util_1.Viewport.toVec4((0, linear_algebra_1.Vec4)(), viewport)),
            uDrawingBufferSize: mol_util_1.ValueCell.create(drawingBufferSize),
            uCameraPosition: mol_util_1.ValueCell.create(cameraPosition),
            uCameraDir: mol_util_1.ValueCell.create(cameraDir),
            uCameraPlane: mol_util_1.ValueCell.create(plane3d_1.Plane3D.toArray(cameraPlane, (0, linear_algebra_1.Vec4)(), 0)),
            uNear: mol_util_1.ValueCell.create(1),
            uFar: mol_util_1.ValueCell.create(10000),
            uFog: mol_util_1.ValueCell.create(true),
            uFogNear: mol_util_1.ValueCell.create(1),
            uFogFar: mol_util_1.ValueCell.create(10000),
            uFogColor: mol_util_1.ValueCell.create(bgColor),
            uRenderMask: mol_util_1.ValueCell.create(0),
            uMarkingDepthTest: mol_util_1.ValueCell.create(false),
            uPickType: mol_util_1.ValueCell.create(PickType.None),
            uMarkingType: mol_util_1.ValueCell.create(MarkingType.None),
            uTransparentBackground: mol_util_1.ValueCell.create(false),
            uLightDirection: mol_util_1.ValueCell.create(light.direction),
            uLightColor: mol_util_1.ValueCell.create(light.color),
            uAmbientColor: mol_util_1.ValueCell.create(ambientColor),
            uPickingAlphaThreshold: mol_util_1.ValueCell.create(p.pickingAlphaThreshold),
            uInteriorDarkening: mol_util_1.ValueCell.create(p.interiorDarkening),
            uInteriorColorFlag: mol_util_1.ValueCell.create(p.interiorColorFlag),
            uInteriorColor: mol_util_1.ValueCell.create(color_1.Color.toVec3Normalized((0, linear_algebra_1.Vec3)(), p.interiorColor)),
            uHighlightColor: mol_util_1.ValueCell.create(color_1.Color.toVec3Normalized((0, linear_algebra_1.Vec3)(), p.highlightColor)),
            uSelectColor: mol_util_1.ValueCell.create(color_1.Color.toVec3Normalized((0, linear_algebra_1.Vec3)(), p.selectColor)),
            uDimColor: mol_util_1.ValueCell.create(color_1.Color.toVec3Normalized((0, linear_algebra_1.Vec3)(), p.dimColor)),
            uHighlightStrength: mol_util_1.ValueCell.create(p.highlightStrength),
            uSelectStrength: mol_util_1.ValueCell.create(p.selectStrength),
            uDimStrength: mol_util_1.ValueCell.create(p.dimStrength),
            uMarkerPriority: mol_util_1.ValueCell.create(p.markerPriority),
            uMarkerAverage: mol_util_1.ValueCell.create(0),
            uXrayEdgeFalloff: mol_util_1.ValueCell.create(p.xrayEdgeFalloff),
            uCelSteps: mol_util_1.ValueCell.create(p.celSteps),
            uExposure: mol_util_1.ValueCell.create(p.exposure),
        };
        const globalUniformList = Object.entries(globalUniforms);
        let globalUniformsNeedUpdate = true;
        const renderObject = (r, variant, flag) => {
            var _a, _b, _c;
            if (r.state.disposed || !r.state.visible || (!r.state.pickable && variant === 'pick')) {
                return;
            }
            if (!r.values.drawCount.ref.value) {
                return;
            }
            if (!frustum3d_1.Frustum3D.intersectsSphere3D(frustum, r.values.boundingSphere.ref.value)) {
                return;
            }
            const [minDistance, maxDistance] = r.values.uLod.ref.value;
            if (minDistance !== 0 || maxDistance !== 0) {
                const { center, radius } = r.values.boundingSphere.ref.value;
                const d = plane3d_1.Plane3D.distanceToPoint(cameraPlane, center);
                if (d + radius < minDistance)
                    return;
                if (d - radius > maxDistance)
                    return;
            }
            if (isOccluded !== null && isOccluded(r.values.boundingSphere.ref.value)) {
                return;
            }
            const hasInstanceGrid = r.values.instanceGrid.ref.value.cellSize > 0;
            const hasMultipleInstances = r.values.uInstanceCount.ref.value > 1;
            if (hasInstanceGrid && (hasMultipleInstances || r.values.lodLevels)) {
                r.cull(cameraPlane, frustum, isOccluded, ctx.stats);
            }
            else {
                r.uncull();
            }
            let needUpdate = false;
            if (r.values.dLightCount.ref.value !== light.count) {
                mol_util_1.ValueCell.update(r.values.dLightCount, light.count);
                needUpdate = true;
            }
            if (r.values.dColorMarker.ref.value !== p.colorMarker) {
                mol_util_1.ValueCell.update(r.values.dColorMarker, p.colorMarker);
                needUpdate = true;
            }
            if (needUpdate)
                r.update();
            const program = r.getProgram(variant);
            if (state.currentProgramId !== program.id) {
                // console.log('new program')
                globalUniformsNeedUpdate = true;
                program.use();
            }
            if (globalUniformsNeedUpdate) {
                // console.log('globalUniformsNeedUpdate')
                program.setUniforms(globalUniformList);
                program.bindTextures(sharedTexturesList, 0);
                globalUniformsNeedUpdate = false;
            }
            if (r.values.dGeometryType.ref.value === 'directVolume') {
                if (variant !== 'color') {
                    return; // only color supported
                }
                // culling done in fragment shader
                state.disable(gl.CULL_FACE);
                state.frontFace(gl.CCW);
            }
            else if (flag === 1 /* Flag.BlendedFront */) {
                state.enable(gl.CULL_FACE);
                if ((_a = r.values.dFlipSided) === null || _a === void 0 ? void 0 : _a.ref.value) {
                    state.frontFace(gl.CW);
                    state.cullFace(gl.FRONT);
                }
                else {
                    state.frontFace(gl.CCW);
                    state.cullFace(gl.BACK);
                }
            }
            else if (flag === 2 /* Flag.BlendedBack */) {
                state.enable(gl.CULL_FACE);
                if ((_b = r.values.dFlipSided) === null || _b === void 0 ? void 0 : _b.ref.value) {
                    state.frontFace(gl.CW);
                    state.cullFace(gl.BACK);
                }
                else {
                    state.frontFace(gl.CCW);
                    state.cullFace(gl.FRONT);
                }
            }
            else {
                if (r.values.uDoubleSided) {
                    if (r.values.uDoubleSided.ref.value || r.values.hasReflection.ref.value) {
                        state.disable(gl.CULL_FACE);
                    }
                    else {
                        state.enable(gl.CULL_FACE);
                    }
                }
                else {
                    // webgl default
                    state.disable(gl.CULL_FACE);
                }
                if ((_c = r.values.dFlipSided) === null || _c === void 0 ? void 0 : _c.ref.value) {
                    state.frontFace(gl.CW);
                    state.cullFace(gl.FRONT);
                }
                else {
                    // webgl default
                    state.frontFace(gl.CCW);
                    state.cullFace(gl.BACK);
                }
            }
            r.render(variant, sharedTexturesList.length);
        };
        const update = (camera, scene) => {
            mol_util_1.ValueCell.update(globalUniforms.uView, camera.view);
            mol_util_1.ValueCell.update(globalUniforms.uInvView, linear_algebra_1.Mat4.invert(invView, camera.view));
            mol_util_1.ValueCell.update(globalUniforms.uProjection, camera.projection);
            mol_util_1.ValueCell.update(globalUniforms.uInvProjection, linear_algebra_1.Mat4.invert(invProjection, camera.projection));
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uIsOrtho, camera.state.mode === 'orthographic' ? 1 : 0);
            mol_util_1.ValueCell.update(globalUniforms.uViewOffset, camera.viewOffset.enabled ? linear_algebra_1.Vec2.set(viewOffset, camera.viewOffset.offsetX * 16, camera.viewOffset.offsetY * 16) : linear_algebra_1.Vec2.set(viewOffset, 0, 0));
            mol_util_1.ValueCell.update(globalUniforms.uCameraPosition, linear_algebra_1.Vec3.copy(cameraPosition, camera.state.position));
            mol_util_1.ValueCell.update(globalUniforms.uCameraDir, linear_algebra_1.Vec3.normalize(cameraDir, linear_algebra_1.Vec3.sub(cameraDir, camera.state.target, camera.state.position)));
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uFar, camera.far);
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uNear, camera.near);
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uFog, camera.state.fog > 0);
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uFogFar, camera.fogFar);
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uFogNear, camera.fogNear);
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uTransparentBackground, transparentBackground);
            frustum3d_1.Frustum3D.fromProjectionMatrix(frustum, camera.projectionView);
            plane3d_1.Plane3D.copy(cameraPlane, frustum[5 /* Frustum3D.PlaneIndex.Near */]);
            cameraPlane.constant -= plane3d_1.Plane3D.distanceToPoint(cameraPlane, cameraPosition);
            mol_util_1.ValueCell.update(globalUniforms.uCameraPlane, plane3d_1.Plane3D.toArray(cameraPlane, globalUniforms.uCameraPlane.ref.value, 0));
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uMarkerAverage, scene.markerAverage);
        };
        const updateInternal = (group, camera, depthTexture, renderMask, markingDepthTest) => {
            (0, array_1.arrayMapUpsert)(sharedTexturesList, 'tDepth', depthTexture || emptyDepthTexture);
            mol_util_1.ValueCell.update(globalUniforms.uModel, group.view);
            mol_util_1.ValueCell.update(globalUniforms.uModelView, linear_algebra_1.Mat4.mul(modelView, camera.view, group.view));
            mol_util_1.ValueCell.update(globalUniforms.uInvModelView, linear_algebra_1.Mat4.invert(invModelView, modelView));
            mol_util_1.ValueCell.update(globalUniforms.uModelViewProjection, linear_algebra_1.Mat4.mul(modelViewProjection, modelView, camera.projection));
            mol_util_1.ValueCell.update(globalUniforms.uInvModelViewProjection, linear_algebra_1.Mat4.invert(invModelViewProjection, modelViewProjection));
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uRenderMask, renderMask);
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uMarkingDepthTest, markingDepthTest);
            state.enable(gl.SCISSOR_TEST);
            state.colorMask(true, true, true, true);
            const { x, y, width, height } = viewport;
            state.viewport(x, y, width, height);
            state.scissor(x, y, width, height);
            globalUniformsNeedUpdate = true;
            state.currentRenderItemId = -1;
        };
        const checkOpaque = function (r) {
            var _a, _b, _c, _d;
            // uAlpha is updated in `r.render` so we need to recompute it here
            const alpha = (0, interpolate_1.clamp)(r.values.alpha.ref.value * r.state.alphaFactor, 0, 1);
            const xrayShaded = ((_a = r.values.dXrayShaded) === null || _a === void 0 ? void 0 : _a.ref.value) === 'on' || ((_b = r.values.dXrayShaded) === null || _b === void 0 ? void 0 : _b.ref.value) === 'inverted';
            return ((alpha === 1 &&
                r.values.transparencyAverage.ref.value !== 1 &&
                r.values.dGeometryType.ref.value !== 'directVolume' &&
                ((_c = r.values.dPointStyle) === null || _c === void 0 ? void 0 : _c.ref.value) !== 'fuzzy' &&
                !xrayShaded) || ((_d = r.values.dTransparentBackfaces) === null || _d === void 0 ? void 0 : _d.ref.value) === 'opaque');
        };
        const checkTransparent = function (r) {
            var _a, _b, _c;
            // uAlpha is updated in `r.render` so we need to recompute it here
            const alpha = (0, interpolate_1.clamp)(r.values.alpha.ref.value * r.state.alphaFactor, 0, 1);
            const xrayShaded = ((_a = r.values.dXrayShaded) === null || _a === void 0 ? void 0 : _a.ref.value) === 'on' || ((_b = r.values.dXrayShaded) === null || _b === void 0 ? void 0 : _b.ref.value) === 'inverted';
            return ((alpha < 1 && alpha !== 0) ||
                r.values.transparencyAverage.ref.value > 0 ||
                r.values.dGeometryType.ref.value === 'directVolume' ||
                ((_c = r.values.dPointStyle) === null || _c === void 0 ? void 0 : _c.ref.value) === 'fuzzy' ||
                r.values.dGeometryType.ref.value === 'text' ||
                r.values.dGeometryType.ref.value === 'image' ||
                xrayShaded);
        };
        const renderPick = (group, camera, variant, pickType) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderPick');
            state.disable(gl.BLEND);
            state.enable(gl.DEPTH_TEST);
            state.depthMask(true);
            updateInternal(group, camera, null, 0 /* Mask.All */, false);
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uPickType, pickType);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                if (!renderables[i].state.colorOnly) {
                    renderObject(renderables[i], variant, 0 /* Flag.None */);
                }
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderPick');
        };
        const renderDepth = (group, camera) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderDepth');
            state.disable(gl.BLEND);
            state.enable(gl.DEPTH_TEST);
            state.depthMask(true);
            updateInternal(group, camera, null, 0 /* Mask.All */, false);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                renderObject(renderables[i], 'depth', 0 /* Flag.None */);
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderDepth');
        };
        const renderDepthOpaque = (group, camera) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderDepthOpaque');
            state.disable(gl.BLEND);
            state.enable(gl.DEPTH_TEST);
            state.depthMask(true);
            updateInternal(group, camera, null, 1 /* Mask.Opaque */, false);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                const r = renderables[i];
                if (checkOpaque(r)) {
                    renderObject(r, 'depth', 0 /* Flag.None */);
                }
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderDepthOpaque');
        };
        const renderDepthOpaqueBack = (group, camera) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderDepthOpaqueBack');
            state.disable(gl.BLEND);
            state.enable(gl.DEPTH_TEST);
            state.depthMask(true);
            state.depthFunc(gl.GREATER);
            updateInternal(group, camera, null, 1 /* Mask.Opaque */, false);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                const r = renderables[i];
                if (checkOpaque(r)) {
                    renderObject(r, 'depth', 2 /* Flag.BlendedBack */);
                }
            }
            state.depthFunc(gl.LESS);
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderDepthOpaqueBack');
        };
        const renderDepthTransparent = (group, camera, depthTexture) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderDepthTransparent');
            state.disable(gl.BLEND);
            state.enable(gl.DEPTH_TEST);
            state.depthMask(true);
            updateInternal(group, camera, depthTexture, 2 /* Mask.Transparent */, false);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                const r = renderables[i];
                if (checkTransparent(r)) {
                    renderObject(r, 'depth', 0 /* Flag.None */);
                }
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderDepthTransparent');
        };
        const renderMarkingDepth = (group, camera) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderMarkingDepth');
            state.disable(gl.BLEND);
            state.enable(gl.DEPTH_TEST);
            state.depthMask(true);
            updateInternal(group, camera, null, 0 /* Mask.All */, false);
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uMarkingType, MarkingType.Depth);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                const r = renderables[i];
                const alpha = (0, interpolate_1.clamp)(r.values.alpha.ref.value * r.state.alphaFactor, 0, 1);
                if (alpha !== 0 && r.values.transparencyAverage.ref.value !== 1 && r.values.markerAverage.ref.value !== 1) {
                    renderObject(renderables[i], 'marking', 0 /* Flag.None */);
                }
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderMarkingDepth');
        };
        const renderMarkingMask = (group, camera, depthTexture) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderMarkingMask');
            state.disable(gl.BLEND);
            state.enable(gl.DEPTH_TEST);
            state.depthMask(true);
            updateInternal(group, camera, depthTexture, 0 /* Mask.All */, !!depthTexture);
            mol_util_1.ValueCell.updateIfChanged(globalUniforms.uMarkingType, MarkingType.Mask);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                const r = renderables[i];
                if (r.values.markerAverage.ref.value > 0) {
                    renderObject(renderables[i], 'marking', 0 /* Flag.None */);
                }
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderMarkingMask');
        };
        const renderEmissive = (group, camera) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderEmissive');
            state.disable(gl.BLEND);
            state.enable(gl.DEPTH_TEST);
            state.depthMask(true);
            updateInternal(group, camera, null, 1 /* Mask.Opaque */, false);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                const r = renderables[i];
                if (checkOpaque(r)) {
                    renderObject(r, 'emissive', 0 /* Flag.None */);
                }
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderEmissive');
        };
        const renderTracing = (group, camera) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderTracing');
            state.disable(gl.BLEND);
            state.enable(gl.DEPTH_TEST);
            state.depthMask(true);
            updateInternal(group, camera, null, 1 /* Mask.Opaque */, false);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                const r = renderables[i];
                if (checkOpaque(r)) {
                    renderObject(r, 'tracing', 0 /* Flag.None */);
                }
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderTracing');
        };
        const renderBlended = (scene, camera) => {
            if (scene.hasOpaque) {
                renderOpaque(scene, camera);
            }
            if (scene.opacityAverage < 1) {
                renderBlendedTransparent(scene, camera);
            }
        };
        const renderOpaque = (group, camera) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderOpaque');
            state.disable(gl.BLEND);
            state.enable(gl.DEPTH_TEST);
            state.depthMask(true);
            updateInternal(group, camera, null, 1 /* Mask.Opaque */, false);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                const r = renderables[i];
                if (checkOpaque(r)) {
                    renderObject(r, 'color', 0 /* Flag.None */);
                }
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderOpaque');
        };
        const renderBlendedTransparent = (group, camera) => {
            var _a, _b;
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderBlendedTransparent');
            if (transparentBackground) {
                state.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            }
            else {
                state.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            }
            state.enable(gl.BLEND);
            state.enable(gl.DEPTH_TEST);
            state.depthMask(false);
            updateInternal(group, camera, null, 2 /* Mask.Transparent */, false);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                const r = renderables[i];
                if (checkTransparent(r)) {
                    if ((_a = r.values.uDoubleSided) === null || _a === void 0 ? void 0 : _a.ref.value) {
                        // render frontfaces and backfaces separately to avoid artefacts
                        if (((_b = r.values.dTransparentBackfaces) === null || _b === void 0 ? void 0 : _b.ref.value) !== 'opaque') {
                            renderObject(r, 'color', 2 /* Flag.BlendedBack */);
                        }
                        renderObject(r, 'color', 1 /* Flag.BlendedFront */);
                    }
                    else {
                        renderObject(r, 'color', 0 /* Flag.None */);
                    }
                }
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderBlendedTransparent');
        };
        const renderVolume = (group, camera, depthTexture) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderVolume');
            state.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            state.enable(gl.BLEND);
            // depth test done manually in shader against `depthTexture`
            state.disable(gl.DEPTH_TEST);
            state.depthMask(false);
            updateInternal(group, camera, depthTexture, 2 /* Mask.Transparent */, false);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                const r = renderables[i];
                if (r.values.dGeometryType.ref.value === 'directVolume') {
                    renderObject(r, 'color', 0 /* Flag.None */);
                }
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderVolume');
        };
        const renderWboitTransparent = (group, camera, depthTexture) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderWboitTransparent');
            updateInternal(group, camera, depthTexture, 2 /* Mask.Transparent */, false);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                const r = renderables[i];
                if (checkTransparent(r)) {
                    renderObject(r, 'color', 0 /* Flag.None */);
                }
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderWboitTransparent');
        };
        const renderDpoitTransparent = (group, camera, depthTexture, dpoitTextures) => {
            if (debug_1.isTimingMode)
                ctx.timer.mark('Renderer.renderDpoitTransparent');
            state.enable(gl.BLEND);
            (0, array_1.arrayMapUpsert)(sharedTexturesList, 'tDpoitDepth', dpoitTextures.depth);
            (0, array_1.arrayMapUpsert)(sharedTexturesList, 'tDpoitFrontColor', dpoitTextures.frontColor);
            (0, array_1.arrayMapUpsert)(sharedTexturesList, 'tDpoitBackColor', dpoitTextures.backColor);
            updateInternal(group, camera, depthTexture, 2 /* Mask.Transparent */, false);
            const { renderables } = group;
            for (let i = 0, il = renderables.length; i < il; ++i) {
                const r = renderables[i];
                if (checkTransparent(r)) {
                    renderObject(r, 'color', 0 /* Flag.None */);
                }
            }
            if (debug_1.isTimingMode)
                ctx.timer.markEnd('Renderer.renderDpoitTransparent');
        };
        return {
            clear: (toBackgroundColor, ignoreTransparentBackground, forceToTransparency) => {
                state.enable(gl.SCISSOR_TEST);
                state.enable(gl.DEPTH_TEST);
                state.colorMask(true, true, true, true);
                state.depthMask(true);
                if (forceToTransparency || transparentBackground && !ignoreTransparentBackground) {
                    state.clearColor(0, 0, 0, 0);
                }
                else if (toBackgroundColor) {
                    state.clearColor(bgColor[0], bgColor[1], bgColor[2], 1);
                }
                else {
                    state.clearColor(1, 1, 1, 1);
                }
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            },
            clearDepth: (packed = false) => {
                state.enable(gl.SCISSOR_TEST);
                state.enable(gl.DEPTH_TEST);
                state.depthMask(true);
                if (packed) {
                    state.colorMask(true, true, true, true);
                    state.clearColor(1, 1, 1, 1);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                }
                else {
                    gl.clear(gl.DEPTH_BUFFER_BIT);
                }
            },
            update,
            renderPick,
            renderDepth,
            renderDepthOpaque,
            renderDepthOpaqueBack,
            renderDepthTransparent,
            renderMarkingDepth,
            renderMarkingMask,
            renderEmissive,
            renderTracing,
            renderBlended,
            renderOpaque,
            renderBlendedTransparent,
            renderVolume,
            renderWboitTransparent,
            renderDpoitTransparent,
            setProps: (props) => {
                if (props.backgroundColor !== undefined && props.backgroundColor !== p.backgroundColor) {
                    p.backgroundColor = props.backgroundColor;
                    color_1.Color.toVec3Normalized(bgColor, p.backgroundColor);
                    mol_util_1.ValueCell.update(globalUniforms.uFogColor, linear_algebra_1.Vec3.copy(globalUniforms.uFogColor.ref.value, bgColor));
                }
                if (props.pickingAlphaThreshold !== undefined && props.pickingAlphaThreshold !== p.pickingAlphaThreshold) {
                    p.pickingAlphaThreshold = props.pickingAlphaThreshold;
                    mol_util_1.ValueCell.update(globalUniforms.uPickingAlphaThreshold, p.pickingAlphaThreshold);
                }
                if (props.interiorDarkening !== undefined && props.interiorDarkening !== p.interiorDarkening) {
                    p.interiorDarkening = props.interiorDarkening;
                    mol_util_1.ValueCell.update(globalUniforms.uInteriorDarkening, p.interiorDarkening);
                }
                if (props.interiorColorFlag !== undefined && props.interiorColorFlag !== p.interiorColorFlag) {
                    p.interiorColorFlag = props.interiorColorFlag;
                    mol_util_1.ValueCell.update(globalUniforms.uInteriorColorFlag, p.interiorColorFlag);
                }
                if (props.interiorColor !== undefined && props.interiorColor !== p.interiorColor) {
                    p.interiorColor = props.interiorColor;
                    mol_util_1.ValueCell.update(globalUniforms.uInteriorColor, color_1.Color.toVec3Normalized(globalUniforms.uInteriorColor.ref.value, p.interiorColor));
                }
                if (props.colorMarker !== undefined && props.colorMarker !== p.colorMarker) {
                    p.colorMarker = props.colorMarker;
                }
                if (props.highlightColor !== undefined && props.highlightColor !== p.highlightColor) {
                    p.highlightColor = props.highlightColor;
                    mol_util_1.ValueCell.update(globalUniforms.uHighlightColor, color_1.Color.toVec3Normalized(globalUniforms.uHighlightColor.ref.value, p.highlightColor));
                }
                if (props.selectColor !== undefined && props.selectColor !== p.selectColor) {
                    p.selectColor = props.selectColor;
                    mol_util_1.ValueCell.update(globalUniforms.uSelectColor, color_1.Color.toVec3Normalized(globalUniforms.uSelectColor.ref.value, p.selectColor));
                }
                if (props.dimColor !== undefined && props.dimColor !== p.dimColor) {
                    p.dimColor = props.dimColor;
                    mol_util_1.ValueCell.update(globalUniforms.uDimColor, color_1.Color.toVec3Normalized(globalUniforms.uDimColor.ref.value, p.dimColor));
                }
                if (props.highlightStrength !== undefined && props.highlightStrength !== p.highlightStrength) {
                    p.highlightStrength = props.highlightStrength;
                    mol_util_1.ValueCell.update(globalUniforms.uHighlightStrength, p.highlightStrength);
                }
                if (props.selectStrength !== undefined && props.selectStrength !== p.selectStrength) {
                    p.selectStrength = props.selectStrength;
                    mol_util_1.ValueCell.update(globalUniforms.uSelectStrength, p.selectStrength);
                }
                if (props.dimStrength !== undefined && props.dimStrength !== p.dimStrength) {
                    p.dimStrength = props.dimStrength;
                    mol_util_1.ValueCell.update(globalUniforms.uDimStrength, p.dimStrength);
                }
                if (props.markerPriority !== undefined && props.markerPriority !== p.markerPriority) {
                    p.markerPriority = props.markerPriority;
                    mol_util_1.ValueCell.update(globalUniforms.uMarkerPriority, p.markerPriority);
                }
                if (props.xrayEdgeFalloff !== undefined && props.xrayEdgeFalloff !== p.xrayEdgeFalloff) {
                    p.xrayEdgeFalloff = props.xrayEdgeFalloff;
                    mol_util_1.ValueCell.update(globalUniforms.uXrayEdgeFalloff, p.xrayEdgeFalloff);
                }
                if (props.celSteps !== undefined && props.celSteps !== p.celSteps) {
                    p.celSteps = props.celSteps;
                    mol_util_1.ValueCell.update(globalUniforms.uCelSteps, p.celSteps);
                }
                if (props.exposure !== undefined && props.exposure !== p.exposure) {
                    p.exposure = props.exposure;
                    mol_util_1.ValueCell.update(globalUniforms.uExposure, p.exposure);
                }
                if (props.light !== undefined && !(0, mol_util_1.deepEqual)(props.light, p.light)) {
                    p.light = props.light;
                    Object.assign(light, getLight(props.light, light));
                    mol_util_1.ValueCell.update(globalUniforms.uLightDirection, light.direction);
                    mol_util_1.ValueCell.update(globalUniforms.uLightColor, light.color);
                }
                if (props.ambientColor !== undefined && props.ambientColor !== p.ambientColor) {
                    p.ambientColor = props.ambientColor;
                    linear_algebra_1.Vec3.scale(ambientColor, color_1.Color.toArrayNormalized(p.ambientColor, ambientColor, 0), p.ambientIntensity);
                    mol_util_1.ValueCell.update(globalUniforms.uAmbientColor, ambientColor);
                }
                if (props.ambientIntensity !== undefined && props.ambientIntensity !== p.ambientIntensity) {
                    p.ambientIntensity = props.ambientIntensity;
                    linear_algebra_1.Vec3.scale(ambientColor, color_1.Color.toArrayNormalized(p.ambientColor, ambientColor, 0), p.ambientIntensity);
                    mol_util_1.ValueCell.update(globalUniforms.uAmbientColor, ambientColor);
                }
            },
            setViewport: (x, y, width, height) => {
                state.viewport(x, y, width, height);
                state.scissor(x, y, width, height);
                if (x !== viewport.x || y !== viewport.y || width !== viewport.width || height !== viewport.height) {
                    util_1.Viewport.set(viewport, x, y, width, height);
                    mol_util_1.ValueCell.update(globalUniforms.uViewport, linear_algebra_1.Vec4.set(globalUniforms.uViewport.ref.value, x, y, width, height));
                }
            },
            setTransparentBackground: (value) => {
                transparentBackground = value;
            },
            setDrawingBufferSize: (width, height) => {
                if (width !== drawingBufferSize[0] || height !== drawingBufferSize[1]) {
                    mol_util_1.ValueCell.update(globalUniforms.uDrawingBufferSize, linear_algebra_1.Vec2.set(drawingBufferSize, width, height));
                }
            },
            setPixelRatio: (value) => {
                mol_util_1.ValueCell.update(globalUniforms.uPixelRatio, value);
            },
            setOcclusionTest: (f) => {
                isOccluded = f;
            },
            props: p,
            get stats() {
                return {
                    programCount: ctx.stats.resourceCounts.program,
                    shaderCount: ctx.stats.resourceCounts.shader,
                    attributeCount: ctx.stats.resourceCounts.attribute,
                    elementsCount: ctx.stats.resourceCounts.elements,
                    framebufferCount: ctx.stats.resourceCounts.framebuffer,
                    renderbufferCount: ctx.stats.resourceCounts.renderbuffer,
                    textureCount: ctx.stats.resourceCounts.texture,
                    vertexArrayCount: ctx.stats.resourceCounts.vertexArray,
                    drawCount: stats.drawCount,
                    instanceCount: stats.instanceCount,
                    instancedDrawCount: stats.instancedDrawCount,
                };
            },
            get light() {
                return light;
            },
            get ambientColor() {
                return globalUniforms.uAmbientColor.ref.value;
            },
            dispose: () => {
                // TODO
            }
        };
    }
    Renderer.create = create;
})(Renderer || (exports.Renderer = Renderer = {}));
