/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginStateAnimation } from '../model';
async function setPartialSnapshot(plugin, entry, first = false) {
    var _a, _b, _c, _d, _e, _f;
    if (entry.snapshot.data) {
        await plugin.runTask(plugin.state.data.setSnapshot(entry.snapshot.data));
        // update the canvas3d trackball with the snapshot
        (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.setProps({
            trackball: (_c = (_b = entry.snapshot.canvas3d) === null || _b === void 0 ? void 0 : _b.props) === null || _c === void 0 ? void 0 : _c.trackball
        });
    }
    if ((_d = entry.snapshot.camera) === null || _d === void 0 ? void 0 : _d.current) {
        (_e = plugin.canvas3d) === null || _e === void 0 ? void 0 : _e.requestCameraReset({
            snapshot: entry.snapshot.camera.current,
            durationMs: first || entry.snapshot.camera.transitionStyle === 'instant'
                ? 0 : entry.snapshot.camera.transitionDurationInMs,
        });
    }
    else if ((_f = entry.snapshot.camera) === null || _f === void 0 ? void 0 : _f.focus) {
        plugin.managers.camera.focusObject({
            ...entry.snapshot.camera.focus,
            durationMs: first || entry.snapshot.camera.transitionStyle === 'instant'
                ? 0 : entry.snapshot.camera.transitionDurationInMs,
        });
    }
}
export const AnimateStateSnapshots = PluginStateAnimation.create({
    name: 'built-in.animate-state-snapshots',
    display: { name: 'State Snapshots' },
    isExportable: true,
    params: () => ({}),
    canApply(plugin) {
        const entries = plugin.managers.snapshot.state.entries;
        if (entries.size < 2) {
            return { canApply: false, reason: 'At least 2 states required.' };
        }
        if (entries.some(e => !!(e === null || e === void 0 ? void 0 : e.snapshot.startAnimation))) {
            return { canApply: false, reason: 'Nested animations not supported.' };
        }
        return { canApply: plugin.managers.snapshot.state.entries.size > 1 };
    },
    setup(_, __, plugin) {
        const pivot = plugin.managers.snapshot.state.entries.get(0);
        setPartialSnapshot(plugin, pivot, true);
    },
    getDuration: (_, plugin) => {
        return {
            kind: 'fixed',
            durationMs: plugin.managers.snapshot.state.entries.toArray().reduce((a, b) => { var _a; return a + ((_a = b.snapshot.durationInMs) !== null && _a !== void 0 ? _a : 0); }, 0)
        };
    },
    initialState: (_, plugin) => {
        const snapshots = plugin.managers.snapshot.state.entries.toArray();
        return {
            totalDuration: snapshots.reduce((a, b) => { var _a; return a + ((_a = b.snapshot.durationInMs) !== null && _a !== void 0 ? _a : 0); }, 0),
            snapshots,
            currentIndex: 0
        };
    },
    async apply(animState, t, ctx) {
        var _a;
        if (t.current >= animState.totalDuration) {
            return { kind: 'finished' };
        }
        let ctime = 0, i = 0;
        for (const s of animState.snapshots) {
            ctime += (_a = s.snapshot.durationInMs) !== null && _a !== void 0 ? _a : 0;
            if (t.current < ctime) {
                break;
            }
            i++;
        }
        if (i >= animState.snapshots.length)
            return { kind: 'finished' };
        if (i === animState.currentIndex) {
            return { kind: 'skip' };
        }
        await setPartialSnapshot(ctx.plugin, animState.snapshots[i]);
        return { kind: 'next', state: { ...animState, currentIndex: i } };
    }
});
