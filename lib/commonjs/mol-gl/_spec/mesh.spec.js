"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMesh = createMesh;
const render_object_1 = require("../render-object");
const scene_1 = require("../scene");
const gl_1 = require("./gl");
const debug_1 = require("../../mol-util/debug");
const names_1 = require("../../mol-util/color/names");
const param_definition_1 = require("../../mol-util/param-definition");
const mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
function createMesh() {
    const mesh = mesh_1.Mesh.createEmpty();
    const props = param_definition_1.ParamDefinition.getDefaultValues(mesh_1.Mesh.Params);
    const values = mesh_1.Mesh.Utils.createValuesSimple(mesh, props, names_1.ColorNames.orange, 1);
    const state = mesh_1.Mesh.Utils.createRenderableState(props);
    return (0, render_object_1.createRenderObject)('mesh', values, state, -1);
}
describe('mesh', () => {
    const ctx = (0, gl_1.tryGetGLContext)(32, 32);
    (ctx ? it : it.skip)('basic', async () => {
        const ctx = (0, gl_1.getGLContext)(32, 32);
        const scene = scene_1.Scene.create(ctx);
        const mesh = createMesh();
        scene.add(mesh);
        (0, debug_1.setDebugMode)(true);
        expect(() => scene.commit()).not.toThrow();
        (0, debug_1.setDebugMode)(false);
        ctx.destroy();
    });
});
