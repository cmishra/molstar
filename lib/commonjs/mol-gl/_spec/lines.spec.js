"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLines = createLines;
const render_object_1 = require("../render-object");
const scene_1 = require("../scene");
const gl_1 = require("./gl");
const debug_1 = require("../../mol-util/debug");
const names_1 = require("../../mol-util/color/names");
const param_definition_1 = require("../../mol-util/param-definition");
const lines_1 = require("../../mol-geo/geometry/lines/lines");
function createLines() {
    const lines = lines_1.Lines.createEmpty();
    const props = param_definition_1.ParamDefinition.getDefaultValues(lines_1.Lines.Params);
    const values = lines_1.Lines.Utils.createValuesSimple(lines, props, names_1.ColorNames.orange, 1);
    const state = lines_1.Lines.Utils.createRenderableState(props);
    return (0, render_object_1.createRenderObject)('lines', values, state, -1);
}
describe('lines', () => {
    const ctx = (0, gl_1.tryGetGLContext)(32, 32);
    (ctx ? it : it.skip)('basic', async () => {
        const ctx = (0, gl_1.getGLContext)(32, 32);
        const scene = scene_1.Scene.create(ctx);
        const lines = createLines();
        scene.add(lines);
        (0, debug_1.setDebugMode)(true);
        expect(() => scene.commit()).not.toThrow();
        (0, debug_1.setDebugMode)(false);
        ctx.destroy();
    });
});
