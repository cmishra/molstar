/**
 * Copyright (c) 2023-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginContext } from '../../mol-plugin/context';
import { PluginState } from '../../mol-plugin/state';
import { StateBuilder, StateObject, StateObjectSelector, StateTransform, StateTransformer } from '../../mol-state';
import { Kind, Subtree, SubtreeOfKind, Tree } from './tree/generic/tree-schema';
/** Function responsible for loading a tree node `node` into Mol*.
 * Should apply changes within `updateParent.update` but not commit them.
 * Should modify `context` accordingly, if it is needed for loading other nodes later.
 * `updateParent.selector` is the result of loading the node's parent into Mol* state hierarchy (or the hierarchy root in case of root node). */
export type LoadingAction<TNode extends Tree, TContext> = (updateParent: UpdateTarget, node: TNode, context: TContext) => UpdateTarget | undefined;
/** Loading actions for loading a tree into Mol*, per node kind. */
export type LoadingActions<TTree extends Tree, TContext> = {
    [kind in Kind<Subtree<TTree>>]?: LoadingAction<SubtreeOfKind<TTree, kind>, TContext>;
};
/** Type for defining custom behavior when loading trees, usually based on node custom properties. */
export interface LoadingExtension<TTree extends Tree, TContext, TExtensionContext> {
    id: string;
    description: string;
    /** Runs before the tree is loaded */
    createExtensionContext: (tree: TTree, context: TContext) => TExtensionContext;
    /** Runs after the tree is loaded */
    disposeExtensionContext?: (extensionContext: TExtensionContext, tree: TTree, context: TContext) => void;
    /** Runs on every node of the tree */
    action: (updateTarget: UpdateTarget, node: Subtree<TTree>, context: TContext, extensionContext: TExtensionContext) => void;
}
/** Load a tree into Mol*, by applying loading actions in DFS order and then commiting at once.
 * If `options.replaceExisting`, remove all objects in the current Mol* state; otherwise add to the current state. */
export declare function loadTree<TTree extends Tree, TContext>(plugin: PluginContext, tree: TTree, loadingActions: LoadingActions<TTree, TContext>, context: TContext, options?: {
    replaceExisting?: boolean;
    extensions?: LoadingExtension<TTree, TContext, any>[];
}): Promise<void>;
export declare function loadTreeVirtual<TTree extends Tree, TContext>(plugin: PluginContext, tree: TTree, loadingActions: LoadingActions<TTree, TContext>, context: TContext, options?: {
    replaceExisting?: boolean;
    extensions?: LoadingExtension<TTree, TContext, any>[];
}): PluginState.Snapshot;
/** A wrapper for updating Mol* state, while using deterministic transform refs.
 * ```
 * updateTarget = UpdateTarget.create(plugin); // like update = plugin.build();
 * UpdateTarget.apply(updateTarget, transformer, params); // like update.to(selector).apply(transformer, params);
 * await UpdateTarget.commit(updateTarget); // like await update.commit();
 * ```
 */
export interface UpdateTarget {
    readonly update: StateBuilder.Root;
    readonly selector: StateObjectSelector;
    readonly targetManager: TargetManager;
    readonly mvsDependencyRefs: Set<string>;
    readonly transformer?: StateTransformer;
    readonly transformParams?: any;
}
export declare const UpdateTarget: {
    /** Create a new update, with `selector` pointing to the root. */
    create(plugin: PluginContext, replaceExisting: boolean): UpdateTarget;
    /** Add a child node to `target.selector`, return a new `UpdateTarget` pointing to the new child. */
    apply<A extends StateObject, B extends StateObject, P extends {}>(target: UpdateTarget, transformer: StateTransformer<A, B, P>, params?: Partial<P>, options?: Partial<StateTransform.Options>): UpdateTarget;
    setMvsDependencies(target: UpdateTarget, refs: string[] | Set<string>): UpdateTarget;
    dependsOn(target: UpdateTarget, mapping: Map<string, string>): UpdateTarget;
    /** Add tags to `target.selector` */
    tag(target: UpdateTarget, tags: string[]): UpdateTarget;
    /** Delete all children of `target.selector`. */
    deleteChildren(target: UpdateTarget): UpdateTarget;
    /** Commit all changes done in the current update. */
    commit(target: UpdateTarget): Promise<void>;
};
/** Manages transform refs in a deterministic way. Uses refs like !mvs:3ce3664304d32c5d:0 */
declare class TargetManager {
    /** For each hash (e.g. 3ce3664304d32c5d), store the number of already used refs with that hash. */
    private _counter;
    constructor(plugin: PluginContext, replaceExisting: boolean);
    /** Return ref for a new node with given `hash`; update the counter accordingly. */
    private nextRef;
    /** Return ref for a new node based on parent and desired suffix. */
    getChildRef(parent: StateObjectSelector, suffix: string): string;
    readonly allTargets: UpdateTarget[];
}
/** Create node tags based of MVS node.ref */
export declare function mvsRefTags(mvsNodeRef: string | undefined): string[];
export {};
