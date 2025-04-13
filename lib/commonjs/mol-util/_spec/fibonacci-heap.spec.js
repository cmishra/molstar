"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fibonacci_heap_1 = require("../fibonacci-heap");
describe('fibonacci-heap', () => {
    it('basic', () => {
        const heap = new fibonacci_heap_1.FibonacciHeap();
        heap.insert(1, 2);
        heap.insert(4);
        heap.insert(2);
        heap.insert(3);
        expect(heap.size()).toBe(4);
        const node = heap.extractMinimum();
        expect(node.key).toBe(1);
        expect(node.value).toBe(2);
        expect(heap.size()).toBe(3);
    });
});
