/**
 * Copyright (c) 2019-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PickingId } from '../../mol-geo/geometry/picking';
import { Renderer } from '../../mol-gl/renderer';
import { Scene } from '../../mol-gl/scene';
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Vec3 } from '../../mol-math/linear-algebra';
import { Camera, ICamera } from '../camera';
import { StereoCamera } from '../camera/stereo';
import { Viewport } from '../camera/util';
import { Helper } from '../helper/helper';
import { DrawPass } from './draw';
export type PickData = {
    id: PickingId;
    position: Vec3;
};
export declare class PickPass {
    private webgl;
    private drawPass;
    private pickScale;
    private readonly objectPickTarget;
    private readonly instancePickTarget;
    private readonly groupPickTarget;
    private readonly depthPickTarget;
    private readonly framebuffer;
    private readonly objectPickTexture;
    private readonly instancePickTexture;
    private readonly groupPickTexture;
    private readonly depthPickTexture;
    private readonly objectPickFramebuffer;
    private readonly instancePickFramebuffer;
    private readonly groupPickFramebuffer;
    private readonly depthPickFramebuffer;
    private readonly depthRenderbuffer;
    private pickWidth;
    private pickHeight;
    constructor(webgl: WebGLContext, drawPass: DrawPass, pickScale: number);
    get pickRatio(): number;
    setPickScale(pickScale: number): void;
    bindObject(): void;
    bindInstance(): void;
    bindGroup(): void;
    bindDepth(): void;
    get drawingBufferHeight(): number;
    syncSize(): void;
    private renderVariant;
    render(renderer: Renderer, camera: ICamera, scene: Scene, helper: Helper): void;
}
export declare class PickHelper {
    private webgl;
    private renderer;
    private scene;
    private helper;
    private pickPass;
    private pickPadding;
    dirty: boolean;
    private objectBuffer;
    private instanceBuffer;
    private groupBuffer;
    private depthBuffer;
    private viewport;
    private pickRatio;
    private pickX;
    private pickY;
    private pickWidth;
    private pickHeight;
    private halfPickWidth;
    private spiral;
    private setupBuffers;
    setViewport(x: number, y: number, width: number, height: number): void;
    setPickPadding(pickPadding: number): void;
    private update;
    private syncBuffers;
    private getBufferIdx;
    private getDepth;
    private getId;
    private render;
    private identifyInternal;
    identify(x: number, y: number, camera: Camera | StereoCamera): PickData | undefined;
    constructor(webgl: WebGLContext, renderer: Renderer, scene: Scene, helper: Helper, pickPass: PickPass, viewport: Viewport, pickPadding?: number);
}
