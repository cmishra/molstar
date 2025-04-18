"use strict";
/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPetworldHierarchy = createPetworldHierarchy;
const mol_state_1 = require("../../../../mol-state");
const model_1 = require("./model");
const spacefill_1 = require("../../../../mol-repr/structure/representation/spacefill");
const representation_1 = require("../../../../mol-plugin-state/transforms/representation");
const state_1 = require("../state");
const names_1 = require("../../../../mol-util/color/names");
const mmcif_1 = require("../../../../mol-model-formats/structure/mmcif");
const mol_task_1 = require("../../../../mol-task");
function getSpacefillParams(color, graphics) {
    const gmp = (0, state_1.getGraphicsModeProps)(graphics === 'custom' ? 'quality' : graphics);
    return {
        type: {
            name: 'spacefill',
            params: {
                ...spacefill_1.SpacefillRepresentationProvider.defaultValues,
                ignoreHydrogens: true,
                instanceGranularity: true,
                ignoreLight: true,
                lodLevels: gmp.lodLevels,
                quality: 'lowest', // avoid 'auto', triggers boundary calc
                clip: {
                    variant: 'instance',
                    objects: [],
                },
                clipPrimitive: true,
                approximate: gmp.approximate,
                alphaThickness: gmp.alphaThickness,
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
                scale: 1,
            }
        },
    };
}
async function createPetworldHierarchy(plugin, trajectory) {
    var _a;
    const cell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, trajectory);
    const tr = (_a = cell === null || cell === void 0 ? void 0 : cell.obj) === null || _a === void 0 ? void 0 : _a.data;
    if (!cell || !tr)
        return;
    if (!mmcif_1.MmcifFormat.is(tr.representative.sourceData))
        return;
    const membrane = [];
    const other = [];
    for (let i = 0; i < tr.frameCount; ++i) {
        const m = await mol_task_1.Task.resolveInContext(tr.getFrameAtIndex(i));
        // cannot use m.properties.structAsymMap because petworld models
        // may assign the same asymId to multiple entities
        const { label_asym_id, label_entity_id, _rowCount } = m.atomicHierarchy.chains;
        const membraneIds = [];
        const otherIds = [];
        const seen = new Set();
        for (let i = 0; i < _rowCount; i++) {
            const entityId = label_entity_id.value(i);
            if (seen.has(entityId))
                continue;
            const asymId = label_asym_id.value(i);
            if (asymId.startsWith('MEM')) {
                membraneIds.push(entityId);
            }
            else {
                otherIds.push(entityId);
            }
            seen.add(entityId);
        }
        if (membraneIds.length) {
            membrane.push({ modelIndex: i, entityIds: membraneIds });
        }
        if (otherIds.length) {
            other.push({ modelIndex: i, entityIds: otherIds });
        }
    }
    const state = plugin.state.data;
    const graphicsMode = state_1.MesoscaleState.get(plugin).graphics;
    const groupParams = (0, state_1.getMesoscaleGroupParams)(graphicsMode);
    const group = await state.build()
        .toRoot()
        .apply(state_1.MesoscaleGroup, { ...groupParams, root: true, index: -1, tag: `ent:`, label: 'entity', color: { type: 'generate', illustrative: false, value: names_1.ColorNames.white, variability: 20, shift: 0, lightness: 0, alpha: 1, emissive: 0 } }, { tags: ['group:ent:'], state: { isCollapsed: false, isHidden: groupParams.hidden } })
        .commit({ revertOnError: true });
    await state.build()
        .to(group)
        .apply(state_1.MesoscaleGroup, { ...groupParams, index: undefined, tag: `ent:mem`, label: 'Membrane', color: { type: 'uniform', illustrative: false, value: names_1.ColorNames.lightgrey, variability: 20, shift: 0, lightness: 0, alpha: 1, emissive: 0 } }, { tags: ['group:ent:mem', 'ent:', '__no_group_color__'], state: { isCollapsed: true, isHidden: groupParams.hidden } })
        .commit();
    const colors = (0, state_1.getDistinctBaseColors)(other.length, 0);
    await state.transaction(async () => {
        try {
            plugin.animationLoop.stop({ noDraw: true });
            let build = state.build();
            for (let i = 0, il = membrane.length; i < il; ++i) {
                build = build
                    .to(cell)
                    .apply(model_1.StructureFromPetworld, membrane[i])
                    .apply(representation_1.StructureRepresentation3D, getSpacefillParams(names_1.ColorNames.lightgrey, graphicsMode), { tags: ['ent:mem', '__no_group_color__'] });
            }
            for (let i = 0, il = other.length; i < il; ++i) {
                build = build
                    .to(cell)
                    .apply(model_1.StructureFromPetworld, other[i])
                    .apply(representation_1.StructureRepresentation3D, getSpacefillParams(colors[i], graphicsMode), { tags: ['ent:'] });
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
