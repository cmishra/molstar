/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Neli Fonseca <neli@ebi.ac.uk>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { ANVILMembraneOrientation } from '../../extensions/anvil/behavior';
import { Backgrounds } from '../../extensions/backgrounds';
import { DnatcoNtCs } from '../../extensions/dnatco';
import { G3DFormat, G3dProvider } from '../../extensions/g3d/format';
import { GeometryExport } from '../../extensions/geo-export';
import { MAQualityAssessment, MAQualityAssessmentConfig, QualityAssessmentPLDDTPreset, QualityAssessmentQmeanPreset } from '../../extensions/model-archive/quality-assessment/behavior';
import { QualityAssessment } from '../../extensions/model-archive/quality-assessment/prop';
import { ModelExport } from '../../extensions/model-export';
import { Mp4Export } from '../../extensions/mp4-export';
import { MolViewSpec } from '../../extensions/mvs/behavior';
import { loadMVSX } from '../../extensions/mvs/components/formats';
import { loadMVS } from '../../extensions/mvs/load';
import { MVSData } from '../../extensions/mvs/mvs-data';
import { PDBeStructureQualityReport } from '../../extensions/pdbe';
import { RCSBValidationReport } from '../../extensions/rcsb';
import { AssemblySymmetry, AssemblySymmetryConfig } from '../../extensions/assembly-symmetry';
import { SbNcbrPartialCharges, SbNcbrPartialChargesPreset, SbNcbrPartialChargesPropertyProvider, SbNcbrTunnels } from '../../extensions/sb-ncbr';
import { wwPDBChemicalComponentDictionary } from '../../extensions/wwpdb/ccd/behavior';
import { wwPDBStructConnExtensionFunctions } from '../../extensions/wwpdb/struct-conn';
import { ZenodoImport } from '../../extensions/zenodo';
import { Volume } from '../../mol-model/volume';
import { DownloadStructure, PdbDownloadProvider } from '../../mol-plugin-state/actions/structure';
import { DownloadDensity } from '../../mol-plugin-state/actions/volume';
import { PresetStructureRepresentations, StructureRepresentationPresetProvider } from '../../mol-plugin-state/builder/structure/representation-preset';
import { createVolumeRepresentationParams } from '../../mol-plugin-state/helpers/volume-representation-params';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { TrajectoryFromModelAndCoordinates } from '../../mol-plugin-state/transforms/model';
import { createPluginUI } from '../../mol-plugin-ui';
import { renderReact18 } from '../../mol-plugin-ui/react18';
import { DefaultPluginUISpec } from '../../mol-plugin-ui/spec';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { PluginSpec } from '../../mol-plugin/spec';
import { StateObjectRef } from '../../mol-state';
import { Task } from '../../mol-task';
import { Asset } from '../../mol-util/assets';
import { Color } from '../../mol-util/color';
import '../../mol-util/polyfill';
import { ObjectKeys } from '../../mol-util/type-helpers';
import { OpenFiles } from '../../mol-plugin-state/actions/file';
export { PLUGIN_VERSION as version } from '../../mol-plugin/version';
export { consoleStats, setDebugMode, setProductionMode, setTimingMode, isProductionMode, isDebugMode, isTimingMode } from '../../mol-util/debug';
const CustomFormats = [
    ['g3d', G3dProvider]
];
export const ExtensionMap = {
    'backgrounds': PluginSpec.Behavior(Backgrounds),
    'dnatco-ntcs': PluginSpec.Behavior(DnatcoNtCs),
    'pdbe-structure-quality-report': PluginSpec.Behavior(PDBeStructureQualityReport),
    'assembly-symmetry': PluginSpec.Behavior(AssemblySymmetry),
    'rcsb-validation-report': PluginSpec.Behavior(RCSBValidationReport),
    'anvil-membrane-orientation': PluginSpec.Behavior(ANVILMembraneOrientation),
    'g3d': PluginSpec.Behavior(G3DFormat),
    'model-export': PluginSpec.Behavior(ModelExport),
    'mp4-export': PluginSpec.Behavior(Mp4Export),
    'geo-export': PluginSpec.Behavior(GeometryExport),
    'ma-quality-assessment': PluginSpec.Behavior(MAQualityAssessment),
    'zenodo-import': PluginSpec.Behavior(ZenodoImport),
    'sb-ncbr-partial-charges': PluginSpec.Behavior(SbNcbrPartialCharges),
    'wwpdb-chemical-component-dictionary': PluginSpec.Behavior(wwPDBChemicalComponentDictionary),
    'mvs': PluginSpec.Behavior(MolViewSpec),
    'tunnels': PluginSpec.Behavior(SbNcbrTunnels),
};
const DefaultViewerOptions = {
    customFormats: CustomFormats,
    extensions: ObjectKeys(ExtensionMap),
    disabledExtensions: [],
    layoutIsExpanded: true,
    layoutShowControls: true,
    layoutShowRemoteState: true,
    layoutControlsDisplay: 'reactive',
    layoutShowSequence: true,
    layoutShowLog: true,
    layoutShowLeftPanel: true,
    collapseLeftPanel: false,
    collapseRightPanel: false,
    disableAntialiasing: PluginConfig.General.DisableAntialiasing.defaultValue,
    pixelScale: PluginConfig.General.PixelScale.defaultValue,
    pickScale: PluginConfig.General.PickScale.defaultValue,
    transparency: PluginConfig.General.Transparency.defaultValue,
    preferWebgl1: PluginConfig.General.PreferWebGl1.defaultValue,
    allowMajorPerformanceCaveat: PluginConfig.General.AllowMajorPerformanceCaveat.defaultValue,
    powerPreference: PluginConfig.General.PowerPreference.defaultValue,
    resolutionMode: PluginConfig.General.ResolutionMode.defaultValue,
    illumination: false,
    viewportShowExpand: PluginConfig.Viewport.ShowExpand.defaultValue,
    viewportShowControls: PluginConfig.Viewport.ShowControls.defaultValue,
    viewportShowSettings: PluginConfig.Viewport.ShowSettings.defaultValue,
    viewportShowSelectionMode: PluginConfig.Viewport.ShowSelectionMode.defaultValue,
    viewportShowAnimation: PluginConfig.Viewport.ShowAnimation.defaultValue,
    viewportShowTrajectoryControls: PluginConfig.Viewport.ShowTrajectoryControls.defaultValue,
    pluginStateServer: PluginConfig.State.DefaultServer.defaultValue,
    volumeStreamingServer: PluginConfig.VolumeStreaming.DefaultServer.defaultValue,
    volumeStreamingDisabled: !PluginConfig.VolumeStreaming.Enabled.defaultValue,
    pdbProvider: PluginConfig.Download.DefaultPdbProvider.defaultValue,
    emdbProvider: PluginConfig.Download.DefaultEmdbProvider.defaultValue,
    saccharideCompIdMapType: 'default',
    rcsbAssemblySymmetryDefaultServerType: AssemblySymmetryConfig.DefaultServerType.defaultValue,
    rcsbAssemblySymmetryDefaultServerUrl: AssemblySymmetryConfig.DefaultServerUrl.defaultValue,
    rcsbAssemblySymmetryApplyColors: AssemblySymmetryConfig.ApplyColors.defaultValue,
    config: [],
};
export class Viewer {
    constructor(plugin) {
        this.plugin = plugin;
    }
    static async create(elementOrId, options = {}) {
        var _a, _b, _c, _d;
        const definedOptions = {};
        // filter for defined properies only so the default values
        // are property applied
        for (const p of Object.keys(options)) {
            if (options[p] !== void 0)
                definedOptions[p] = options[p];
        }
        const o = { ...DefaultViewerOptions, ...definedOptions };
        const defaultSpec = DefaultPluginUISpec();
        const disabledExtension = new Set((_a = o.disabledExtensions) !== null && _a !== void 0 ? _a : []);
        const spec = {
            actions: defaultSpec.actions,
            behaviors: [
                ...defaultSpec.behaviors,
                ...o.extensions.filter(e => !disabledExtension.has(e)).map(e => ExtensionMap[e]),
            ],
            animations: [...defaultSpec.animations || []],
            customParamEditors: defaultSpec.customParamEditors,
            customFormats: o === null || o === void 0 ? void 0 : o.customFormats,
            layout: {
                initial: {
                    isExpanded: o.layoutIsExpanded,
                    showControls: o.layoutShowControls,
                    controlsDisplay: o.layoutControlsDisplay,
                    regionState: {
                        bottom: 'full',
                        left: o.collapseLeftPanel ? 'collapsed' : 'full',
                        right: o.collapseRightPanel ? 'hidden' : 'full',
                        top: 'full',
                    }
                },
            },
            components: {
                ...defaultSpec.components,
                controls: {
                    ...(_b = defaultSpec.components) === null || _b === void 0 ? void 0 : _b.controls,
                    top: o.layoutShowSequence ? undefined : 'none',
                    bottom: o.layoutShowLog ? undefined : 'none',
                    left: o.layoutShowLeftPanel ? undefined : 'none',
                },
                remoteState: o.layoutShowRemoteState ? 'default' : 'none',
            },
            config: [
                [PluginConfig.General.DisableAntialiasing, o.disableAntialiasing],
                [PluginConfig.General.PixelScale, o.pixelScale],
                [PluginConfig.General.PickScale, o.pickScale],
                [PluginConfig.General.Transparency, o.transparency],
                [PluginConfig.General.PreferWebGl1, o.preferWebgl1],
                [PluginConfig.General.AllowMajorPerformanceCaveat, o.allowMajorPerformanceCaveat],
                [PluginConfig.General.PowerPreference, o.powerPreference],
                [PluginConfig.General.ResolutionMode, o.resolutionMode],
                [PluginConfig.Viewport.ShowExpand, o.viewportShowExpand],
                [PluginConfig.Viewport.ShowControls, o.viewportShowControls],
                [PluginConfig.Viewport.ShowSettings, o.viewportShowSettings],
                [PluginConfig.Viewport.ShowSelectionMode, o.viewportShowSelectionMode],
                [PluginConfig.Viewport.ShowAnimation, o.viewportShowAnimation],
                [PluginConfig.Viewport.ShowTrajectoryControls, o.viewportShowTrajectoryControls],
                [PluginConfig.State.DefaultServer, o.pluginStateServer],
                [PluginConfig.State.CurrentServer, o.pluginStateServer],
                [PluginConfig.VolumeStreaming.DefaultServer, o.volumeStreamingServer],
                [PluginConfig.VolumeStreaming.Enabled, !o.volumeStreamingDisabled],
                [PluginConfig.Download.DefaultPdbProvider, o.pdbProvider],
                [PluginConfig.Download.DefaultEmdbProvider, o.emdbProvider],
                [PluginConfig.Structure.DefaultRepresentationPreset, ViewerAutoPreset.id],
                [PluginConfig.Structure.SaccharideCompIdMapType, o.saccharideCompIdMapType],
                [AssemblySymmetryConfig.DefaultServerType, o.rcsbAssemblySymmetryDefaultServerType],
                [AssemblySymmetryConfig.DefaultServerUrl, o.rcsbAssemblySymmetryDefaultServerUrl],
                [AssemblySymmetryConfig.ApplyColors, o.rcsbAssemblySymmetryApplyColors],
                ...((_c = o.config) !== null && _c !== void 0 ? _c : []),
            ]
        };
        const element = typeof elementOrId === 'string'
            ? document.getElementById(elementOrId)
            : elementOrId;
        if (!element)
            throw new Error(`Could not get element with id '${elementOrId}'`);
        const plugin = await createPluginUI({
            target: element,
            spec,
            render: renderReact18,
            onBeforeUIRender: plugin => {
                // the preset needs to be added before the UI renders otherwise
                // "Download Structure" wont be able to pick it up
                plugin.builders.structure.representation.registerPreset(ViewerAutoPreset);
            }
        });
        (_d = plugin.canvas3d) === null || _d === void 0 ? void 0 : _d.setProps({ illumination: { enabled: o.illumination } });
        return new Viewer(plugin);
    }
    setRemoteSnapshot(id) {
        const url = `${this.plugin.config.get(PluginConfig.State.CurrentServer)}/get/${id}`;
        return PluginCommands.State.Snapshots.Fetch(this.plugin, { url });
    }
    loadSnapshotFromUrl(url, type) {
        return PluginCommands.State.Snapshots.OpenUrl(this.plugin, { url, type });
    }
    loadStructureFromUrl(url, format = 'mmcif', isBinary = false, options) {
        const params = DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
        return this.plugin.runTask(this.plugin.state.data.applyAction(DownloadStructure, {
            source: {
                name: 'url',
                params: {
                    url: Asset.Url(url),
                    format: format,
                    isBinary,
                    label: options === null || options === void 0 ? void 0 : options.label,
                    options: { ...params.source.params.options, representationParams: options === null || options === void 0 ? void 0 : options.representationParams },
                }
            }
        }));
    }
    async loadAllModelsOrAssemblyFromUrl(url, format = 'mmcif', isBinary = false, options) {
        const plugin = this.plugin;
        const data = await plugin.builders.data.download({ url, isBinary }, { state: { isGhost: true } });
        const trajectory = await plugin.builders.structure.parseTrajectory(data, format);
        await this.plugin.builders.structure.hierarchy.applyPreset(trajectory, 'all-models', { useDefaultIfSingleModel: true, representationPresetParams: options === null || options === void 0 ? void 0 : options.representationParams });
    }
    async loadStructureFromData(data, format, options) {
        const _data = await this.plugin.builders.data.rawData({ data, label: options === null || options === void 0 ? void 0 : options.dataLabel });
        const trajectory = await this.plugin.builders.structure.parseTrajectory(_data, format);
        await this.plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
    }
    loadPdb(pdb, options) {
        const params = DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
        const provider = this.plugin.config.get(PluginConfig.Download.DefaultPdbProvider);
        return this.plugin.runTask(this.plugin.state.data.applyAction(DownloadStructure, {
            source: {
                name: 'pdb',
                params: {
                    provider: {
                        id: pdb,
                        server: {
                            name: provider,
                            params: PdbDownloadProvider[provider].defaultValue
                        }
                    },
                    options: { ...params.source.params.options, representationParams: options === null || options === void 0 ? void 0 : options.representationParams },
                }
            }
        }));
    }
    /**
     * @deprecated Scheduled for removal in v5. Use {@link loadPdbIhm | loadPdbIhm(pdbIhm: string)} instead.
     */
    loadPdbDev(pdbDev) {
        return this.loadPdbIhm(pdbDev);
    }
    loadPdbIhm(pdbIhm) {
        const params = DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
        return this.plugin.runTask(this.plugin.state.data.applyAction(DownloadStructure, {
            source: {
                name: 'pdb-ihm',
                params: {
                    provider: {
                        id: pdbIhm,
                        encoding: 'bcif',
                    },
                    options: params.source.params.options,
                }
            }
        }));
    }
    loadEmdb(emdb, options) {
        var _a;
        const provider = this.plugin.config.get(PluginConfig.Download.DefaultEmdbProvider);
        return this.plugin.runTask(this.plugin.state.data.applyAction(DownloadDensity, {
            source: {
                name: 'pdb-emd-ds',
                params: {
                    provider: {
                        id: emdb,
                        server: provider,
                    },
                    detail: (_a = options === null || options === void 0 ? void 0 : options.detail) !== null && _a !== void 0 ? _a : 3,
                }
            }
        }));
    }
    loadAlphaFoldDb(afdb) {
        const params = DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
        return this.plugin.runTask(this.plugin.state.data.applyAction(DownloadStructure, {
            source: {
                name: 'alphafolddb',
                params: {
                    provider: {
                        id: afdb,
                        encoding: 'bcif'
                    },
                    options: {
                        ...params.source.params.options,
                        representation: 'preset-structure-representation-ma-quality-assessment-plddt'
                    },
                }
            }
        }));
    }
    loadModelArchive(id) {
        const params = DownloadStructure.createDefaultParams(this.plugin.state.data.root.obj, this.plugin);
        return this.plugin.runTask(this.plugin.state.data.applyAction(DownloadStructure, {
            source: {
                name: 'modelarchive',
                params: {
                    id,
                    options: params.source.params.options,
                }
            }
        }));
    }
    /**
     * @example Load X-ray density from volume server
        viewer.loadVolumeFromUrl({
            url: 'https://www.ebi.ac.uk/pdbe/densities/x-ray/1tqn/cell?detail=3',
            format: 'dscif',
            isBinary: true
        }, [{
            type: 'relative',
            value: 1.5,
            color: 0x3362B2
        }, {
            type: 'relative',
            value: 3,
            color: 0x33BB33,
            volumeIndex: 1
        }, {
            type: 'relative',
            value: -3,
            color: 0xBB3333,
            volumeIndex: 1
        }], {
            entryId: ['2FO-FC', 'FO-FC'],
            isLazy: true
        });
     * *********************
     * @example Load EM density from volume server
        viewer.loadVolumeFromUrl({
            url: 'https://maps.rcsb.org/em/emd-30210/cell?detail=6',
            format: 'dscif',
            isBinary: true
        }, [{
            type: 'relative',
            value: 1,
            color: 0x3377aa
        }], {
            entryId: 'EMD-30210',
            isLazy: true
        });
     */
    async loadVolumeFromUrl({ url, format, isBinary }, isovalues, options) {
        const plugin = this.plugin;
        if (!plugin.dataFormats.get(format)) {
            throw new Error(`Unknown density format: ${format}`);
        }
        if (options === null || options === void 0 ? void 0 : options.isLazy) {
            const update = this.plugin.build();
            update.toRoot().apply(StateTransforms.Data.LazyVolume, {
                url,
                format,
                entryId: options === null || options === void 0 ? void 0 : options.entryId,
                isBinary,
                isovalues: isovalues.map(v => ({ alpha: 1, volumeIndex: 0, ...v }))
            });
            return update.commit();
        }
        return plugin.dataTransaction(async () => {
            var _a, _b, _c, _d;
            const data = await plugin.builders.data.download({ url, isBinary }, { state: { isGhost: true } });
            const parsed = await plugin.dataFormats.get(format).parse(plugin, data, { entryId: options === null || options === void 0 ? void 0 : options.entryId });
            const firstVolume = (parsed.volume || parsed.volumes[0]);
            if (!(firstVolume === null || firstVolume === void 0 ? void 0 : firstVolume.isOk))
                throw new Error('Failed to parse any volume.');
            const repr = plugin.build();
            for (const iso of isovalues) {
                const volume = (_c = (_a = parsed.volumes) === null || _a === void 0 ? void 0 : _a[(_b = iso.volumeIndex) !== null && _b !== void 0 ? _b : 0]) !== null && _c !== void 0 ? _c : parsed.volume;
                const volumeData = volume.cell.obj.data;
                repr
                    .to(volume)
                    .apply(StateTransforms.Representation.VolumeRepresentation3D, createVolumeRepresentationParams(this.plugin, firstVolume.data, {
                    type: 'isosurface',
                    typeParams: { alpha: (_d = iso.alpha) !== null && _d !== void 0 ? _d : 1, isoValue: Volume.adjustedIsoValue(volumeData, iso.value, iso.type) },
                    color: 'uniform',
                    colorParams: { value: iso.color }
                }));
            }
            await repr.commit();
        });
    }
    loadFullResolutionEMDBMap(emdbId, options) {
        const plugin = this.plugin;
        const numericId = parseInt(emdbId.toUpperCase().replace('EMD-', ''));
        const url = `https://ftp.ebi.ac.uk/pub/databases/emdb/structures/EMD-${numericId}/map/emd_${numericId}.map.gz`;
        return plugin.dataTransaction(async () => {
            var _a, _b, _c;
            const data = await plugin.build().toRoot()
                .apply(StateTransforms.Data.Download, { url, isBinary: true, label: emdbId }, { state: { isGhost: true } })
                .apply(StateTransforms.Data.DeflateData)
                .commit();
            const parsed = await plugin.dataFormats.get('ccp4').parse(plugin, data, { entryId: emdbId });
            const firstVolume = (parsed.volume || parsed.volumes[0]);
            if (!(firstVolume === null || firstVolume === void 0 ? void 0 : firstVolume.isOk))
                throw new Error('Failed to parse any volume.');
            const volume = (_b = (_a = parsed.volumes) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : parsed.volume;
            await plugin.build()
                .to(volume)
                .apply(StateTransforms.Representation.VolumeRepresentation3D, createVolumeRepresentationParams(this.plugin, firstVolume.data, {
                type: 'isosurface',
                typeParams: { alpha: 1, isoValue: options.isoValue },
                color: 'uniform',
                colorParams: { value: (_c = options.color) !== null && _c !== void 0 ? _c : Color(0x33BB33) }
            }))
                .commit();
        });
    }
    /**
     * @example
     *  viewer.loadTrajectory({
     *      model: { kind: 'model-url', url: 'villin.gro', format: 'gro' },
     *      coordinates: { kind: 'coordinates-url', url: 'villin.xtc', format: 'xtc', isBinary: true },
     *      preset: 'all-models' // or 'default'
     *  });
     */
    async loadTrajectory(params) {
        var _a, _b;
        const plugin = this.plugin;
        let model;
        if (params.model.kind === 'model-data' || params.model.kind === 'model-url') {
            const data = params.model.kind === 'model-data'
                ? await plugin.builders.data.rawData({ data: params.model.data, label: params.modelLabel })
                : await plugin.builders.data.download({ url: params.model.url, isBinary: params.model.isBinary, label: params.modelLabel });
            const trajectory = await plugin.builders.structure.parseTrajectory(data, (_a = params.model.format) !== null && _a !== void 0 ? _a : 'mmcif');
            model = await plugin.builders.structure.createModel(trajectory);
        }
        else {
            const data = params.model.kind === 'topology-data'
                ? await plugin.builders.data.rawData({ data: params.model.data, label: params.modelLabel })
                : await plugin.builders.data.download({ url: params.model.url, isBinary: params.model.isBinary, label: params.modelLabel });
            const provider = plugin.dataFormats.get(params.model.format);
            model = await provider.parse(plugin, data);
        }
        const data = params.coordinates.kind === 'coordinates-data'
            ? await plugin.builders.data.rawData({ data: params.coordinates.data, label: params.coordinatesLabel })
            : await plugin.builders.data.download({ url: params.coordinates.url, isBinary: params.coordinates.isBinary, label: params.coordinatesLabel });
        const provider = plugin.dataFormats.get(params.coordinates.format);
        const coords = await provider.parse(plugin, data);
        const trajectory = await plugin.build().toRoot()
            .apply(TrajectoryFromModelAndCoordinates, {
            modelRef: model.ref,
            coordinatesRef: coords.ref
        }, { dependsOn: [model.ref, coords.ref] })
            .commit();
        const preset = await plugin.builders.structure.hierarchy.applyPreset(trajectory, (_b = params.preset) !== null && _b !== void 0 ? _b : 'default');
        return { model, coords, preset };
    }
    async loadMvsFromUrl(url, format, options) {
        if (format === 'mvsj') {
            const data = await this.plugin.runTask(this.plugin.fetch({ url, type: 'string' }));
            const mvsData = MVSData.fromMVSJ(data);
            await loadMVS(this.plugin, mvsData, { sanityChecks: true, sourceUrl: url, ...options });
        }
        else if (format === 'mvsx') {
            const data = await this.plugin.runTask(this.plugin.fetch({ url, type: 'binary' }));
            await this.plugin.runTask(Task.create('Load MVSX file', async (ctx) => {
                const parsed = await loadMVSX(this.plugin, ctx, data);
                await loadMVS(this.plugin, parsed.mvsData, { sanityChecks: true, sourceUrl: parsed.sourceUrl, ...options });
            }));
        }
        else {
            throw new Error(`Unknown MolViewSpec format: ${format}`);
        }
    }
    /** Load MolViewSpec from `data`.
     * If `format` is 'mvsj', `data` must be a string or a Uint8Array containing a UTF8-encoded string.
     * If `format` is 'mvsx', `data` must be a Uint8Array or a string containing base64-encoded binary data prefixed with 'base64,'. */
    async loadMvsData(data, format, options) {
        if (typeof data === 'string' && data.startsWith('base64')) {
            data = Uint8Array.from(atob(data.substring(7)), c => c.charCodeAt(0)); // Decode base64 string to Uint8Array
        }
        if (format === 'mvsj') {
            if (typeof data !== 'string') {
                data = new TextDecoder().decode(data); // Decode Uint8Array to string using UTF8
            }
            const mvsData = MVSData.fromMVSJ(data);
            await loadMVS(this.plugin, mvsData, { sanityChecks: true, sourceUrl: undefined, ...options });
        }
        else if (format === 'mvsx') {
            if (typeof data === 'string') {
                throw new Error("loadMvsData: if `format` is 'mvsx', then `data` must be a Uint8Array or a base64-encoded string prefixed with 'base64,'.");
            }
            await this.plugin.runTask(Task.create('Load MVSX file', async (ctx) => {
                const parsed = await loadMVSX(this.plugin, ctx, data);
                await loadMVS(this.plugin, parsed.mvsData, { sanityChecks: true, sourceUrl: parsed.sourceUrl, ...options });
            }));
        }
        else {
            throw new Error(`Unknown MolViewSpec format: ${format}`);
        }
    }
    loadFiles(files) {
        const sessions = files.filter(f => {
            const fn = f.name.toLowerCase();
            return fn.endsWith('.molx') || fn.endsWith('.molj');
        });
        if (sessions.length > 0) {
            return PluginCommands.State.Snapshots.OpenFile(this.plugin, { file: sessions[0] });
        }
        else {
            return this.plugin.runTask(this.plugin.state.data.applyAction(OpenFiles, {
                files: files.map(f => Asset.File(f)),
                format: { name: 'auto', params: {} },
                visuals: true
            }));
        }
    }
    handleResize() {
        this.plugin.layout.events.updated.next(void 0);
    }
    dispose() {
        this.plugin.dispose();
    }
}
export const ViewerAutoPreset = StructureRepresentationPresetProvider({
    id: 'preset-structure-representation-viewer-auto',
    display: {
        name: 'Automatic (w/ Annotation)', group: 'Annotation',
        description: 'Show standard automatic representation but colored by quality assessment (if available in the model).'
    },
    isApplicable(a) {
        return (!!a.data.models.some(m => QualityAssessment.isApplicable(m, 'pLDDT')) ||
            !!a.data.models.some(m => QualityAssessment.isApplicable(m, 'qmean')));
    },
    params: () => StructureRepresentationPresetProvider.CommonParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        if (!!structure.models.some(m => QualityAssessment.isApplicable(m, 'pLDDT'))) {
            return await QualityAssessmentPLDDTPreset.apply(ref, params, plugin);
        }
        else if (!!structure.models.some(m => QualityAssessment.isApplicable(m, 'qmean'))) {
            return await QualityAssessmentQmeanPreset.apply(ref, params, plugin);
        }
        else if (!!structure.models.some(m => SbNcbrPartialChargesPropertyProvider.isApplicable(m))) {
            return await SbNcbrPartialChargesPreset.apply(ref, params, plugin);
        }
        else {
            return await PresetStructureRepresentations.auto.apply(ref, params, plugin);
        }
    }
});
export const PluginExtensions = {
    wwPDBStructConn: wwPDBStructConnExtensionFunctions,
    mvs: { MVSData, loadMVS },
    modelArchive: {
        qualityAssessment: {
            config: MAQualityAssessmentConfig
        }
    }
};
