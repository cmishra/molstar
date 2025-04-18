/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4 } from '../../../../mol-math/linear-algebra/3d/mat4';
import { SpacefillRepresentationProvider } from '../../../../mol-repr/structure/representation/spacefill';
import { Color } from '../../../../mol-util/color';
import { utf8Read } from '../../../../mol-io/common/utf8';
import { Mat3, Quat, Vec3 } from '../../../../mol-math/linear-algebra';
import { MesoscaleGroup, MesoscaleState, getGraphicsModeProps, getMesoscaleGroupParams } from '../state';
import { ColorNames } from '../../../../mol-util/color/names';
import { ShapeRepresentation3D, StructureRepresentation3D } from '../../../../mol-plugin-state/transforms/representation';
import { ParseCif, ParsePly, ReadFile } from '../../../../mol-plugin-state/transforms/data';
import { ModelFromTrajectory, ShapeFromPly, TrajectoryFromGRO, TrajectoryFromMOL, TrajectoryFromMOL2, TrajectoryFromMmCif, TrajectoryFromPDB, TrajectoryFromSDF, TrajectoryFromXYZ } from '../../../../mol-plugin-state/transforms/model';
import { Euler } from '../../../../mol-math/linear-algebra/3d/euler';
import { Asset } from '../../../../mol-util/assets';
import { StructureFromGeneric } from './model';
import { getFileNameInfo } from '../../../../mol-util/file-info';
import { BaseGeometry } from '../../../../mol-geo/geometry/base';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
function getSpacefillParams(color, sizeFactor, graphics, clipVariant) {
    const gmp = getGraphicsModeProps(graphics === 'custom' ? 'quality' : graphics);
    return {
        type: {
            name: 'spacefill',
            params: {
                ...SpacefillRepresentationProvider.defaultValues,
                ignoreHydrogens: true,
                instanceGranularity: true,
                ignoreLight: true,
                lodLevels: gmp.lodLevels.map(l => {
                    return {
                        ...l,
                        stride: Math.max(1, Math.round(l.stride / Math.pow(sizeFactor, l.scaleBias)))
                    };
                }),
                quality: 'lowest', // avoid 'auto', triggers boundary calc
                sizeFactor,
                clip: {
                    variant: clipVariant,
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
function getPlyShapeParams(color, clipVariant) {
    return {
        ...PD.getDefaultValues(BaseGeometry.Params),
        instanceGranularity: true,
        ignoreLight: true,
        clip: {
            variant: clipVariant,
            objects: [],
        },
        quality: 'custom',
        doubleSided: true,
        coloring: {
            name: 'uniform',
            params: { color }
        },
        grouping: {
            name: 'none',
            params: {}
        },
        material: {
            metalness: 0.0,
            roughness: 1.0,
            bumpiness: 1.0,
        },
        bumpAmplitude: 0.1,
        bumpFrequency: 0.1 / 10,
    };
}
export async function createGenericHierarchy(plugin, file) {
    const asset = await plugin.runTask(plugin.managers.asset.resolve(file, 'zip'));
    let manifest;
    // TODO: remove special handling for martini prototype
    if (asset.data['instanced_structure.json']) {
        const d = asset.data['instanced_structure.json'];
        const t = utf8Read(d, 0, d.length);
        const martini = JSON.parse(t);
        console.log(martini);
        manifest = martiniToGeneric(martini);
    }
    else if (asset.data['manifest.json']) {
        const d = asset.data['manifest.json'];
        const t = utf8Read(d, 0, d.length);
        manifest = JSON.parse(t);
    }
    else {
        throw new Error('no manifest found');
    }
    console.log(manifest);
    const state = plugin.state.data;
    const graphicsMode = MesoscaleState.get(plugin).graphics;
    const groupParams = getMesoscaleGroupParams(graphicsMode);
    async function addGroup(g, cell, parent) {
        const group = await state.build()
            .to(cell)
            .apply(MesoscaleGroup, { ...groupParams, index: undefined, tag: `${g.root}:${g.id}`, label: g.label || g.id, description: g.description, color: { type: 'custom', illustrative: false, value: ColorNames.white, variability: 20, shift: 0, lightness: 0, alpha: 1, emissive: 0 } }, { tags: [`group:${g.root}:${g.id}`, g.root === parent ? `${g.root}:` : `${g.root}:${parent}`], state: { isCollapsed: true, isHidden: groupParams.hidden } })
            .commit();
        if (g.children) {
            for (const c of g.children) {
                await addGroup(c, group, g.id);
            }
        }
    }
    for (const r of manifest.roots) {
        const root = await state.build()
            .toRoot()
            .apply(MesoscaleGroup, { ...groupParams, root: true, index: -1, tag: `${r.id}:`, label: r.label || r.id, description: r.description, color: { type: 'custom', illustrative: false, value: ColorNames.white, variability: 20, shift: 0, lightness: 0, alpha: 1, emissive: 0 } }, { tags: `group:${r.id}:`, state: { isCollapsed: false, isHidden: groupParams.hidden } })
            .commit();
        if (r.children) {
            for (const c of r.children) {
                await addGroup(c, root, r.id);
            }
        }
    }
    const transformAssets = new Map();
    const getTransformAsset = (file) => {
        if (!transformAssets.has(file)) {
            const d = asset.data[file];
            transformAssets.set(file, Asset.File(new File([d], file)));
        }
        return transformAssets.get(file);
    };
    const getAssetInstances = (instances) => {
        return {
            positions: {
                data: Array.isArray(instances.positions.data)
                    ? instances.positions.data
                    : {
                        file: getTransformAsset(instances.positions.data.file),
                        view: instances.positions.data.view,
                    },
                type: instances.positions.type,
            },
            rotations: {
                data: Array.isArray(instances.rotations.data)
                    ? instances.rotations.data
                    : {
                        file: getTransformAsset(instances.rotations.data.file),
                        view: instances.rotations.data.view,
                    },
                variant: instances.rotations.variant,
                type: instances.rotations.type,
            }
        };
    };
    await state.transaction(async () => {
        try {
            plugin.animationLoop.stop({ noDraw: true });
            let build = state.build();
            for (const ent of manifest.entities) {
                const d = asset.data[ent.file];
                const info = getFileNameInfo(ent.file);
                const isBinary = ['bcif'].includes(info.ext);
                const t = isBinary ? d : utf8Read(d, 0, d.length);
                const file = Asset.File(new File([t], ent.file));
                const color = (ent.color) ? Color.fromRgb(ent.color[0], ent.color[1], ent.color[2]) : ColorNames.skyblue;
                const sizeFactor = ent.sizeFactor || 1;
                const tags = ent.groups.map(({ id, root }) => `${root}:${id}`);
                const instances = ent.instances && getAssetInstances(ent.instances);
                const description = ent.description;
                const label = ent.label || ent.file.split('.')[0];
                build = build
                    .toRoot()
                    .apply(ReadFile, { file, label, isBinary });
                if (['gro', 'cif', 'mmcif', 'mcif', 'bcif', 'pdb', 'ent', 'xyz', 'mol', 'sdf', 'sd', 'mol2'].includes(info.ext)) {
                    if (['gro'].includes(info.ext)) {
                        build = build.apply(TrajectoryFromGRO);
                    }
                    else if (['cif', 'mmcif', 'mcif', 'bcif'].includes(info.ext)) {
                        build = build.apply(ParseCif).apply(TrajectoryFromMmCif);
                    }
                    else if (['pdb', 'ent'].includes(info.ext)) {
                        build = build.apply(TrajectoryFromPDB);
                    }
                    else if (['xyz'].includes(info.ext)) {
                        build = build.apply(TrajectoryFromXYZ);
                    }
                    else if (['mol'].includes(info.ext)) {
                        build = build.apply(TrajectoryFromMOL);
                    }
                    else if (['sdf', 'sd'].includes(info.ext)) {
                        build = build.apply(TrajectoryFromSDF);
                    }
                    else if (['mol2'].includes(info.ext)) {
                        build = build.apply(TrajectoryFromMOL2);
                    }
                    let clipVariant = 'pixel';
                    if (ent.instances) {
                        if (Array.isArray(ent.instances.positions.data)) {
                            clipVariant = ent.instances.positions.data.length <= 3 ? 'pixel' : 'instance';
                        }
                        else {
                            const byteLength = ent.instances.positions.data.view
                                ? ent.instances.positions.data.view.byteLength
                                : asset.data[ent.instances.positions.data.file].length;
                            clipVariant = byteLength <= 3 * 4 ? 'pixel' : 'instance';
                        }
                    }
                    build = build
                        .apply(ModelFromTrajectory, { modelIndex: 0 })
                        .apply(StructureFromGeneric, { instances, label, description })
                        .apply(StructureRepresentation3D, getSpacefillParams(color, sizeFactor, graphicsMode, clipVariant), { tags });
                }
                else if (['ply'].includes(info.ext)) {
                    if (['ply'].includes(info.ext)) {
                        const transforms = await getTransforms(plugin, instances);
                        const clipVariant = transforms.length === 1 ? 'pixel' : 'instance';
                        build = build
                            .apply(ParsePly)
                            .apply(ShapeFromPly, { label, transforms })
                            .apply(ShapeRepresentation3D, getPlyShapeParams(color, clipVariant), { tags });
                    }
                }
                else {
                    console.warn(`unknown file format '${info.ext}'`);
                }
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
    asset.dispose();
}
//
const p = Vec3();
const q = Quat();
const m = Mat3();
const e = Euler();
async function getPositions(plugin, p) {
    var _a, _b;
    if (Array.isArray(p.data)) {
        return p.data;
    }
    else {
        const a = await plugin.runTask(plugin.managers.asset.resolve(p.data.file, 'binary'));
        const o = ((_a = p.data.view) === null || _a === void 0 ? void 0 : _a.byteOffset) || 0;
        const l = ((_b = p.data.view) === null || _b === void 0 ? void 0 : _b.byteLength) || a.data.byteLength;
        return new Float32Array(a.data.buffer, o + a.data.byteOffset, l / 4);
    }
}
;
async function getRotations(plugin, r) {
    var _a, _b;
    if (Array.isArray(r.data)) {
        return r.data;
    }
    else {
        const a = await plugin.runTask(plugin.managers.asset.resolve(r.data.file, 'binary'));
        const o = ((_a = r.data.view) === null || _a === void 0 ? void 0 : _a.byteOffset) || 0;
        const l = ((_b = r.data.view) === null || _b === void 0 ? void 0 : _b.byteLength) || a.data.byteLength;
        return new Float32Array(a.data.buffer, o + a.data.byteOffset, l / 4);
    }
}
;
export async function getTransforms(plugin, instances) {
    const transforms = [];
    if (instances) {
        const positions = await getPositions(plugin, instances.positions);
        const rotations = await getRotations(plugin, instances.rotations);
        for (let i = 0, il = positions.length / 3; i < il; ++i) {
            Vec3.fromArray(p, positions, i * 3);
            if (instances.rotations.variant === 'matrix') {
                Mat3.fromArray(m, rotations, i * 9);
                const t = Mat4.fromMat3(Mat4(), m);
                Mat4.setTranslation(t, p);
                transforms.push(t);
            }
            else if (instances.rotations.variant === 'quaternion') {
                Quat.fromArray(q, rotations, i * 4);
                const t = Mat4.fromQuat(Mat4(), q);
                Mat4.setTranslation(t, p);
                transforms.push(t);
            }
            else if (instances.rotations.variant === 'euler') {
                Euler.fromArray(e, rotations, i * 3);
                Quat.fromEuler(q, e, 'XYZ');
                const t = Mat4.fromQuat(Mat4(), q);
                Mat4.setTranslation(t, p);
                transforms.push(t);
            }
        }
    }
    else {
        transforms.push(Mat4.identity());
    }
    return transforms;
}
function martiniToGeneric(martini) {
    const functionRoot = {
        id: 'function',
        label: 'Function',
        description: 'Functional classification',
        children: [],
    };
    const entities = [];
    const seenGroups = new Set();
    const membraneGroup = {
        id: 'membane',
        root: 'function',
        label: 'Membrane',
        children: [],
    };
    functionRoot.children.push(membraneGroup);
    seenGroups.add(membraneGroup.id);
    const lipidsGroup = {
        id: 'lipid',
        root: 'function',
        label: 'Lipid',
        children: [],
    };
    membraneGroup.children.push(lipidsGroup);
    seenGroups.add(lipidsGroup.id);
    const upperGroup = {
        id: 'upper',
        root: 'function',
        label: 'Upper Leaflet',
    };
    lipidsGroup.children.push(upperGroup);
    seenGroups.add(upperGroup.id);
    const lowerGroup = {
        id: 'lower',
        root: 'function',
        label: 'Lower Leaflet',
    };
    lipidsGroup.children.push(lowerGroup);
    seenGroups.add(lowerGroup.id);
    const memprotGroup = {
        id: 'memprot',
        root: 'function',
        label: 'Transmembrane Protein',
    };
    membraneGroup.children.push(memprotGroup);
    seenGroups.add(memprotGroup.id);
    for (const e of martini) {
        const label = e.model.split('.')[0];
        const group = e.function || 'Metabolite';
        const positions = {
            data: e.positions.flat().map(x => Math.round((x * 10) * 100) / 100)
        };
        const rotations = {
            data: e.rotations.flat().map(x => Math.round(x * 100) / 100),
            variant: 'euler',
        };
        if (group.includes('lower leaflet')) {
            entities.push({
                file: e.model,
                label: label.substring(15),
                groups: [{ root: 'function', id: 'lower' }],
                instances: { positions, rotations },
                sizeFactor: 1.5,
            });
        }
        else if (group.includes('upper leaflet')) {
            entities.push({
                file: e.model,
                label: label.substring(15),
                groups: [{ root: 'function', id: 'upper' }],
                instances: { positions, rotations },
                sizeFactor: 1.5,
            });
        }
        else if (group.length === 4) {
            entities.push({
                file: e.model,
                label: label.substring(17),
                groups: [{ root: 'function', id: 'memprot' }],
                instances: { positions, rotations },
                sizeFactor: 1.5,
            });
        }
        else {
            if (!seenGroups.has(group)) {
                functionRoot.children.push({
                    id: group,
                    root: 'function',
                    label: group,
                });
                seenGroups.add(group);
            }
            entities.push({
                file: e.model,
                label,
                groups: [{ root: 'function', id: group }],
                instances: { positions, rotations },
                sizeFactor: 1.5,
            });
        }
    }
    return {
        label: 'Martini',
        description: 'Martini coarse-grained model',
        roots: [functionRoot],
        entities,
    };
}
