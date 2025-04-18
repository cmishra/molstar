"use strict";
/**
 * Copyright (c) 2019-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickHelper = exports.PickPass = void 0;
const renderer_1 = require("../../mol-gl/renderer");
const compat_1 = require("../../mol-gl/webgl/compat");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const misc_1 = require("../../mol-math/misc");
const debug_1 = require("../../mol-util/debug");
const number_packing_1 = require("../../mol-util/number-packing");
const stereo_1 = require("../camera/stereo");
const util_1 = require("../camera/util");
const util_2 = require("../camera/util");
const NullId = Math.pow(2, 24) - 2;
class PickPass {
    constructor(webgl, drawPass, pickScale) {
        this.webgl = webgl;
        this.drawPass = drawPass;
        this.pickScale = pickScale;
        const pickRatio = pickScale / webgl.pixelRatio;
        this.pickWidth = Math.ceil(drawPass.colorTarget.getWidth() * pickRatio);
        this.pickHeight = Math.ceil(drawPass.colorTarget.getHeight() * pickRatio);
        const { resources, extensions: { drawBuffers }, gl } = webgl;
        if (drawBuffers) {
            this.objectPickTexture = resources.texture('image-uint8', 'rgba', 'ubyte', 'nearest');
            this.objectPickTexture.define(this.pickWidth, this.pickHeight);
            this.instancePickTexture = resources.texture('image-uint8', 'rgba', 'ubyte', 'nearest');
            this.instancePickTexture.define(this.pickWidth, this.pickHeight);
            this.groupPickTexture = resources.texture('image-uint8', 'rgba', 'ubyte', 'nearest');
            this.groupPickTexture.define(this.pickWidth, this.pickHeight);
            this.depthPickTexture = resources.texture('image-uint8', 'rgba', 'ubyte', 'nearest');
            this.depthPickTexture.define(this.pickWidth, this.pickHeight);
            this.framebuffer = resources.framebuffer();
            this.objectPickFramebuffer = resources.framebuffer();
            this.instancePickFramebuffer = resources.framebuffer();
            this.groupPickFramebuffer = resources.framebuffer();
            this.depthPickFramebuffer = resources.framebuffer();
            this.framebuffer.bind();
            drawBuffers.drawBuffers([
                drawBuffers.COLOR_ATTACHMENT0,
                drawBuffers.COLOR_ATTACHMENT1,
                drawBuffers.COLOR_ATTACHMENT2,
                drawBuffers.COLOR_ATTACHMENT3,
            ]);
            this.objectPickTexture.attachFramebuffer(this.framebuffer, 'color0');
            this.instancePickTexture.attachFramebuffer(this.framebuffer, 'color1');
            this.groupPickTexture.attachFramebuffer(this.framebuffer, 'color2');
            this.depthPickTexture.attachFramebuffer(this.framebuffer, 'color3');
            this.depthRenderbuffer = (0, compat_1.isWebGL2)(gl)
                ? resources.renderbuffer('depth32f', 'depth', this.pickWidth, this.pickHeight)
                : resources.renderbuffer('depth16', 'depth', this.pickWidth, this.pickHeight);
            this.depthRenderbuffer.attachFramebuffer(this.framebuffer);
            this.objectPickTexture.attachFramebuffer(this.objectPickFramebuffer, 'color0');
            this.instancePickTexture.attachFramebuffer(this.instancePickFramebuffer, 'color0');
            this.groupPickTexture.attachFramebuffer(this.groupPickFramebuffer, 'color0');
            this.depthPickTexture.attachFramebuffer(this.depthPickFramebuffer, 'color0');
        }
        else {
            this.objectPickTarget = webgl.createRenderTarget(this.pickWidth, this.pickHeight);
            this.instancePickTarget = webgl.createRenderTarget(this.pickWidth, this.pickHeight);
            this.groupPickTarget = webgl.createRenderTarget(this.pickWidth, this.pickHeight);
            this.depthPickTarget = webgl.createRenderTarget(this.pickWidth, this.pickHeight);
        }
    }
    get pickRatio() {
        return this.pickScale / this.webgl.pixelRatio;
    }
    setPickScale(pickScale) {
        this.pickScale = pickScale;
        this.syncSize();
    }
    bindObject() {
        if (this.webgl.extensions.drawBuffers) {
            this.objectPickFramebuffer.bind();
        }
        else {
            this.objectPickTarget.bind();
        }
    }
    bindInstance() {
        if (this.webgl.extensions.drawBuffers) {
            this.instancePickFramebuffer.bind();
        }
        else {
            this.instancePickTarget.bind();
        }
    }
    bindGroup() {
        if (this.webgl.extensions.drawBuffers) {
            this.groupPickFramebuffer.bind();
        }
        else {
            this.groupPickTarget.bind();
        }
    }
    bindDepth() {
        if (this.webgl.extensions.drawBuffers) {
            this.depthPickFramebuffer.bind();
        }
        else {
            this.depthPickTarget.bind();
        }
    }
    get drawingBufferHeight() {
        return this.drawPass.colorTarget.getHeight();
    }
    syncSize() {
        const pickRatio = this.pickScale / this.webgl.pixelRatio;
        const pickWidth = Math.ceil(this.drawPass.colorTarget.getWidth() * pickRatio);
        const pickHeight = Math.ceil(this.drawPass.colorTarget.getHeight() * pickRatio);
        if (pickWidth !== this.pickWidth || pickHeight !== this.pickHeight) {
            this.pickWidth = pickWidth;
            this.pickHeight = pickHeight;
            if (this.webgl.extensions.drawBuffers) {
                this.objectPickTexture.define(this.pickWidth, this.pickHeight);
                this.instancePickTexture.define(this.pickWidth, this.pickHeight);
                this.groupPickTexture.define(this.pickWidth, this.pickHeight);
                this.depthPickTexture.define(this.pickWidth, this.pickHeight);
                this.depthRenderbuffer.setSize(this.pickWidth, this.pickHeight);
            }
            else {
                this.objectPickTarget.setSize(this.pickWidth, this.pickHeight);
                this.instancePickTarget.setSize(this.pickWidth, this.pickHeight);
                this.groupPickTarget.setSize(this.pickWidth, this.pickHeight);
                this.depthPickTarget.setSize(this.pickWidth, this.pickHeight);
            }
        }
    }
    renderVariant(renderer, camera, scene, helper, variant, pickType) {
        renderer.clear(false);
        renderer.update(camera, scene);
        renderer.renderPick(scene.primitives, camera, variant, pickType);
        if (helper.handle.isEnabled) {
            renderer.renderPick(helper.handle.scene, camera, variant, pickType);
        }
        if (helper.camera.isEnabled) {
            helper.camera.update(camera);
            renderer.update(helper.camera.camera, helper.camera.scene);
            renderer.renderPick(helper.camera.scene, helper.camera.camera, variant, pickType);
        }
    }
    render(renderer, camera, scene, helper) {
        if (this.webgl.extensions.drawBuffers) {
            this.framebuffer.bind();
            this.renderVariant(renderer, camera, scene, helper, 'pick', renderer_1.PickType.None);
        }
        else {
            this.objectPickTarget.bind();
            this.renderVariant(renderer, camera, scene, helper, 'pick', renderer_1.PickType.Object);
            this.instancePickTarget.bind();
            this.renderVariant(renderer, camera, scene, helper, 'pick', renderer_1.PickType.Instance);
            this.groupPickTarget.bind();
            this.renderVariant(renderer, camera, scene, helper, 'pick', renderer_1.PickType.Group);
            // printTexture(this.webgl, this.groupPickTarget.texture, { id: 'group' })
            this.depthPickTarget.bind();
            this.renderVariant(renderer, camera, scene, helper, 'depth', renderer_1.PickType.None);
        }
    }
}
exports.PickPass = PickPass;
class PickHelper {
    setupBuffers() {
        const bufferSize = this.pickWidth * this.pickHeight * 4;
        if (!this.objectBuffer || this.objectBuffer.length !== bufferSize) {
            this.objectBuffer = new Uint8Array(bufferSize);
            this.instanceBuffer = new Uint8Array(bufferSize);
            this.groupBuffer = new Uint8Array(bufferSize);
            this.depthBuffer = new Uint8Array(bufferSize);
        }
    }
    setViewport(x, y, width, height) {
        util_2.Viewport.set(this.viewport, x, y, width, height);
        this.update();
    }
    setPickPadding(pickPadding) {
        if (this.pickPadding !== pickPadding) {
            this.pickPadding = pickPadding;
            this.update();
        }
    }
    update() {
        const { x, y, width, height } = this.viewport;
        this.pickRatio = this.pickPass.pickRatio;
        this.pickX = Math.ceil(x * this.pickRatio);
        this.pickY = Math.ceil(y * this.pickRatio);
        const pickWidth = Math.floor(width * this.pickRatio);
        const pickHeight = Math.floor(height * this.pickRatio);
        if (pickWidth !== this.pickWidth || pickHeight !== this.pickHeight) {
            this.pickWidth = pickWidth;
            this.pickHeight = pickHeight;
            this.halfPickWidth = Math.floor(this.pickWidth / 2);
            this.setupBuffers();
        }
        this.spiral = (0, misc_1.spiral2d)(Math.ceil(this.pickRatio * this.pickPadding));
        this.dirty = true;
    }
    syncBuffers() {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('PickHelper.syncBuffers');
        const { pickX, pickY, pickWidth, pickHeight } = this;
        this.pickPass.bindObject();
        this.webgl.readPixels(pickX, pickY, pickWidth, pickHeight, this.objectBuffer);
        this.pickPass.bindInstance();
        this.webgl.readPixels(pickX, pickY, pickWidth, pickHeight, this.instanceBuffer);
        this.pickPass.bindGroup();
        this.webgl.readPixels(pickX, pickY, pickWidth, pickHeight, this.groupBuffer);
        this.pickPass.bindDepth();
        this.webgl.readPixels(pickX, pickY, pickWidth, pickHeight, this.depthBuffer);
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('PickHelper.syncBuffers');
    }
    getBufferIdx(x, y) {
        return (y * this.pickWidth + x) * 4;
    }
    getDepth(x, y) {
        const idx = this.getBufferIdx(x, y);
        const b = this.depthBuffer;
        return (0, number_packing_1.unpackRGBAToDepth)(b[idx], b[idx + 1], b[idx + 2], b[idx + 3]);
    }
    getId(x, y, buffer) {
        const idx = this.getBufferIdx(x, y);
        return (0, number_packing_1.unpackRGBToInt)(buffer[idx], buffer[idx + 1], buffer[idx + 2]);
    }
    render(camera) {
        if (debug_1.isTimingMode)
            this.webgl.timer.mark('PickHelper.render', { captureStats: true });
        const { pickX, pickY, pickWidth, pickHeight, halfPickWidth } = this;
        const { renderer, scene, helper } = this;
        renderer.setTransparentBackground(false);
        renderer.setDrawingBufferSize(pickWidth, pickHeight);
        renderer.setPixelRatio(this.pickRatio);
        if (stereo_1.StereoCamera.is(camera)) {
            renderer.setViewport(pickX, pickY, halfPickWidth, pickHeight);
            this.pickPass.render(renderer, camera.left, scene, helper);
            renderer.setViewport(pickX + halfPickWidth, pickY, pickWidth - halfPickWidth, pickHeight);
            this.pickPass.render(renderer, camera.right, scene, helper);
        }
        else {
            renderer.setViewport(pickX, pickY, pickWidth, pickHeight);
            this.pickPass.render(renderer, camera, scene, helper);
        }
        this.dirty = false;
        if (debug_1.isTimingMode)
            this.webgl.timer.markEnd('PickHelper.render');
    }
    identifyInternal(x, y, camera) {
        if (this.pickRatio !== this.pickPass.pickRatio) {
            this.update();
        }
        const { webgl, pickRatio } = this;
        if (webgl.isContextLost)
            return;
        x *= webgl.pixelRatio;
        y *= webgl.pixelRatio;
        y = this.pickPass.drawingBufferHeight - y; // flip y
        const { viewport } = this;
        // check if within viewport
        if (x < viewport.x ||
            y < viewport.y ||
            x > viewport.x + viewport.width ||
            y > viewport.y + viewport.height)
            return;
        if (this.dirty) {
            if (debug_1.isTimingMode)
                this.webgl.timer.mark('PickHelper.identify');
            this.render(camera);
            this.syncBuffers();
            if (debug_1.isTimingMode)
                this.webgl.timer.markEnd('PickHelper.identify');
        }
        const xv = x - viewport.x;
        const yv = y - viewport.y;
        const xp = Math.floor(xv * pickRatio);
        const yp = Math.floor(yv * pickRatio);
        const objectId = this.getId(xp, yp, this.objectBuffer);
        // console.log('objectId', objectId);
        if (objectId === -1 || objectId === NullId)
            return;
        const instanceId = this.getId(xp, yp, this.instanceBuffer);
        // console.log('instanceId', instanceId);
        if (instanceId === -1 || instanceId === NullId)
            return;
        const groupId = this.getId(xp, yp, this.groupBuffer);
        // console.log('groupId', groupId);
        if (groupId === -1 || groupId === NullId)
            return;
        const z = this.getDepth(xp, yp);
        // console.log('z', z);
        const position = linear_algebra_1.Vec3.create(x, y, z);
        if (stereo_1.StereoCamera.is(camera)) {
            const halfWidth = Math.floor(viewport.width / 2);
            if (x > viewport.x + halfWidth) {
                position[0] = viewport.x + (xv - halfWidth) * 2;
                (0, util_1.cameraUnproject)(position, position, viewport, camera.right.inverseProjectionView);
            }
            else {
                position[0] = viewport.x + xv * 2;
                (0, util_1.cameraUnproject)(position, position, viewport, camera.left.inverseProjectionView);
            }
        }
        else {
            (0, util_1.cameraUnproject)(position, position, viewport, camera.inverseProjectionView);
        }
        // console.log({ id: { objectId, instanceId, groupId }, position });
        return { id: { objectId, instanceId, groupId }, position };
    }
    identify(x, y, camera) {
        for (const d of this.spiral) {
            const pickData = this.identifyInternal(x + d[0], y + d[1], camera);
            if (pickData)
                return pickData;
        }
    }
    constructor(webgl, renderer, scene, helper, pickPass, viewport, pickPadding = 1) {
        this.webgl = webgl;
        this.renderer = renderer;
        this.scene = scene;
        this.helper = helper;
        this.pickPass = pickPass;
        this.pickPadding = pickPadding;
        this.dirty = true;
        this.viewport = (0, util_2.Viewport)();
        this.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
    }
}
exports.PickHelper = PickHelper;
