/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Áron Samuel Kovács <aron.kovacs@mail.muni.cz>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Texture } from '../../mol-gl/webgl/texture';
import { Vec3 } from '../../mol-math/linear-algebra';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { RenderTarget } from '../../mol-gl/webgl/render-target';
import { DrawPass } from './draw';
import { ICamera } from '../../mol-canvas3d/camera';
import { Scene } from '../../mol-gl/scene';
import { Color } from '../../mol-util/color';
import { BackgroundPass } from './background';
import { AssetManager } from '../../mol-util/assets';
import { Light } from '../../mol-gl/renderer';
import { OutlinePass } from './outline';
import { ShadowPass } from './shadow';
import { SsaoPass } from './ssao';
export declare const PostprocessingParams: {
    occlusion: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        samples: number;
        multiScale: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            levels: /*elided*/ any;
            nearThreshold: /*elided*/ any;
            farThreshold: /*elided*/ any;
        }>, "on">;
        radius: number;
        bias: number;
        blurKernelSize: number;
        blurDepthBias: number;
        resolutionScale: number;
        color: Color;
        transparentThreshold: number;
    }>, "on">>;
    shadow: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        steps: number;
        maxDistance: number;
        tolerance: number;
    }>, "on">>;
    outline: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        scale: number;
        threshold: number;
        color: Color;
        includeTransparent: boolean;
    }>, "on">>;
    dof: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        blurSize: number;
        blurSpread: number;
        inFocus: number;
        PPM: number;
        center: string;
        mode: string;
    }>, "on">>;
    antialiasing: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        edgeThreshold: number;
        maxSearchSteps: number;
    }>, "smaa"> | PD.NamedParams<PD.Normalize<{
        edgeThresholdMin: number;
        edgeThresholdMax: number;
        iterations: number;
        subpixelQuality: number;
    }>, "fxaa">>;
    sharpening: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        sharpness: number;
        denoise: boolean;
    }>, "on">>;
    background: PD.Group<PD.Normalize<{
        variant: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            coverage: /*elided*/ any;
            opacity: /*elided*/ any;
            saturation: /*elided*/ any;
            lightness: /*elided*/ any;
            source: /*elided*/ any;
            blur: /*elided*/ any;
        }>, "image"> | PD.NamedParams<PD.Normalize<{
            centerColor: /*elided*/ any;
            edgeColor: /*elided*/ any;
            ratio: /*elided*/ any;
            coverage: /*elided*/ any;
        }>, "radialGradient"> | PD.NamedParams<PD.Normalize<{
            opacity: /*elided*/ any;
            saturation: /*elided*/ any;
            lightness: /*elided*/ any;
            faces: /*elided*/ any;
            blur: /*elided*/ any;
            rotation: /*elided*/ any;
        }>, "skybox"> | PD.NamedParams<PD.Normalize<{
            topColor: /*elided*/ any;
            bottomColor: /*elided*/ any;
            ratio: /*elided*/ any;
            coverage: /*elided*/ any;
        }>, "horizontalGradient">;
    }>>;
    bloom: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        strength: number;
        radius: number;
        threshold: number;
        mode: "luminosity" | "emissive";
    }>, "on">>;
};
export type PostprocessingProps = PD.Values<typeof PostprocessingParams>;
export declare class PostprocessingPass {
    private readonly webgl;
    readonly drawPass: DrawPass;
    static isEnabled(props: PostprocessingProps): boolean;
    static isTransparentDepthRequired(scene: Scene, props: PostprocessingProps): boolean;
    static isTransparentOutlineEnabled(props: PostprocessingProps): boolean;
    static isTransparentSsaoEnabled(scene: Scene, props: PostprocessingProps): boolean;
    static isSsaoEnabled(props: PostprocessingProps): boolean;
    readonly target: RenderTarget;
    private readonly renderable;
    readonly ssao: SsaoPass;
    readonly shadow: ShadowPass;
    readonly outline: OutlinePass;
    readonly background: BackgroundPass;
    constructor(webgl: WebGLContext, assetManager: AssetManager, drawPass: DrawPass);
    setSize(width: number, height: number): void;
    updateState(camera: ICamera, scene: Scene, transparentBackground: boolean, backgroundColor: Color, props: PostprocessingProps, light: Light, ambientColor: Vec3): void;
    private occlusionOffset;
    setOcclusionOffset(x: number, y: number): void;
    private transparentBackground;
    setTransparentBackground(value: boolean): void;
    render(camera: ICamera, scene: Scene, toDrawingBuffer: boolean, transparentBackground: boolean, backgroundColor: Color, props: PostprocessingProps, light: Light, ambientColor: Vec3): void;
}
export declare class AntialiasingPass {
    static isEnabled(props: PostprocessingProps): boolean;
    readonly target: RenderTarget;
    private readonly internalTarget;
    private readonly fxaa;
    private readonly smaa;
    private readonly cas;
    constructor(webgl: WebGLContext, width: number, height: number);
    setSize(width: number, height: number): void;
    private _renderFxaa;
    private _renderSmaa;
    private _renderAntialiasing;
    private _renderCas;
    render(camera: ICamera, input: Texture, toDrawingBuffer: boolean | RenderTarget, props: PostprocessingProps): void;
}
