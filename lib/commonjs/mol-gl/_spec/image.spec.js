"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImage = createImage;
const render_object_1 = require("../render-object");
const scene_1 = require("../scene");
const gl_1 = require("./gl");
const debug_1 = require("../../mol-util/debug");
const names_1 = require("../../mol-util/color/names");
const param_definition_1 = require("../../mol-util/param-definition");
const image_1 = require("../../mol-geo/geometry/image/image");
function createImage() {
    const image = image_1.Image.createEmpty();
    const props = param_definition_1.ParamDefinition.getDefaultValues(image_1.Image.Params);
    const values = image_1.Image.Utils.createValuesSimple(image, props, names_1.ColorNames.orange, 1);
    const state = image_1.Image.Utils.createRenderableState(props);
    return (0, render_object_1.createRenderObject)('image', values, state, -1);
}
describe('image', () => {
    const ctx = (0, gl_1.tryGetGLContext)(32, 32);
    (ctx ? it : it.skip)('basic', async () => {
        const ctx = (0, gl_1.getGLContext)(32, 32);
        const scene = scene_1.Scene.create(ctx);
        const image = createImage();
        scene.add(image);
        (0, debug_1.setDebugMode)(true);
        expect(() => scene.commit()).not.toThrow();
        (0, debug_1.setDebugMode)(false);
        ctx.destroy();
    });
});
