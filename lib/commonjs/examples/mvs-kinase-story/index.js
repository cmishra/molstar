"use strict";
/**
 * Copyright (c) 2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MolComponents = void 0;
const context_1 = require("./context");
require("./index.html");
require("./elements/snapshot-markdown");
require("./elements/viewer");
const kinase_story_1 = require("./kinase-story");
require("../../mol-plugin-ui/skin/light.scss");
require("./styles.scss");
const download_1 = require("../../mol-util/download");
class MolComponents {
    getContext(name) {
        return (0, context_1.getMolComponentContext)({ name });
    }
}
exports.MolComponents = MolComponents;
window.mc = new MolComponents();
window.buildStory = kinase_story_1.buildStory;
window.molStarDownload = download_1.download;
