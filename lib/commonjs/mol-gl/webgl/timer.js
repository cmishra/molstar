"use strict";
/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTimer = createTimer;
exports.printTimerResults = printTimerResults;
const now_1 = require("../../mol-util/now");
function movingAverage(avg, sample, count) {
    avg -= avg / count;
    avg += sample / count;
    return avg;
}
class MovingAverage {
    add(label, sample) {
        let avg = this.avgs.get(label) || sample;
        avg = movingAverage(avg, sample, this.count);
        this.avgs.set(label, avg);
        return avg;
    }
    get(label) {
        return this.avgs.get(label);
    }
    stats() {
        return Object.fromEntries(this.avgs.entries());
    }
    clear() {
        this.avgs.clear();
    }
    constructor(count) {
        this.count = count;
        this.avgs = new Map();
    }
}
function clearStats(stats) {
    stats.calls.drawInstanced = 0;
    stats.calls.drawInstancedBase = 0;
    stats.calls.multiDrawInstancedBase = 0;
    stats.calls.counts = 0;
    stats.culled.lod = 0;
    stats.culled.frustum = 0;
    stats.culled.occlusion = 0;
}
function getQuery(extensions) {
    return extensions.disjointTimerQuery ? extensions.disjointTimerQuery.createQuery() : null;
}
function createTimer(gl, extensions, stats, options) {
    var _a;
    const dtq = extensions.disjointTimerQuery;
    const avgCount = (_a = options === null || options === void 0 ? void 0 : options.avgCount) !== null && _a !== void 0 ? _a : 30;
    const queries = new Map();
    const pending = new Map();
    const stack = [];
    const gpuAvgs = new MovingAverage(avgCount);
    const cpuAvgs = new MovingAverage(avgCount);
    let measures = [];
    let current = null;
    let capturingStats = false;
    const clear = () => {
        if (!dtq)
            return;
        queries.forEach((_, query) => {
            dtq.deleteQuery(query);
        });
        pending.clear();
        stack.length = 0;
        gpuAvgs.clear();
        cpuAvgs.clear();
        measures = [];
        current = null;
        capturingStats = false;
    };
    const add = () => {
        if (!dtq)
            return;
        const query = getQuery(extensions);
        if (!query)
            return;
        dtq.beginQuery(dtq.TIME_ELAPSED, query);
        pending.forEach((measure, _) => {
            measure.queries.push(query);
        });
        queries.set(query, { refCount: pending.size });
        current = query;
    };
    return {
        resolve: () => {
            const results = [];
            if (!dtq || !measures.length || capturingStats)
                return results;
            // console.log('resolve');
            queries.forEach((result, query) => {
                if (result.timeElapsed !== undefined)
                    return;
                const available = dtq.getQueryParameter(query, dtq.QUERY_RESULT_AVAILABLE);
                const disjoint = gl.getParameter(dtq.GPU_DISJOINT);
                if (available && !disjoint) {
                    const timeElapsed = dtq.getQueryParameter(query, dtq.QUERY_RESULT);
                    result.timeElapsed = timeElapsed;
                    // console.log('timeElapsed', result.timeElapsed);
                }
                if (available || disjoint) {
                    dtq.deleteQuery(query);
                }
            });
            const unresolved = [];
            for (const measure of measures) {
                if (measure.queries.every(q => { var _a; return ((_a = queries.get(q)) === null || _a === void 0 ? void 0 : _a.timeElapsed) !== undefined; })) {
                    let timeElapsed = 0;
                    for (const query of measure.queries) {
                        const result = queries.get(query);
                        timeElapsed += result.timeElapsed;
                        result.refCount -= 1;
                    }
                    measure.timeElapsed = timeElapsed;
                    if (measure.root) {
                        const children = [];
                        const add = (measures, children) => {
                            for (const measure of measures) {
                                const timeElapsed = measure.timeElapsed;
                                const cpuElapsed = measure.cpu.end - measure.cpu.start;
                                const result = {
                                    label: measure.label,
                                    gpuElapsed: timeElapsed,
                                    gpuAvg: gpuAvgs.add(measure.label, timeElapsed),
                                    cpuElapsed,
                                    cpuAvg: cpuAvgs.add(measure.label, cpuElapsed),
                                    children: [],
                                    calls: measure.calls,
                                    note: measure.note,
                                };
                                children.push(result);
                                add(measure.children, result.children);
                            }
                        };
                        add(measure.children, children);
                        const cpuElapsed = measure.cpu.end - measure.cpu.start;
                        results.push({
                            label: measure.label,
                            gpuElapsed: timeElapsed,
                            gpuAvg: gpuAvgs.add(measure.label, timeElapsed),
                            cpuElapsed,
                            cpuAvg: cpuAvgs.add(measure.label, cpuElapsed),
                            children,
                            calls: measure.calls,
                            note: measure.note,
                        });
                    }
                }
                else {
                    unresolved.push(measure);
                }
            }
            measures = unresolved;
            queries.forEach((result, query) => {
                if (result.refCount === 0) {
                    queries.delete(query);
                }
            });
            return results;
        },
        mark: (label, options) => {
            var _a;
            if (!dtq)
                return;
            if (pending.has(label)) {
                throw new Error(`Timer mark for '${label}' already exists`);
            }
            const captureStats = (_a = options === null || options === void 0 ? void 0 : options.captureStats) !== null && _a !== void 0 ? _a : false;
            if (current !== null) {
                dtq.endQuery(dtq.TIME_ELAPSED);
            }
            const measure = {
                label,
                queries: [],
                children: [],
                root: current === null,
                cpu: { start: (0, now_1.now)(), end: -1 },
                captureStats,
            };
            if (options === null || options === void 0 ? void 0 : options.note)
                measure.note = options.note;
            pending.set(label, measure);
            if (stack.length) {
                stack[stack.length - 1].children.push(measure);
            }
            stack.push(measure);
            if (captureStats) {
                if (capturingStats) {
                    throw new Error('Already capturing stats');
                }
                clearStats(stats);
                capturingStats = true;
            }
            add();
        },
        markEnd: (label) => {
            var _a;
            if (!dtq)
                return;
            const measure = pending.get(label);
            if (!measure) {
                throw new Error(`Timer mark for '${label}' does not exist`);
            }
            if (((_a = stack.pop()) === null || _a === void 0 ? void 0 : _a.label) !== label) {
                throw new Error(`Timer mark for '${label}' has pending nested mark`);
            }
            dtq.endQuery(dtq.TIME_ELAPSED);
            pending.delete(label);
            measure.cpu.end = (0, now_1.now)();
            if (measure.captureStats) {
                measure.calls = { ...stats.calls };
                capturingStats = false;
            }
            measures.push(measure);
            if (pending.size > 0) {
                add();
            }
            else {
                current = null;
            }
        },
        stats: () => {
            return {
                gpu: gpuAvgs.stats(),
                cpu: cpuAvgs.stats(),
            };
        },
        formatedStats: () => {
            const stats = {};
            const gpu = gpuAvgs.stats();
            const cpu = cpuAvgs.stats();
            for (const l of Object.keys(gpu)) {
                const g = `${(gpu[l] / 1000 / 1000).toFixed(2)}`;
                const c = `${cpu[l].toFixed(2)}`;
                stats[l] = `${g} ms | CPU: ${c} ms`;
            }
            return stats;
        },
        clear,
        destroy: () => {
            clear();
        }
    };
}
function formatTimerResult(result) {
    const gpu = `${(result.gpuElapsed / 1000 / 1000).toFixed(2)}`;
    const gpuAvg = `${(result.gpuAvg / 1000 / 1000).toFixed(2)}`;
    const cpu = `${result.cpuElapsed.toFixed(2)}`;
    const cpuAvg = `${result.cpuAvg.toFixed(2)}`;
    return `${result.label} ${gpu} ms (avg. ${gpuAvg} ms) | CPU: ${cpu} ms (avg. ${cpuAvg} ms)`;
}
function printTimerResults(results) {
    results.map(r => {
        const f = formatTimerResult(r);
        if (r.children.length || r.calls || r.note) {
            console.groupCollapsed(f);
            if (r.calls)
                console.log(r.calls);
            if (r.note)
                console.log(r.note);
            printTimerResults(r.children);
            console.groupEnd();
        }
        else {
            console.log(f);
        }
    });
}
