/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Áron Samuel Kovács <aron.kovacs@mail.muni.cz>
 */

import { WebGLContext } from '../../mol-gl/webgl/context';
import { createNullRenderTarget, RenderTarget } from '../../mol-gl/webgl/render-target';
import { Renderer } from '../../mol-gl/renderer';
import { Scene } from '../../mol-gl/scene';
import { Texture } from '../../mol-gl/webgl/texture';
import { Camera, ICamera } from '../camera';
import { ValueCell } from '../../mol-util';
import { Vec2 } from '../../mol-math/linear-algebra';
import { Helper } from '../helper/helper';

import { StereoCamera } from '../camera/stereo';
import { WboitPass } from './wboit';
import { AntialiasingPass, PostprocessingPass, PostprocessingProps } from './postprocessing';
import { MarkingPass, MarkingProps } from './marking';
import { CopyRenderable, createCopyRenderable } from '../../mol-gl/compute/util';

type Props = {
    postprocessing: PostprocessingProps
    marking: MarkingProps
    transparentBackground: boolean;
}

type RenderContext = {
    renderer: Renderer;
    camera: Camera | StereoCamera;
    scene: Scene;
    helper: Helper;
}

export class DrawPass {
    private readonly drawTarget: RenderTarget;

    readonly colorTarget: RenderTarget;
    readonly depthTexture: Texture;
    readonly depthTexturePrimitives: Texture;

    readonly packedDepth: boolean;

    private depthTarget: RenderTarget;
    private depthTargetPrimitives: RenderTarget | null;
    private depthTargetVolumes: RenderTarget | null;
    private depthTextureVolumes: Texture;

    private copyFboTarget: CopyRenderable;
    private copyFboPostprocessing: CopyRenderable;

    private wboit: WboitPass | undefined;
    private readonly marking: MarkingPass;
    readonly postprocessing: PostprocessingPass;
    private readonly antialiasing: AntialiasingPass;

    get wboitEnabled() {
        return !!this.wboit?.supported;
    }

    constructor(private webgl: WebGLContext, width: number, height: number, enableWboit: boolean) {
        const { extensions, resources, isWebGL2 } = webgl;

        this.drawTarget = createNullRenderTarget(webgl.gl);

        this.colorTarget = webgl.createRenderTarget(width, height, true, 'uint8', 'linear');
        this.packedDepth = !extensions.depthTexture;

        this.depthTarget = webgl.createRenderTarget(width, height);
        this.depthTexture = this.depthTarget.texture;

        this.depthTargetPrimitives = this.packedDepth ? webgl.createRenderTarget(width, height) : null;
        this.depthTargetVolumes = this.packedDepth ? webgl.createRenderTarget(width, height) : null;

        this.depthTexturePrimitives = this.depthTargetPrimitives ? this.depthTargetPrimitives.texture : resources.texture('image-depth', 'depth', isWebGL2 ? 'float' : 'ushort', 'nearest');
        this.depthTextureVolumes = this.depthTargetVolumes ? this.depthTargetVolumes.texture : resources.texture('image-depth', 'depth', isWebGL2 ? 'float' : 'ushort', 'nearest');
        if (!this.packedDepth) {
            this.depthTexturePrimitives.define(width, height);
            this.depthTextureVolumes.define(width, height);
        }

        this.wboit = enableWboit ? new WboitPass(webgl, width, height) : undefined;
        this.marking = new MarkingPass(webgl, width, height);
        this.postprocessing = new PostprocessingPass(webgl, this);
        this.antialiasing = new AntialiasingPass(webgl, this);

        this.copyFboTarget = createCopyRenderable(webgl, this.colorTarget.texture);
        this.copyFboPostprocessing = createCopyRenderable(webgl, this.postprocessing.target.texture);
    }

    reset() {
        this.wboit?.reset();
    }

