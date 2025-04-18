"use strict";
/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MVSXFormatProvider = exports.MVSJFormatProvider = exports.LoadMvsData = exports.LoadMvsDataParams = exports.ParseMVSX = exports.ParseMVSJ = exports.Mvs = void 0;
exports.loadMVSX = loadMVSX;
const util_1 = require("../../../mol-data/util");
const provider_1 = require("../../../mol-plugin-state/formats/provider");
const objects_1 = require("../../../mol-plugin-state/objects");
const data_1 = require("../../../mol-plugin-state/transforms/data");
const mol_state_1 = require("../../../mol-state");
const mol_task_1 = require("../../../mol-task");
const assets_1 = require("../../../mol-util/assets");
const param_definition_1 = require("../../../mol-util/param-definition");
const zip_1 = require("../../../mol-util/zip/zip");
const load_1 = require("../load");
const mvs_data_1 = require("../mvs-data");
const annotation_structure_component_1 = require("./annotation-structure-component");
/** Plugin state object storing `MVSData` */
class Mvs extends objects_1.PluginStateObject.Create({ name: 'MVS Data', typeClass: 'Data' }) {
}
exports.Mvs = Mvs;
/** Transformer for parsing data in MVSJ format */
exports.ParseMVSJ = (0, annotation_structure_component_1.MVSTransform)({
    name: 'mvs-parse-mvsj',
    display: { name: 'MolViewSpec from MVSJ', description: 'Create MolViewSpec view from MVSJ data' },
    from: objects_1.PluginStateObject.Data.String,
    to: Mvs,
})({
    apply({ a }, plugin) {
        const mvsData = mvs_data_1.MVSData.fromMVSJ(a.data);
        const sourceUrl = tryGetDownloadUrl(a, plugin);
        return new Mvs({ mvsData, sourceUrl });
    },
});
/** Transformer for parsing data in MVSX format (= zipped MVSJ + referenced files like structures and annotations) */
exports.ParseMVSX = (0, annotation_structure_component_1.MVSTransform)({
    name: 'mvs-parse-mvsx',
    display: { name: 'MolViewSpec from MVSX', description: 'Create MolViewSpec view from MVSX data' },
    from: objects_1.PluginStateObject.Data.Binary,
    to: Mvs,
    params: {
        mainFilePath: param_definition_1.ParamDefinition.Text('index.mvsj'),
    },
})({
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Parse MVSX file', async (ctx) => {
            const data = await loadMVSX(plugin, ctx, a.data, params.mainFilePath);
            return new Mvs(data);
        });
    },
});
/** Params for the `LoadMvsData` action */
exports.LoadMvsDataParams = {
    replaceExisting: param_definition_1.ParamDefinition.Boolean(false, { description: 'If true, the loaded MVS view will replace the current state; if false, the MVS view will be added to the current state.' }),
    keepCamera: param_definition_1.ParamDefinition.Boolean(false, { description: 'If true, any camera positioning from the MVS state will be ignored and the current camera position will be kept.' }),
    applyExtensions: param_definition_1.ParamDefinition.Boolean(true, { description: 'If true, apply builtin MVS-loading extensions (not a part of standard MVS specification).' }),
};
/** State action which loads a MVS view into Mol* */
exports.LoadMvsData = mol_state_1.StateAction.build({
    display: { name: 'Load MVS Data' },
    from: Mvs,
    params: exports.LoadMvsDataParams,
})(({ a, params }, plugin) => mol_task_1.Task.create('Load MVS Data', async () => {
    const { mvsData, sourceUrl } = a.data;
    await (0, load_1.loadMVS)(plugin, mvsData, { replaceExisting: params.replaceExisting, keepCamera: params.keepCamera, sourceUrl: sourceUrl, extensions: params.applyExtensions ? undefined : [] });
}));
/** Data format provider for MVSJ format.
 * If Visuals:On, it will load the parsed MVS view;
 * otherwise it will just create a plugin state object with parsed data. */
