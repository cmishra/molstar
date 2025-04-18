"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCellpackHierarchy = createCellpackHierarchy;
const representation_1 = require("../../../../mol-plugin-state/transforms/representation");
const spacefill_1 = require("../../../../mol-repr/structure/representation/spacefill");
const names_1 = require("../../../../mol-util/color/names");
const state_1 = require("../state");
const model_1 = require("./model");
function getSpacefillParams(color, sizeFactor, graphics, merge) {
    const gmp = (0, state_1.getGraphicsModeProps)(graphics === 'custom' ? 'quality' : graphics);
    return {
        type: {
            name: 'spacefill',
            params: {
                ...spacefill_1.SpacefillRepresentationProvider.defaultValues,
                ignoreHydrogens: false,
                instanceGranularity: true,
                ignoreLight: true,
                lodLevels: gmp.lodLevels,
                quality: 'lowest', // avoid 'auto', triggers boundary calc
                sizeFactor,
                clip: {
                    variant: merge ? 'pixel' : 'instance',
                    objects: [],
                },
                clipPrimitive: true,
                approximate: gmp.approximate,
                alphaThickness: gmp.alphaThickness,
                visuals: [merge ? 'structure-element-sphere' : 'element-sphere'],
            },
        },
        colorTheme: {
            name: 'uniform',
            params: {
                value: color,
                saturation: 0,
                lightness: 0,
            }
        },
        sizeTheme: {
            name: 'physical',
            params: {
                value: 1,
            }
        },
    };
}
function getSizeFactor(name) {
    switch (name) {
        case 'dLDL':
            return 2.5;
        case 'iLDL':
            return 5;
        case 'NP_CA':
        case 'POL_CA':
        case 'FactorH1':
        case 'iIgM_Antibody_5mer':
            // case 'MG_271_272_273_274_192MER': // has a coarse and an atomic part
            return 2;
        default: return 1;
    }
}
async function createCellpackHierarchy(plugin, trajectory) {
    var _a, _b, _c;
    const builder = plugin.builders.structure;
    const state = plugin.state.data;
    const model = await builder.createModel(trajectory, { modelIndex: 0 });
    const entities = model.data.entities.data;
    const compGroups = new Map();
    const compIds = new Map();
    const compColors = new Map();
    const funcGroups = new Map();
    const funcIds = new Map();
    const funcColors = new Map();
    const graphicsMode = state_1.MesoscaleState.get(plugin).graphics;
    const groupParams = (0, state_1.getMesoscaleGroupParams)(graphicsMode);
    const base = await state.build()
        .to(model)
        .apply(model_1.CellpackAssembly, { id: '' })
        .commit();
    const compRoot = await state.build()
        .toRoot()
        .apply(state_1.MesoscaleGroup, { ...groupParams, root: true, index: -1, tag: 'comp:', label: 'compartment', color: { type: 'custom', illustrative: false, value: names_1.ColorNames.white, variability: 20, shift: 0, lightness: 0, alpha: 1, emissive: 0 } }, { tags: 'group:comp:', state: { isCollapsed: false, isHidden: groupParams.hidden } })
        .commit();
    const funcRoot = await state.build()
        .toRoot()
        .apply(state_1.MesoscaleGroup, { ...groupParams, root: true, index: -1, tag: 'func:', label: 'function', color: { type: 'custom', illustrative: false, value: names_1.ColorNames.white, variability: 20, shift: 0, lightness: 0, alpha: 1, emissive: 0 } }, { tags: 'group:func:', state: { isCollapsed: false, isHidden: groupParams.hidden } })
        .commit();
    if (entities._rowCount > 1) {
        for (let i = 0; i < entities._rowCount; i++) {
            const description = entities.pdbx_description.value(i)[0] || 'unknown compartment';
            const d = description.split('.');
            const n = d.slice(0, -1).join('.');
            const l = d.at(-1);
            if (!compIds.has(n)) {
                compIds.set(n, { idx: compIds.size, members: new Map() });
            }
            const cm = compIds.get(n);
            cm.members.set(l, cm.members.size);
            const f = entities.details.value(i) || 'unknown function';
            if (!funcIds.has(f)) {
                funcIds.set(f, { idx: funcIds.size, size: 0 });
            }
            funcIds.get(f).size += 1;
        }
        //
        const baseCompColors = (0, state_1.getDistinctBaseColors)(compIds.size, 0);
        const compIdEntries = Array.from(compIds.entries());
        for (let i = 0; i < compIdEntries.length; ++i) {
            const [n, m] = compIdEntries[i];
            const groupColors = (0, state_1.getDistinctGroupColors)(m.members.size, baseCompColors[i], 20, 0);
            compColors.set(n, groupColors);
        }
        //
        const baseFuncColors = (0, state_1.getDistinctBaseColors)(funcIds.size, 0);
        const funcIdEntries = Array.from(funcIds.entries());
        for (let i = 0; i < funcIdEntries.length; ++i) {
            const [n, m] = funcIdEntries[i];
            const groupColors = (0, state_1.getDistinctGroupColors)(m.size, baseFuncColors[i], 20, 0);
            funcColors.set(n, groupColors);
        }
        //
        for (let i = 0; i < entities._rowCount; i++) {
            const description = entities.pdbx_description.value(i)[0] || 'unknown compartment';
            const nodes = description.split('.');
            for (let j = 0, jl = nodes.length - 1; j < jl; ++j) {
                const n = nodes.slice(0, j + 1).join('.');
                const p = nodes.slice(0, j).join('.');
                if (!compGroups.has(n)) {
                    const colorIdx = (_a = compIds.get(n)) === null || _a === void 0 ? void 0 : _a.idx;
                    const color = colorIdx !== undefined ? baseCompColors[colorIdx] : names_1.ColorNames.white;
                    const label = nodes[j];
                    const parent = (_b = compGroups.get(p)) !== null && _b !== void 0 ? _b : compRoot;
                    parent.cell.state.isCollapsed = false;
                    const group = await state.build()
                        .to(parent)
                        .apply(state_1.MesoscaleGroup, { ...groupParams, root: parent === compRoot, index: colorIdx, tag: `comp:${n}`, label, color: { type: 'generate', illustrative: false, value: color, variability: 20, shift: 0, lightness: 0, alpha: 1, emissive: 0 } }, { tags: [`group:comp:${n}`, `comp:${p}`], state: { isCollapsed: true, isHidden: groupParams.hidden } })
                        .commit({ revertOnError: true });
                    compGroups.set(n, group);
                }
            }
            const f = entities.details.value(i) || 'unknown function';
            if (!funcGroups.has(f)) {
                const colorIdx = (_c = funcIds.get(f)) === null || _c === void 0 ? void 0 : _c.idx;
                const color = colorIdx !== undefined ? baseFuncColors[colorIdx] : names_1.ColorNames.white;
                const group = await state.build()
                    .to(funcRoot)
                    .apply(state_1.MesoscaleGroup, { ...groupParams, index: colorIdx, tag: `func:${f}`, label: f, color: { type: 'custom', illustrative: false, value: color, variability: 20, shift: 0, lightness: 0, alpha: 1, emissive: 0 } }, { tags: [`group:func:${f}`, 'func:'], state: { isCollapsed: true, isHidden: groupParams.hidden } })
                    .commit({ revertOnError: true });
                funcGroups.set(f, group);
            }
        }
        //
        await state.transaction(async () => {
            try {
                const dependsOn = [base.ref];
                plugin.animationLoop.stop({ noDraw: true });
                let build = state.build();
                for (let i = 0; i < entities._rowCount; i++) {
                    const description = entities.pdbx_description.value(i)[0] || 'model';
                    const d = description.split('.');
                    const n = d.slice(0, -1).join('.');
                    const l = d.at(-1);
                    const f = entities.details.value(i) || 'unknown function';
                    const color = compColors.get(n)[compIds.get(n).members.get(l)];
                    const sizeFactor = getSizeFactor(l);
                    build = build
                        .toRoot()
                        .apply(model_1.CellpackStructure, { structureRef: base.ref, entityId: entities.id.value(i) }, { dependsOn })
                        .apply(representation_1.StructureRepresentation3D, getSpacefillParams(color, sizeFactor, graphicsMode), { tags: [`comp:${n}`, `func:${f}`] });
                }
                await build.commit();
            }
            catch (e) {
                console.error(e);
                plugin.log.error(e);
            }
            finally {
                plugin.animationLoop.start();
            }
        }).run();
    }
    else {
        const dependsOn = [base.ref];
        const merge = (base.data &&
            base.data.model.entities.data._rowCount === 1 &&
            base.data.unitSymmetryGroups.length > 100 &&
            base.data.unitSymmetryGroups.some(usg => usg.units.length > 1));
        await state.build()
            .toRoot()
            .apply(model_1.CellpackStructure, { structureRef: base.ref, entityId: entities.id.value(0) }, { dependsOn })
            .apply(representation_1.StructureRepresentation3D, getSpacefillParams(names_1.ColorNames.lightgray, 1, graphicsMode, merge), { tags: [`comp:`, `func:`] })
            .commit();
    }
}