    setSize(width: number, height: number) {
        const w = this.colorTarget.getWidth();
        const h = this.colorTarget.getHeight();

        if (width !== w || height !== h) {
            this.colorTarget.setSize(width, height);
            this.depthTarget.setSize(width, height);

            if (this.depthTargetPrimitives) {
                this.depthTargetPrimitives.setSize(width, height);
            } else {
                this.depthTexturePrimitives.define(width, height);
            }

            if (this.depthTargetVolumes) {
                this.depthTargetVolumes.setSize(width, height);
            } else {
                this.depthTextureVolumes.define(width, height);
            }

            ValueCell.update(this.copyFboTarget.values.uTexSize, Vec2.set(this.copyFboTarget.values.uTexSize.ref.value, width, height));
            ValueCell.update(this.copyFboPostprocessing.values.uTexSize, Vec2.set(this.copyFboPostprocessing.values.uTexSize.ref.value, width, height));

            if (this.wboit?.supported) {
                this.wboit.setSize(width, height);
            }

            this.marking.setSize(width, height);
            this.postprocessing.setSize(width, height);
            this.antialiasing.setSize(width, height);
        }
    }

    private _renderWboit(renderer: Renderer, camera: ICamera, scene: Scene, transparentBackground: boolean, postprocessingProps: PostprocessingProps) {
        if (!this.wboit?.supported) throw new Error('expected wboit to be supported');

        this.colorTarget.bind();
        renderer.clear(true);

        // render opaque primitives
        this.depthTexturePrimitives.attachFramebuffer(this.colorTarget.framebuffer, 'depth');
        this.colorTarget.bind();
        renderer.clearDepth();
        renderer.renderWboitOpaque(scene.primitives, camera, null);

        if (PostprocessingPass.isEnabled(postprocessingProps)) {
            if (PostprocessingPass.isOutlineEnabled(postprocessingProps)) {
                this.depthTarget.bind();
                renderer.clear(false);
                if (scene.getOpacityAverage() < 1) {
                    renderer.renderDepthTransparent(scene.primitives, camera, null);
                }
            }

            this.postprocessing.render(camera, false, transparentBackground, renderer.props.backgroundColor, postprocessingProps);
        }

        // render transparent primitives and volumes
        this.wboit.bind();
        renderer.renderWboitTransparent(scene.primitives, camera, this.depthTexturePrimitives);
        renderer.renderWboitTransparent(scene.volumes, camera, this.depthTexturePrimitives);

        // evaluate wboit
        if (PostprocessingPass.isEnabled(postprocessingProps)) {
            this.postprocessing.target.bind();
        } else {
            this.colorTarget.bind();
        }
        this.wboit.render();
    }

    private _renderBlended(renderer: Renderer, camera: ICamera, scene: Scene, toDrawingBuffer: boolean, transparentBackground: boolean, postprocessingProps: PostprocessingProps) {
        if (toDrawingBuffer) {
            this.drawTarget.bind();
        } else {
            this.colorTarget.bind();
            if (!this.packedDepth) {
                this.depthTexturePrimitives.attachFramebuffer(this.colorTarget.framebuffer, 'depth');
            }
        }

        renderer.clear(true);
        renderer.renderBlendedOpaque(scene.primitives, camera, null);

        if (!toDrawingBuffer) {
            // do a depth pass if not rendering to drawing buffer and
            // extensions.depthTexture is unsupported (i.e. depthTarget is set)
            if (this.depthTargetPrimitives) {
                this.depthTargetPrimitives.bind();
                renderer.clear(false);
                renderer.renderDepthOpaque(scene.primitives, camera, null);
                this.colorTarget.bind();
            }

            if (PostprocessingPass.isEnabled(postprocessingProps)) {
                if (!this.packedDepth) {
                    this.depthTexturePrimitives.detachFramebuffer(this.postprocessing.target.framebuffer, 'depth');
                } else {
                    this.colorTarget.depthRenderbuffer?.detachFramebuffer(this.postprocessing.target.framebuffer);
                }

                if (PostprocessingPass.isOutlineEnabled(postprocessingProps)) {
                    this.depthTarget.bind();
                    renderer.clear(false);
                    if (scene.getOpacityAverage() < 1) {
                        renderer.renderDepthTransparent(scene.primitives, camera, null);
                    }
                }

                this.postprocessing.render(camera, false, transparentBackground, renderer.props.backgroundColor, postprocessingProps);

                if (!this.packedDepth) {
                    this.depthTexturePrimitives.attachFramebuffer(this.postprocessing.target.framebuffer, 'depth');
                } else {
                    this.colorTarget.depthRenderbuffer?.attachFramebuffer(this.postprocessing.target.framebuffer);
                }
            }

            renderer.renderBlendedVolume(scene.volumes, camera, this.depthTexturePrimitives);
        }

        renderer.renderBlendedTransparent(scene.primitives, camera, null);
    }