exports.MVSJFormatProvider = (0, provider_1.DataFormatProvider)({
    label: 'MVSJ',
    description: 'MVSJ',
    category: 'Miscellaneous',
    stringExtensions: ['mvsj'],
    parse: async (plugin, data) => {
        return plugin.state.data.build().to(data).apply(exports.ParseMVSJ).commit();
    },
    visuals: async (plugin, data) => {
        const ref = mol_state_1.StateObjectRef.resolveRef(data);
        const params = param_definition_1.ParamDefinition.getDefaultValues(exports.LoadMvsDataParams);
        return await plugin.state.data.applyAction(exports.LoadMvsData, params, ref).run();
    },
});
/** Data format provider for MVSX format.
 * If Visuals:On, it will load the parsed MVS view;
 * otherwise it will just create a plugin state object with parsed data. */
exports.MVSXFormatProvider = (0, provider_1.DataFormatProvider)({
    label: 'MVSX',
    description: 'MVSX',
    category: 'Miscellaneous',
    binaryExtensions: ['mvsx'],
    parse: async (plugin, data) => {
        return plugin.state.data.build().to(data).apply(exports.ParseMVSX).commit();
    },
    visuals: exports.MVSJFormatProvider.visuals,
});
/** Parse binary data `data` as MVSX archive,
 * add all contained files to `plugin`'s asset manager,
 * and parse the main file in the archive as MVSJ.
 * Return parsed MVS data and `sourceUrl` for resolution of relative URIs.  */
async function loadMVSX(plugin, runtimeCtx, data, mainFilePath = 'index.mvsj') {
    const archiveId = `ni,fnv1a;${(0, util_1.hashFnv32a)(data)}`;
    let files;
    try {
        files = await (0, zip_1.unzip)(runtimeCtx, data);
    }
    catch (err) {
        plugin.log.error('Invalid MVSX file');
        throw err;
    }
    for (const path in files) {
        const url = arcpUri(archiveId, path);
        ensureUrlAsset(plugin.managers.asset, url, files[path]);
    }
    const mainFile = files[mainFilePath];
    if (!mainFile)
        throw new Error(`File ${mainFilePath} not found in the MVSX archive`);
    const mvsData = mvs_data_1.MVSData.fromMVSJ(decodeUtf8(mainFile));
    const sourceUrl = arcpUri(archiveId, mainFilePath);
    return { mvsData, sourceUrl };
}
/** If the PluginStateObject `pso` comes from a Download transform, try to get its `url` parameter. */
function tryGetDownloadUrl(pso, plugin) {
    var _a;
    const theCell = plugin.state.data.selectQ(q => q.ofTransformer(data_1.Download)).find(cell => cell.obj === pso);
    const urlParam = (_a = theCell === null || theCell === void 0 ? void 0 : theCell.transform.params) === null || _a === void 0 ? void 0 : _a.url;
    return urlParam ? assets_1.Asset.getUrl(urlParam) : undefined;
}
/** Return a URI referencing a file within an archive, using ARCP scheme (https://arxiv.org/pdf/1809.06935.pdf).
 * `archiveId` corresponds to the `authority` part of URI (e.g. 'uuid,EYVwjDiZhM20PWbF1OWWvQ' or 'ni,fnv1a;938511930')
 * `path` corresponds to the path to a file within the archive */
function arcpUri(archiveId, path) {
    return new URL(path, `arcp://${archiveId}/`).href;
}
/** Add a URL asset to asset manager.
 * Skip if an asset with the same URL already exists. */
function ensureUrlAsset(manager, url, data) {
    var _a;
    const asset = assets_1.Asset.getUrlAsset(manager, url);
    if (!manager.has(asset)) {
        const filename = (_a = url.split('/').pop()) !== null && _a !== void 0 ? _a : 'file';
        manager.set(asset, new File([data], filename));
    }
}
/** Decode bytes to text using UTF-8 encoding */
function decodeUtf8(bytes) {
    _decoder !== null && _decoder !== void 0 ? _decoder : (_decoder = new TextDecoder());
    return _decoder.decode(bytes);
}
let _decoder;
