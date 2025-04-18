/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { ICamera } from '../mol-canvas3d/camera';
import { Scene } from './scene';
import { WebGLContext } from './webgl/context';
import { Vec3 } from '../mol-math/linear-algebra';
import { Color } from '../mol-util/color';
import { ParamDefinition as PD } from '../mol-util/param-definition';
import { Texture } from './webgl/texture';
import { Sphere3D } from '../mol-math/geometry';
export interface RendererStats {
    programCount: number;
    shaderCount: number;
    attributeCount: number;
    elementsCount: number;
    framebufferCount: number;
    renderbufferCount: number;
    textureCount: number;
    vertexArrayCount: number;
    drawCount: number;
    instanceCount: number;
    instancedDrawCount: number;
}
export declare enum PickType {
    None = 0,
    Object = 1,
    Instance = 2,
    Group = 3
}
export declare enum MarkingType {
    None = 0,
    Depth = 1,
    Mask = 2
}
interface Renderer {
    readonly stats: RendererStats;
    readonly props: Readonly<RendererProps>;
    readonly light: Readonly<Light>;
    readonly ambientColor: Vec3;
    clear: (toBackgroundColor: boolean, ignoreTransparentBackground?: boolean, forceToTransparency?: boolean) => void;
    clearDepth: (packed?: boolean) => void;
    update: (camera: ICamera, scene: Scene) => void;
    renderPick: (group: Scene.Group, camera: ICamera, variant: 'pick' | 'depth', pickType: PickType) => void;
    renderDepth: (group: Scene.Group, camera: ICamera) => void;
    renderDepthOpaque: (group: Scene.Group, camera: ICamera) => void;
    renderDepthOpaqueBack: (group: Scene.Group, camera: ICamera) => void;
    renderDepthTransparent: (group: Scene.Group, camera: ICamera, depthTexture: Texture) => void;
    renderMarkingDepth: (group: Scene.Group, camera: ICamera) => void;
    renderMarkingMask: (group: Scene.Group, camera: ICamera, depthTexture: Texture | null) => void;
    renderEmissive: (group: Scene.Group, camera: ICamera) => void;
    renderTracing: (group: Scene.Group, camera: ICamera) => void;
    renderBlended: (group: Scene, camera: ICamera) => void;
    renderOpaque: (group: Scene.Group, camera: ICamera) => void;
    renderBlendedTransparent: (group: Scene.Group, camera: ICamera) => void;
    renderVolume: (group: Scene.Group, camera: ICamera, depthTexture: Texture) => void;
    renderWboitTransparent: (group: Scene.Group, camera: ICamera, depthTexture: Texture) => void;
    renderDpoitTransparent: (group: Scene.Group, camera: ICamera, depthTexture: Texture, dpoitTextures: {
        depth: Texture;
        frontColor: Texture;
        backColor: Texture;
    }) => void;
    setProps: (props: Partial<RendererProps>) => void;
    setViewport: (x: number, y: number, width: number, height: number) => void;
    setTransparentBackground: (value: boolean) => void;
    setDrawingBufferSize: (width: number, height: number) => void;
    setPixelRatio: (value: number) => void;
    setOcclusionTest: (f: ((s: Sphere3D) => boolean) | null) => void;
    dispose: () => void;
}
export declare const RendererParams: {
    backgroundColor: PD.Color;
    pickingAlphaThreshold: PD.Numeric;
    interiorDarkening: PD.Numeric;
    interiorColorFlag: PD.BooleanParam;
    interiorColor: PD.Color;
    colorMarker: PD.BooleanParam;
    highlightColor: PD.Color;
    selectColor: PD.Color;
    dimColor: PD.Color;
    highlightStrength: PD.Numeric;
    selectStrength: PD.Numeric;
    dimStrength: PD.Numeric;
    markerPriority: PD.Select<number>;
    xrayEdgeFalloff: PD.Numeric;
    celSteps: PD.Numeric;
    exposure: PD.Numeric;
    light: PD.ObjectList<PD.Normalize<{
        inclination: number;
        azimuth: number;
        color: Color;
        intensity: number;
    }>>;
    ambientColor: PD.Color;
    ambientIntensity: PD.Numeric;
};
export type RendererProps = PD.Values<typeof RendererParams>;
export type Light = {
    count: number;
    direction: number[];
    color: number[];
};
declare namespace Renderer {
    function create(ctx: WebGLContext, props?: Partial<RendererProps>): Renderer;
}
export { Renderer };
