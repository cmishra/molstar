/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { WebGLContext } from './webgl/context';
import { GraphicsRenderObject } from './render-object';
import { Object3D } from './object3d';
import { Sphere3D } from '../mol-math/geometry/primitives/sphere3d';
import { GraphicsRenderable } from './renderable';
import { Transparency } from './webgl/render-item';
interface Scene extends Object3D {
    readonly count: number;
    readonly renderables: ReadonlyArray<GraphicsRenderable>;
    readonly boundingSphere: Sphere3D;
    readonly boundingSphereVisible: Sphere3D;
    readonly primitives: Scene.Group;
    readonly volumes: Scene.Group;
    /** Returns `true` if some visibility has changed, `false` otherwise. */
    syncVisibility: () => boolean;
    setTransparency: (transparency: Transparency) => void;
    update: (objects: ArrayLike<GraphicsRenderObject> | undefined, keepBoundingSphere: boolean) => void;
    add: (o: GraphicsRenderObject) => void;
    remove: (o: GraphicsRenderObject) => void;
    commit: (maxTimeMs?: number) => boolean;
    readonly needsCommit: boolean;
    readonly commitQueueSize: number;
    has: (o: GraphicsRenderObject) => boolean;
    clear: () => void;
    forEach: (callbackFn: (value: GraphicsRenderable, key: GraphicsRenderObject) => void) => void;
    /** Marker average of primitive renderables */
    readonly markerAverage: number;
    /** Emissive average of primitive renderables */
    readonly emissiveAverage: number;
    /** Opacity average of primitive renderables */
    readonly opacityAverage: number;
    /** Transparency minimum, excluding fully opaque, of primitive renderables */
    readonly transparencyMin: number;
    /** Is `true` if any primitive renderable (possibly) has any opaque part */
    readonly hasOpaque: boolean;
}
declare namespace Scene {
    interface Group extends Object3D {
        readonly renderables: ReadonlyArray<GraphicsRenderable>;
    }
    function create(ctx: WebGLContext, transparency?: Transparency): Scene;
}
export { Scene };
