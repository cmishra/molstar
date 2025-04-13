"use strict";
/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpheres = createSpheres;
const render_object_1 = require("../render-object");
const scene_1 = require("../scene");
const gl_1 = require("./gl");
const debug_1 = require("../../mol-util/debug");
const names_1 = require("../../mol-util/color/names");
const param_definition_1 = require("../../mol-util/param-definition");
const spheres_1 = require("../../mol-geo/geometry/spheres/spheres");
function createSpheres() {
    const spheres = spheres_1.Spheres.createEmpty();
    const props = param_definition_1.ParamDefinition.getDefaultValues(spheres_1.Spheres.Params);
    const values = spheres_1.Spheres.Utils.createValuesSimple(spheres, props, names_1.ColorNames.orange, 1);
    const state = spheres_1.Spheres.Utils.createRenderableState(props);
    return (0, render_object_1.createRenderObject)('spheres', values, state, -1);
}
describe('spheres', () => {
    const ctx = (0, gl_1.tryGetGLContext)(32, 32, { fragDepth: true, textureFloat: true });
    (ctx ? it : it.skip)('basic', async () => {
        const ctx = (0, gl_1.getGLContext)(32, 32);
        const scene = scene_1.Scene.create(ctx);
        const spheres = createSpheres();
        scene.add(spheres);
        (0, debug_1.setDebugMode)(true);
        expect(() => scene.commit()).not.toThrow();
        (0, debug_1.setDebugMode)(false);
        ctx.destroy();
    });
});
