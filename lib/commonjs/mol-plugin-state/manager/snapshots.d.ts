/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { List } from 'immutable';
import { UUID } from '../../mol-util';
import { PluginState } from '../../mol-plugin/state';
import { StatefulPluginComponent } from '../component';
import { PluginContext } from '../../mol-plugin/context';
import { Asset } from '../../mol-util/assets';
export { PluginStateSnapshotManager };
declare class PluginStateSnapshotManager extends StatefulPluginComponent<{
    current?: UUID | undefined;
    entries: List<PluginStateSnapshotManager.Entry>;
    isPlaying: boolean;
    nextSnapshotDelayInMs: number;
}> {
    private plugin;
    static DefaultNextSnapshotDelayInMs: number;
    private entryMap;
    private defaultSnapshotId;
    readonly events: {
        changed: import("rxjs").Subject<unknown>;
        opened: import("rxjs").Subject<unknown>;
    };
    get current(): PluginStateSnapshotManager.Entry | undefined;
    getIndex(e: PluginStateSnapshotManager.Entry): number;
    getEntry(id: string | undefined): PluginStateSnapshotManager.Entry | undefined;
    remove(id: string): void;
    add(e: PluginStateSnapshotManager.Entry): void;
    replace(id: string, snapshot: PluginState.Snapshot, params?: PluginStateSnapshotManager.EntryParams): void;
    move(id: string, dir: -1 | 1): void;
    update(e: PluginStateSnapshotManager.Entry, options: {
        key?: string;
        name?: string;
        description?: string;
        descriptionFormat?: PluginStateSnapshotManager.DescriptionFormat;
    }): void;
    clear(): void;
    applyKey(key: string): void;
    setCurrent(id: string): PluginState.Snapshot | undefined;
    getNextId(id: string | undefined, dir: -1 | 1): UUID | undefined;
    applyNext(dir: -1 | 1): Promise<void> | undefined;
    setStateSnapshot(snapshot: PluginStateSnapshotManager.StateSnapshot): Promise<PluginState.Snapshot | undefined>;
    private syncCurrent;
    getStateSnapshot(options?: {
        name?: string;
        description?: string;
        playOnLoad?: boolean;
        params?: PluginState.SnapshotParams;
    }): Promise<PluginStateSnapshotManager.StateSnapshot>;
    serialize(options?: {
        type: 'json' | 'molj' | 'zip' | 'molx';
        params?: PluginState.SnapshotParams;
    }): Promise<Blob>;
    open(file: File): Promise<void>;
    private timeoutHandle;
    private next;
    play(delayFirst?: boolean): void;
    stop(): void;
    togglePlay(): void;
    dispose(): void;
    constructor(plugin: PluginContext);
}
declare namespace PluginStateSnapshotManager {
    type DescriptionFormat = 'markdown' | 'plaintext';
    interface EntryParams {
        key?: string;
        name?: string;
        /** Information about the snapshot, to be shown in the UI when the snapshot is loaded. */
        description?: string;
        /** Toggle between markdown and plaintext interpretation of `description`. Default is markdown. */
        descriptionFormat?: DescriptionFormat;
        image?: Asset;
    }
    interface Entry extends EntryParams {
        timestamp: number;
        snapshot: PluginState.Snapshot;
    }
    function Entry(snapshot: PluginState.Snapshot, params: EntryParams): Entry;
    function isStateSnapshot(x?: any): x is StateSnapshot;
    interface StateSnapshot {
        timestamp: number;
        version: string;
        name?: string;
        description?: string;
        current: UUID | undefined;
        playback: {
            isPlaying: boolean;
            nextSnapshotDelayInMs: number;
        };
        entries: Entry[];
    }
    function getCanvasImageAsset(ctx: PluginContext, name: string): Promise<Asset | undefined>;
}
