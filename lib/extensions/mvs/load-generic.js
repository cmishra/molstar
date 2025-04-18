/**
 * Copyright (c) 2023-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StructureRepresentation3D } from '../../mol-plugin-state/transforms/representation';
import { StateTree } from '../../mol-state';
import { UUID } from '../../mol-util';
import { stringHash } from './helpers/utils';
import { dfs } from './tree/generic/tree-utils';
/** Load a tree into Mol*, by applying loading actions in DFS order and then commiting at once.
 * If `options.replaceExisting`, remove all objects in the current Mol* state; otherwise add to the current state. */
export async function loadTree(plugin, tree, loadingActions, context, options) {
    var _a;
    const updateRoot = UpdateTarget.create(plugin, (_a = options === null || options === void 0 ? void 0 : options.replaceExisting) !== null && _a !== void 0 ? _a : false);
    loadTreeInUpdate(updateRoot, tree, loadingActions, context, options);
    await UpdateTarget.commit(updateRoot);
}
export function loadTreeVirtual(plugin, tree, loadingActions, context, options) {
    var _a;
    const updateRoot = UpdateTarget.create(plugin, (_a = options === null || options === void 0 ? void 0 : options.replaceExisting) !== null && _a !== void 0 ? _a : false);
    loadTreeInUpdate(updateRoot, tree, loadingActions, context, options);
    const stateTree = updateRoot.update.getTree();
    const stateSnapshot = { tree: StateTree.toJSON(stateTree) };
    const pluginStateSnapshot = { id: UUID.create22(), data: stateSnapshot };
    return pluginStateSnapshot;
}
function loadTreeInUpdate(updateRoot, tree, loadingActions, context, options) {
    var _a;
    const mapping = new Map();
    if (options === null || options === void 0 ? void 0 : options.replaceExisting) {
        UpdateTarget.deleteChildren(updateRoot);
    }
    const extensionContexts = ((_a = options === null || options === void 0 ? void 0 : options.extensions) !== null && _a !== void 0 ? _a : []).map(ext => ({ ext, extCtx: ext.createExtensionContext(tree, context) }));
    const mvsRefMap = new Map();
    dfs(tree, (node, parent) => {
        const kind = node.kind;
        let msNode;
        const updateParent = parent ? mapping.get(parent) : updateRoot;
        const action = loadingActions[kind];
        if (action) {
            if (updateParent) {
                msNode = action(updateParent, node, context);
                if (msNode && node.ref) {
                    UpdateTarget.tag(msNode, mvsRefTags(node.ref));
                    mvsRefMap.set(node.ref, msNode.selector.ref);
                }
                mapping.set(node, msNode);
            }
            else {
                console.warn(`No target found for this "${node.kind}" node`);
                return;
            }
        }
        if (updateParent) {
            for (const { ext, extCtx } of extensionContexts) {
                ext.action(msNode !== null && msNode !== void 0 ? msNode : updateParent, node, context, extCtx);
            }
        }
    });
    for (const target of updateRoot.targetManager.allTargets) {
        UpdateTarget.dependsOn(target, mvsRefMap);
    }
    extensionContexts.forEach(e => { var _a, _b; return (_b = (_a = e.ext).disposeExtensionContext) === null || _b === void 0 ? void 0 : _b.call(_a, e.extCtx, tree, context); });
}
export const UpdateTarget = {
    /** Create a new update, with `selector` pointing to the root. */
    create(plugin, replaceExisting) {
        const update = plugin.build();
        const msTarget = update.toRoot().selector;
        return { update, selector: msTarget, targetManager: new TargetManager(plugin, replaceExisting), mvsDependencyRefs: new Set() };
    },
    /** Add a child node to `target.selector`, return a new `UpdateTarget` pointing to the new child. */
    apply(target, transformer, params, options) {
        var _a, _b;
        let refSuffix = transformer.id;
        if (transformer.id === StructureRepresentation3D.id) {
            const reprType = (_b = (_a = params === null || params === void 0 ? void 0 : params.type) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '';
            refSuffix += `:${reprType}`;
        }
        const ref = target.targetManager.getChildRef(target.selector, refSuffix);
        const msResult = target.update.to(target.selector).apply(transformer, params, { ...options, ref }).selector;
        const result = { ...target, selector: msResult, mvsDependencyRefs: new Set(), transformer, transformParams: params };
        target.targetManager.allTargets.push(result);
        return result;
    },
    setMvsDependencies(target, refs) {
        refs.forEach(ref => target.mvsDependencyRefs.add(ref));
        return target;
    },
    dependsOn(target, mapping) {
        if (!target.mvsDependencyRefs.size)
            return target;
        const dependsOn = Array.from(target.mvsDependencyRefs).map(d => mapping.get(d)).filter(d => d);
        if (!dependsOn.length)
            return target;
        target.update.to(target.selector).dependsOn(dependsOn);
        return target;
    },
    /** Add tags to `target.selector` */
    tag(target, tags) {
        if (tags.length > 0) {
            target.update.to(target.selector).tag(tags);
        }
        return target;
    },
    /** Delete all children of `target.selector`. */
    deleteChildren(target) {
        const children = target.update.currentTree.children.get(target.selector.ref);
        children.forEach(child => target.update.delete(child));
        return target;
    },
    /** Commit all changes done in the current update. */
    commit(target) {
        return target.update.commit();
    },
};
/** Manages transform refs in a deterministic way. Uses refs like !mvs:3ce3664304d32c5d:0 */
class TargetManager {
    constructor(plugin, replaceExisting) {
        /** For each hash (e.g. 3ce3664304d32c5d), store the number of already used refs with that hash. */
        this._counter = {};
        this.allTargets = [];
        if (!replaceExisting) {
            plugin.state.data.cells.forEach(cell => {
                var _a;
                const ref = cell.transform.ref;
                if (ref.startsWith('!mvs:')) {
                    const [_, hash, idNumber] = ref.split(':');
                    const nextIdNumber = parseInt(idNumber) + 1;
                    if (nextIdNumber > ((_a = this._counter[hash]) !== null && _a !== void 0 ? _a : 0)) {
                        this._counter[hash] = nextIdNumber;
                    }
                }
            });
        }
    }
    /** Return ref for a new node with given `hash`; update the counter accordingly. */
    nextRef(hash) {
        var _a;
        var _b;
        (_a = (_b = this._counter)[hash]) !== null && _a !== void 0 ? _a : (_b[hash] = 0);
        const idNumber = this._counter[hash]++;
        return `!mvs:${hash}:${idNumber}`;
    }
    /** Return ref for a new node based on parent and desired suffix. */
    getChildRef(parent, suffix) {
        const hashBase = parent.ref.replace(/^!mvs:/, '') + ':' + suffix;
        const hash = stringHash(hashBase);
        const result = this.nextRef(hash);
        return result;
    }
}
/** Create node tags based of MVS node.ref */
export function mvsRefTags(mvsNodeRef) {
    if (mvsNodeRef === undefined)
        return [];
    else
        return [`mvs-ref:${mvsNodeRef}`];
}
