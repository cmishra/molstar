/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Lukáš Polák <admin@lukaspolak.cz>
 */
import { Color } from './color';
import { getColorListFromName } from './lists';
import { defaults } from '../../mol-util';
import { ScaleLegend } from '../legend';
import { SortedArray } from '../../mol-data/int';
import { clamp } from '../../mol-math/interpolate';
export const DefaultColorScaleProps = {
    domain: [0, 1],
    reverse: false,
    listOrName: 'red-yellow-blue',
    minLabel: '',
    maxLabel: '',
};
export var ColorScale;
(function (ColorScale) {
    function create(props) {
        return createColorScaleByType(props, 'continuous');
    }
    ColorScale.create = create;
    function createDiscrete(props) {
        return createColorScaleByType(props, 'discrete');
    }
    ColorScale.createDiscrete = createDiscrete;
    function createColorScaleByType(props, type) {
        const { domain, reverse, listOrName } = { ...DefaultColorScaleProps, ...props };
        const list = typeof listOrName === 'string' ? getColorListFromName(listOrName).list : listOrName;
        const colors = reverse ? list.slice().reverse() : list;
        let diff = 0, min = 0, max = 0;
        function setDomain(_min, _max) {
            min = _min;
            max = _max;
            diff = (max - min) || 1;
        }
        setDomain(domain[0], domain[1]);
        const minLabel = defaults(props.minLabel, min.toString());
        const maxLabel = defaults(props.maxLabel, max.toString());
        let color;
        const hasOffsets = colors.every(c => Array.isArray(c));
        if (hasOffsets) {
            const sorted = [...colors];
            sorted.sort((a, b) => a[1] - b[1]);
            const src = sorted.map(c => c[0]);
            const off = SortedArray.ofSortedArray(sorted.map(c => c[1]));
            const max = src.length - 1;
            switch (type) {
                case 'continuous':
                    color = (value) => valueToColorWithOffsets(value, src, off, min, max, diff);
                    break;
                case 'discrete':
                    color = (value) => valueToDiscreteColorWithOffsets(value, src, off, min, max, diff);
                    break;
            }
        }
        else {
            switch (type) {
                case 'continuous':
                    color = (value) => valueToColor(value, colors, min, max, diff);
                    break;
                case 'discrete':
                    color = (value) => valueToDiscreteColor(value, colors, min, max, diff);
                    break;
            }
        }
        return {
            color,
            colorToArray: (value, array, offset) => {
                Color.toArray(color(value), array, offset);
            },
            normalizedColorToArray: (value, array, offset) => {
                Color.toArrayNormalized(color(value), array, offset);
            },
            setDomain,
            get legend() { return ScaleLegend(minLabel, maxLabel, colors); }
        };
    }
    function valueToColorWithOffsets(value, src, off, min, max, diff) {
        const t = clamp((value - min) / diff, 0, 1);
        const i = SortedArray.findPredecessorIndex(off, t);
        if (i === 0) {
            return src[min];
        }
        else if (i > max) {
            return src[max];
        }
        const o1 = off[i - 1], o2 = off[i];
        const t1 = clamp((t - o1) / (o2 - o1), 0, 1); // TODO: cache the deltas?
        return Color.interpolate(src[i - 1], src[i], t1);
    }
    function valueToColor(value, colors, min, max, diff) {
        const t = Math.min(colors.length - 1, Math.max(0, ((value - min) / diff) * colors.length - 1));
        const tf = Math.floor(t);
        const c1 = colors[tf];
        const c2 = colors[Math.ceil(t)];
        return Color.interpolate(c1, c2, t - tf);
    }
    function valueToDiscreteColorWithOffsets(value, src, off, min, max, diff) {
        if (src.length === 0) {
            return Color.fromRgb(0, 0, 0);
        }
        const t = clamp((value - min) / diff, 0, 1);
        const i = SortedArray.findPredecessorIndex(off, t);
        if (i === 0) {
            return src[min];
        }
        else if (i > max) {
            return src[max];
        }
        return src[i];
    }
    function valueToDiscreteColor(value, colors, min, max, diff) {
        if (colors.length === 0) {
            return Color.fromRgb(0, 0, 0);
        }
        const intervalSize = diff / colors.length;
        if (value <= min) {
            return colors[0];
        }
        else if (value >= max) {
            return colors[colors.length - 1];
        }
        const i = Math.min(colors.length - 1, Math.floor((value - min) / intervalSize));
        return colors[i];
    }
})(ColorScale || (ColorScale = {}));
