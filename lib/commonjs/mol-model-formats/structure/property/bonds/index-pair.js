"use strict";
/**
 * Copyright (c) 2019-2024 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexPairBonds = void 0;
const graph_1 = require("../../../../mol-math/graph");
const property_1 = require("../../common/property");
function getGraph(indexA, indexB, props, count) {
    const builder = new graph_1.IntAdjacencyGraph.EdgeBuilder(count, indexA, indexB);
    const key = new Int32Array(builder.slotCount);
    const operatorA = new Array(builder.slotCount);
    const operatorB = new Array(builder.slotCount);
    const order = new Int8Array(builder.slotCount);
    const distance = new Array(builder.slotCount);
    const flag = new Array(builder.slotCount);
    for (let i = 0, _i = builder.edgeCount; i < _i; i++) {
        builder.addNextEdge();
        builder.assignProperty(key, props.key ? props.key[i] : -1);
        builder.assignDirectedProperty(operatorA, props.operatorA ? props.operatorA[i] : -1, operatorB, props.operatorB ? props.operatorB[i] : -1);
        builder.assignProperty(order, props.order ? props.order[i] : 1);
        builder.assignProperty(distance, props.distance ? props.distance[i] : -1);
        builder.assignProperty(flag, props.flag ? props.flag[i] : 1 /* BondType.Flag.Covalent */);
    }
    return builder.createGraph({ key, operatorA, operatorB, order, distance, flag });
}
var IndexPairBonds;
(function (IndexPairBonds) {
    IndexPairBonds.Descriptor = {
        name: 'index_pair_bonds',
    };
    IndexPairBonds.Provider = property_1.FormatPropertyProvider.create(IndexPairBonds.Descriptor, { asDynamic: true });
    IndexPairBonds.DefaultProps = {
        /**
         * If negative, test using element-based threshold, otherwise distance in Angstrom.
         *
         * This option exists to handle bonds in periodic cells. For systems that are
         * made from beads (as opposed to atomic elements), set to a specific distance.
         *
         * Note that `Data` has a `distance` field which allows specifying a distance
         * for each bond individually which takes precedence over this option.
         */
        maxDistance: -1,
        /** Can be cached in `ElementSetIntraBondCache` */
        cacheable: true,
    };
    function fromData(data, props = {}) {
        const p = { ...IndexPairBonds.DefaultProps, ...props };
        const { pairs, count } = data;
        const indexA = pairs.indexA.toArray();
        const indexB = pairs.indexB.toArray();
        const key = pairs.key && pairs.key.toArray();
        const operatorA = pairs.operatorA && pairs.operatorA.toArray();
        const operatorB = pairs.operatorB && pairs.operatorB.toArray();
        const order = pairs.order && pairs.order.toArray();
        const distance = pairs.distance && pairs.distance.toArray();
        const flag = pairs.flag && pairs.flag.toArray();
        let hasOperators = false;
        if (operatorA && operatorB) {
            hasOperators = true;
            for (let i = 0, il = operatorA.length; i < il; ++i) {
                if (operatorA[i] === -1 || operatorB[i] === -1) {
                    hasOperators = false;
                    break;
                }
            }
        }
        const bonds = getGraph(indexA, indexB, { key, operatorA, operatorB, order, distance, flag }, count);
        const bySameOperator = new Map();
        if (hasOperators) {
            const { operatorA, operatorB } = bonds.edgeProps;
            for (let i = 0, il = operatorA.length; i < il; ++i) {
                if (operatorA[i] === operatorB[i]) {
                    const op = operatorA[i];
                    if (bySameOperator.has(op))
                        bySameOperator.get(op).push(i);
                    else
                        bySameOperator.set(op, [i]);
                }
            }
        }
        return {
            bonds,
            maxDistance: p.maxDistance,
            cacheable: p.cacheable,
            hasOperators,
            bySameOperator,
        };
    }
    IndexPairBonds.fromData = fromData;
    /** Like `getEdgeIndex` but taking `edgeProps.operatorA` and `edgeProps.operatorB` into account */
    function getEdgeIndexForOperators(bonds, i, j, opI, opJ) {
        let a, b, opA, opB;
        if (i < j) {
            a = i;
            b = j;
            opA = opI;
            opB = opJ;
        }
        else {
            a = j;
            b = i;
            opA = opJ;
            opB = opI;
        }
        for (let t = bonds.offset[a], _t = bonds.offset[a + 1]; t < _t; t++) {
            if (bonds.b[t] === b && bonds.edgeProps.operatorA[t] === opA && bonds.edgeProps.operatorB[t] === opB)
                return t;
        }
        return -1;
    }
    IndexPairBonds.getEdgeIndexForOperators = getEdgeIndexForOperators;
})(IndexPairBonds || (exports.IndexPairBonds = IndexPairBonds = {}));
