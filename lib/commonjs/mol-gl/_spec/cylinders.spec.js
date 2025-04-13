"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCylinders = createCylinders;
const render_object_1 = require("../render-object");
const scene_1 = require("../scene");
const gl_1 = require("./gl");
const debug_1 = require("../../mol-util/debug");
const names_1 = require("../../mol-util/color/names");
const param_definition_1 = require("../../mol-util/param-definition");
const cylinders_1 = require("../../mol-geo/geometry/cylinders/cylinders");
function createCylinders() {
    const cylinders = cylinders_1.Cylinders.createEmpty();
    const props = param_definition_1.ParamDefinition.getDefaultValues(cylinders_1.Cylinders.Params);
    const values = cylinders_1.Cylinders.Utils.createValuesSimple(cylinders, props, names_1.ColorNames.orange, 1);
    const state = cylinders_1.Cylinders.Utils.createRenderableState(props);
    return (0, render_object_1.createRenderObject)('cylinders', values, state, -1);
}
describe('cylinders', () => {
    const ctx = (0, gl_1.tryGetGLContext)(32, 32, { fragDepth: true });
    (ctx ? it : it.skip)('basic', async () => {
        const ctx = (0, gl_1.getGLContext)(32, 32);
        const scene = scene_1.Scene.create(ctx);
        const cylinders = createCylinders();
        scene.add(cylinders);
        (0, debug_1.setDebugMode)(true);
        expect(() => scene.commit()).not.toThrow();
        (0, debug_1.setDebugMode)(false);
        ctx.destroy();
    });
});