    private _render(renderer: Renderer, camera: ICamera, scene: Scene, helper: Helper, toDrawingBuffer: boolean, props: Props) {
        const volumeRendering = scene.volumes.renderables.length > 0;
        const postprocessingEnabled = PostprocessingPass.isEnabled(props.postprocessing);
        const antialiasingEnabled = AntialiasingPass.isEnabled(props.postprocessing);
        const markingEnabled = MarkingPass.isEnabled(props.marking);

        const { x, y, width, height } = camera.viewport;
        renderer.setViewport(x, y, width, height);
        renderer.update(camera);

        if (props.transparentBackground && !antialiasingEnabled && toDrawingBuffer) {
            this.drawTarget.bind();
            renderer.clear(false);
        }

        if (this.wboitEnabled) {
            this._renderWboit(renderer, camera, scene, props.transparentBackground, props.postprocessing);
        } else {
            this._renderBlended(renderer, camera, scene, !volumeRendering && !postprocessingEnabled && !antialiasingEnabled && toDrawingBuffer, props.transparentBackground, props.postprocessing);
        }

        if (postprocessingEnabled) {
            this.postprocessing.target.bind();
        } else if (!toDrawingBuffer || volumeRendering || this.wboitEnabled) {
            this.colorTarget.bind();
        } else {
            this.drawTarget.bind();
        }

        if (markingEnabled) {
            const markerAverage = scene.getMarkerAverage();
            if (markerAverage > 0) {
                const markingDepthTest = props.marking.ghostEdgeStrength < 1;
                if (markingDepthTest && markerAverage !== 1) {
                    this.marking.depthTarget.bind();
                    renderer.clear(false, true);
                    renderer.renderMarkingDepth(scene.primitives, camera, null);
                }

                this.marking.maskTarget.bind();
                renderer.clear(false, true);
                renderer.renderMarkingMask(scene.primitives, camera, markingDepthTest ? this.marking.depthTarget.texture : null);

                this.marking.update(props.marking);
                this.marking.render(camera.viewport, postprocessingEnabled ? this.postprocessing.target : this.colorTarget);
            }
        }

        if (helper.debug.isEnabled) {
            helper.debug.syncVisibility();
            renderer.renderBlended(helper.debug.scene, camera, null);
        }
        if (helper.handle.isEnabled) {
            renderer.renderBlended(helper.handle.scene, camera, null);
        }
        if (helper.camera.isEnabled) {
            helper.camera.update(camera);
            renderer.update(helper.camera.camera);
            renderer.renderBlended(helper.camera.scene, helper.camera.camera, null);
        }

        if (antialiasingEnabled) {
            this.antialiasing.render(camera, toDrawingBuffer, props.postprocessing);
        } else if (toDrawingBuffer) {
            this.drawTarget.bind();

            this.webgl.state.disable(this.webgl.gl.DEPTH_TEST);
            if (postprocessingEnabled) {
                this.copyFboPostprocessing.render();
            } else if (volumeRendering || this.wboitEnabled) {
                this.copyFboTarget.render();
            }
        }

        this.webgl.gl.flush();
    }

    render(ctx: RenderContext, props: Props, toDrawingBuffer: boolean) {
        const { renderer, camera, scene, helper } = ctx;
        renderer.setTransparentBackground(props.transparentBackground);
        renderer.setDrawingBufferSize(this.colorTarget.getWidth(), this.colorTarget.getHeight());
        renderer.setPixelRatio(this.webgl.pixelRatio);

        if (StereoCamera.is(camera)) {
            this._render(renderer, camera.left, scene, helper, toDrawingBuffer, props);
            this._render(renderer, camera.right, scene, helper, toDrawingBuffer, props);
        } else {
            this._render(renderer, camera, scene, helper, toDrawingBuffer, props);
        }
    }

    getColorTarget(postprocessingProps: PostprocessingProps): RenderTarget {
        if (AntialiasingPass.isEnabled(postprocessingProps)) {
            return this.antialiasing.target;
        } else if (PostprocessingPass.isEnabled(postprocessingProps)) {
            return this.postprocessing.target;
        }
        return this.colorTarget;
    }
}