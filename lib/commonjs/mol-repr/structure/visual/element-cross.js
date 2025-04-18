"use strict";
/**
 * Copyright (c) 2021-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureElementCrossParams = exports.ElementCrossParams = void 0;
exports.createElementCross = createElementCross;
exports.ElementCrossVisual = ElementCrossVisual;
exports.createStructureElementCross = createStructureElementCross;
exports.StructureElementCrossVisual = StructureElementCrossVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const units_visual_1 = require("../units-visual");
const structure_1 = require("../../../mol-model/structure");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const element_1 = require("./util/element");
const geometry_1 = require("../../../mol-math/geometry");
const lines_1 = require("../../../mol-geo/geometry/lines/lines");
const lines_builder_1 = require("../../../mol-geo/geometry/lines/lines-builder");
const util_1 = require("../../../mol-model-props/computed/chemistry/util");
const bond_1 = require("./util/bond");
const complex_visual_1 = require("../complex-visual");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3add = linear_algebra_1.Vec3.add;
const v3scaleAndAdd = linear_algebra_1.Vec3.scaleAndAdd;
const v3unitX = linear_algebra_1.Vec3.unitX;
const v3unitY = linear_algebra_1.Vec3.unitY;
const v3unitZ = linear_algebra_1.Vec3.unitZ;
exports.ElementCrossParams = {
    ...units_visual_1.UnitsLinesParams,
    lineSizeAttenuation: param_definition_1.ParamDefinition.Boolean(false),
    ignoreHydrogens: param_definition_1.ParamDefinition.Boolean(false),
    ignoreHydrogensVariant: param_definition_1.ParamDefinition.Select('all', param_definition_1.ParamDefinition.arrayToOptions(['all', 'non-polar'])),
    traceOnly: param_definition_1.ParamDefinition.Boolean(false),
    crosses: param_definition_1.ParamDefinition.Select('lone', param_definition_1.ParamDefinition.arrayToOptions(['lone', 'all'])),
    crossSize: param_definition_1.ParamDefinition.Numeric(0.35, { min: 0, max: 2, step: 0.01 }),
};
function createElementCross(ctx, unit, structure, theme, props, lines) {
    const { child } = structure;
    if (child && !child.unitMap.get(unit.id))
        return lines_1.Lines.createEmpty(lines);
    const elements = unit.elements;
    const n = elements.length;
    const builder = lines_builder_1.LinesBuilder.create(n, n / 10, lines);
    const p = (0, linear_algebra_1.Vec3)();
    const s = (0, linear_algebra_1.Vec3)();
    const e = (0, linear_algebra_1.Vec3)();
    const c = unit.conformation;
    const ignore = (0, element_1.makeElementIgnoreTest)(structure, unit, props);
    const r = props.crossSize / 2;
    const lone = props.crosses === 'lone';
    const center = (0, linear_algebra_1.Vec3)();
    let count = 0;
    for (let i = 0; i < n; ++i) {
        if (ignore && ignore(elements[i]))
            continue;
        if (lone && structure_1.Unit.isAtomic(unit) && (0, bond_1.hasUnitVisibleBonds)(unit, props) && (0, util_1.bondCount)(structure, unit, i) !== 0)
            continue;
        c.invariantPosition(elements[i], p);
        v3add(center, center, p);
        count += 1;
        v3scaleAndAdd(s, p, v3unitX, r);
        v3scaleAndAdd(e, p, v3unitX, -r);
        builder.add(s[0], s[1], s[2], e[0], e[1], e[2], i);
        v3scaleAndAdd(s, p, v3unitY, r);
        v3scaleAndAdd(e, p, v3unitY, -r);
        builder.add(s[0], s[1], s[2], e[0], e[1], e[2], i);
        v3scaleAndAdd(s, p, v3unitZ, r);
        v3scaleAndAdd(e, p, v3unitZ, -r);
        builder.add(s[0], s[1], s[2], e[0], e[1], e[2], i);
    }
    const l = builder.getLines();
    if (count === 0)
        return l;
    // re-use boundingSphere if it has not changed much
    let boundingSphere;
    linear_algebra_1.Vec3.scale(center, center, 1 / count);
    const oldBoundingSphere = lines ? geometry_1.Sphere3D.clone(lines.boundingSphere) : undefined;
    if (oldBoundingSphere && linear_algebra_1.Vec3.distance(center, oldBoundingSphere.center) / oldBoundingSphere.radius < 0.1) {
        boundingSphere = oldBoundingSphere;
    }
    else {
        boundingSphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, 1 * props.sizeFactor);
    }
    l.setBoundingSphere(boundingSphere);
    return l;
}
function ElementCrossVisual(materialId) {
    return (0, units_visual_1.UnitsLinesVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.ElementCrossParams),
        createGeometry: createElementCross,
        createLocationIterator: element_1.ElementIterator.fromGroup,
        getLoci: element_1.getElementLoci,
        eachLocation: element_1.eachElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant ||
                newProps.traceOnly !== currentProps.traceOnly ||
                newProps.crosses !== currentProps.crosses ||
                newProps.crossSize !== currentProps.crossSize);
        }
    }, materialId);
}
//
function createStructureElementCross(ctx, structure, theme, props, lines) {
    const { child } = structure;
    const { getSerialIndex } = structure.serialMapping;
    const structureElementCount = structure.elementCount;
    const builder = lines_builder_1.LinesBuilder.create(structureElementCount, structureElementCount / 2, lines);
    const p = (0, linear_algebra_1.Vec3)();
    const s = (0, linear_algebra_1.Vec3)();
    const e = (0, linear_algebra_1.Vec3)();
    const r = props.crossSize / 2;
    const lone = props.crosses === 'lone';
    const center = (0, linear_algebra_1.Vec3)();
    let count = 0;
    for (const unit of structure.units) {
        const childUnit = child === null || child === void 0 ? void 0 : child.unitMap.get(unit.id);
        if (child && !childUnit)
            return lines_1.Lines.createEmpty(lines);
        const { elements, conformation: c } = unit;
        const elementCount = elements.length;
        const ignore = (0, element_1.makeElementIgnoreTest)(structure, unit, props);
        for (let i = 0; i < elementCount; i++) {
            if (ignore && ignore(elements[i]))
                continue;
            if (lone && structure_1.Unit.isAtomic(unit) && (0, bond_1.hasUnitVisibleBonds)(unit, props) && (0, util_1.bondCount)(structure, unit, i) !== 0)
                continue;
            c.position(elements[i], p);
            v3add(center, center, p);
            count += 1;
            const si = getSerialIndex(unit, elements[i]);
            v3scaleAndAdd(s, p, v3unitX, r);
            v3scaleAndAdd(e, p, v3unitX, -r);
            builder.add(s[0], s[1], s[2], e[0], e[1], e[2], si);
            v3scaleAndAdd(s, p, v3unitY, r);
            v3scaleAndAdd(e, p, v3unitY, -r);
            builder.add(s[0], s[1], s[2], e[0], e[1], e[2], si);
            v3scaleAndAdd(s, p, v3unitZ, r);
            v3scaleAndAdd(e, p, v3unitZ, -r);
            builder.add(s[0], s[1], s[2], e[0], e[1], e[2], si);
        }
    }
    const l = builder.getLines();
    if (count === 0)
        return l;
    // re-use boundingSphere if it has not changed much
    let boundingSphere;
    linear_algebra_1.Vec3.scale(center, center, 1 / count);
    const oldBoundingSphere = lines ? geometry_1.Sphere3D.clone(lines.boundingSphere) : undefined;
    if (oldBoundingSphere && linear_algebra_1.Vec3.distance(center, oldBoundingSphere.center) / oldBoundingSphere.radius < 1.0) {
        boundingSphere = oldBoundingSphere;
    }
    else {
        boundingSphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), (child !== null && child !== void 0 ? child : structure).boundary.sphere, 1 * props.sizeFactor);
    }
    l.setBoundingSphere(boundingSphere);
    return l;
}
exports.StructureElementCrossParams = {
    ...complex_visual_1.ComplexLinesParams,
    lineSizeAttenuation: param_definition_1.ParamDefinition.Boolean(false),
    ignoreHydrogens: param_definition_1.ParamDefinition.Boolean(false),
    ignoreHydrogensVariant: param_definition_1.ParamDefinition.Select('all', param_definition_1.ParamDefinition.arrayToOptions(['all', 'non-polar'])),
    traceOnly: param_definition_1.ParamDefinition.Boolean(false),
    crosses: param_definition_1.ParamDefinition.Select('lone', param_definition_1.ParamDefinition.arrayToOptions(['lone', 'all'])),
    crossSize: param_definition_1.ParamDefinition.Numeric(0.35, { min: 0, max: 2, step: 0.01 }),
};
function StructureElementCrossVisual(materialId) {
    return (0, complex_visual_1.ComplexLinesVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.StructureElementCrossParams),
        createGeometry: createStructureElementCross,
        createLocationIterator: element_1.ElementIterator.fromStructure,
        getLoci: element_1.getSerialElementLoci,
        eachLocation: element_1.eachSerialElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant ||
                newProps.traceOnly !== currentProps.traceOnly ||
                newProps.crosses !== currentProps.crosses ||
                newProps.crossSize !== currentProps.crossSize);
        }
    }, materialId);
}
