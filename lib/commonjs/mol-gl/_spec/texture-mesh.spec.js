"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTextureMesh = createTextureMesh;
const render_object_1 = require("../render-object");
const scene_1 = require("../scene");
const gl_1 = require("./gl");
const debug_1 = require("../../mol-util/debug");
const names_1 = require("../../mol-util/color/names");
const param_definition_1 = require("../../mol-util/param-definition");
const texture_mesh_1 = require("../../mol-geo/geometry/texture-mesh/texture-mesh");
function createTextureMesh() {
    const textureMesh = texture_mesh_1.TextureMesh.createEmpty();
    const props = param_definition_1.ParamDefinition.getDefaultValues(texture_mesh_1.TextureMesh.Params);
    const values = texture_mesh_1.TextureMesh.Utils.createValuesSimple(textureMesh, props, names_1.ColorNames.orange, 1);
    const state = texture_mesh_1.TextureMesh.Utils.createRenderableState(props);
    return (0, render_object_1.createRenderObject)('texture-mesh', values, state, -1);
}
describe('texture-mesh', () => {
    const ctx = (0, gl_1.tryGetGLContext)(32, 32);
    (ctx ? it : it.skip)('basic', async () => {
        const ctx = (0, gl_1.getGLContext)(32, 32);
        const scene = scene_1.Scene.create(ctx);
        const textureMesh = createTextureMesh();
        scene.add(textureMesh);
        (0, debug_1.setDebugMode)(true);
        expect(() => scene.commit()).not.toThrow();
        (0, debug_1.setDebugMode)(false);
        ctx.destroy();
    });
});
