"use strict";
/**
 * Copyright (c) 2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionVisualParams = void 0;
exports.buildInteractionsShape = buildInteractionsShape;
const cylinder_1 = require("../../mol-geo/geometry/mesh/builder/cylinder");
const mesh_builder_1 = require("../../mol-geo/geometry/mesh/mesh-builder");
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const shape_1 = require("../../mol-model/shape");
const structure_1 = require("../../mol-model/structure");
const link_1 = require("../../mol-repr/structure/visual/util/link");
const color_1 = require("../../mol-util/color");
const param_definition_1 = require("../../mol-util/param-definition");
const string_1 = require("../../mol-util/string");
const model_1 = require("./model");
function visualParams({ color, style = 'dashed', radius = 0.04 }) {
    return param_definition_1.ParamDefinition.Group({
        color: param_definition_1.ParamDefinition.Color(color),
        style: param_definition_1.ParamDefinition.Select(style, [['dashed', 'Dashed'], ['solid', 'Solid']]),
        radius: param_definition_1.ParamDefinition.Numeric(radius, { min: 0.01, max: 1, step: 0.01 }),
    });
}
function hydrogenVisualParams({ color, style = 'dashed', radius = 0.04, showArrow = true, arrowOffset = 0.18 }) {
    return param_definition_1.ParamDefinition.Group({
        color: param_definition_1.ParamDefinition.Color(color),
        style: param_definition_1.ParamDefinition.Select(style, [['dashed', 'Dashed'], ['solid', 'Solid']]),
        radius: param_definition_1.ParamDefinition.Numeric(radius, { min: 0.01, max: 1, step: 0.01 }),
        showArrow: param_definition_1.ParamDefinition.Boolean(showArrow),
        arrowOffset: param_definition_1.ParamDefinition.Numeric(arrowOffset, { min: 0, max: 1, step: 0.001 }),
    });
}
exports.InteractionVisualParams = {
    kinds: param_definition_1.ParamDefinition.MultiSelect(model_1.InteractionKinds, model_1.InteractionKinds.map(k => [k, (0, string_1.stringToWords)(k)])),
    styles: param_definition_1.ParamDefinition.Group({
        'unknown': visualParams({ color: (0, color_1.Color)(0x0) }),
        'ionic': visualParams({ color: (0, color_1.Color)(0xADD8E6) }),
        'pi-stacking': visualParams({ color: (0, color_1.Color)(0x1E3F66) }),
        'cation-pi': visualParams({ color: (0, color_1.Color)(0x06402B) }),
        'halogen-bond': visualParams({ color: (0, color_1.Color)(0xFFDE21) }),
        'hydrogen-bond': hydrogenVisualParams({ color: (0, color_1.Color)(0x0), style: 'solid' }),
        'weak-hydrogen-bond': hydrogenVisualParams({ color: (0, color_1.Color)(0x0) }),
        'hydrophobic': visualParams({ color: (0, color_1.Color)(0x555555) }),
        'metal-coordination': visualParams({ color: (0, color_1.Color)(0x952e8f) }),
        'salt-bridge': visualParams({ color: (0, color_1.Color)(0xF54029) }),
        'covalent': param_definition_1.ParamDefinition.Group({
            color: param_definition_1.ParamDefinition.Color((0, color_1.Color)(0x999999)),
            radius: param_definition_1.ParamDefinition.Numeric(0.1, { min: 0.01, max: 1, step: 0.01 }),
        }),
    })
};
function buildInteractionsShape(interactions, params, prev) {
    var _a, _b, _c;
    const mesh = mesh_builder_1.MeshBuilder.createState(interactions.elements.length * 128, 1024, prev);
    mesh.currentGroup = -1;
    const tooltips = new Map();
    const visible = new Set(params.kinds);
    const kindsToWords = new Map(model_1.InteractionKinds.map(k => [k, (0, string_1.stringToWords)(k)]));
    const colors = new Map();
    const bA = { sphere: geometry_1.Sphere3D.zero() };
    const bB = { sphere: geometry_1.Sphere3D.zero() };
    const pA = (0, linear_algebra_1.Vec3)();
    const pB = (0, linear_algebra_1.Vec3)();
    const dir = (0, linear_algebra_1.Vec3)();
    const capPos = (0, linear_algebra_1.Vec3)();
    const addLinkOptions = {
        builderState: mesh,
        props: { ...link_1.DefaultLinkCylinderProps },
    };
    const addLinkParams = {
        a: pA,
        b: pB,
        group: 0,
        linkStub: false,
        linkStyle: 0 /* LinkStyle.Solid */,
        linkRadius: 0,
    };
    for (const interaction of interactions.elements) {
        mesh.currentGroup++;
        if (!visible.has(interaction.info.kind))
            continue;
        let tooltip;
        if (interaction.info.kind === 'covalent') {
            if (interaction.info.degree === 'aromatic')
                tooltip = 'Aromatic';
            else if (interaction.info.degree === 1)
                tooltip = 'Single';
            else if (interaction.info.degree === 2)
                tooltip = 'Double';
            else if (interaction.info.degree === 3)
                tooltip = 'Triple';
            else if (interaction.info.degree === 4)
                tooltip = 'Quadruple';
            else
                tooltip = 'Covalent';
        }
        else {
            tooltip = (_a = kindsToWords.get(interaction.info.kind)) !== null && _a !== void 0 ? _a : interaction.info.kind;
        }
        if ((_b = interaction.sourceSchema) === null || _b === void 0 ? void 0 : _b.description) {
            tooltip += ` (${interaction.sourceSchema.description})`;
        }
        tooltips.set(mesh.currentGroup, tooltip);
        const options = params.styles[interaction.info.kind];
        let style = 'solid';
        if (interaction.info.kind !== 'covalent') {
            style = params.styles[interaction.info.kind].style;
        }
        colors.set(mesh.currentGroup, params.styles[interaction.info.kind].color);
        structure_1.StructureElement.Loci.getBoundary(interaction.a, undefined, bA);
        structure_1.StructureElement.Loci.getBoundary(interaction.b, undefined, bB);
        linear_algebra_1.Vec3.sub(dir, bB.sphere.center, bA.sphere.center);
        linear_algebra_1.Vec3.normalize(dir, dir);
        linear_algebra_1.Vec3.copy(pA, bA.sphere.center);
        linear_algebra_1.Vec3.copy(pB, bB.sphere.center);
        if (interaction.info.kind === 'hydrogen-bond' || interaction.info.kind === 'weak-hydrogen-bond') {
            const hydrogenStyle = params.styles[interaction.info.kind];
            if (hydrogenStyle.showArrow && hydrogenStyle.arrowOffset > 0) {
                linear_algebra_1.Vec3.scaleAndAdd(pB, pB, dir, -hydrogenStyle.arrowOffset);
            }
            if (hydrogenStyle.showArrow) {
                const height = options.radius * 3;
                linear_algebra_1.Vec3.scaleAndAdd(capPos, pB, dir, -height);
                cylinder(mesh, pA, capPos, options.radius, style);
                (0, cylinder_1.addSimpleCylinder)(mesh, capPos, pB, { radiusTop: 0, radiusBottom: height, topCap: false, bottomCap: true });
            }
            else {
                cylinder(mesh, pA, pB, options.radius, style);
            }
        }
        else {
            if (interaction.info.kind !== 'covalent') {
                cylinder(mesh, pA, pB, options.radius, style);
            }
            else {
                addLinkParams.group = mesh.currentGroup;
                addLinkParams.linkRadius = options.radius;
                const degree = (_c = interaction.info.degree) !== null && _c !== void 0 ? _c : 1;
                if (degree === 'aromatic')
                    addLinkParams.linkStyle = 7 /* LinkStyle.Aromatic */;
                else if (degree === 2)
                    addLinkParams.linkStyle = 2 /* LinkStyle.Double */;
                else if (degree === 3)
                    addLinkParams.linkStyle = 4 /* LinkStyle.Triple */;
                else
                    addLinkParams.linkStyle = 0 /* LinkStyle.Solid */;
                addLinkParams.a = pA;
                addLinkParams.b = pB;
                (0, link_1.addLinkCylinderMesh)(addLinkOptions, addLinkParams);
                addLinkParams.a = pB;
                addLinkParams.b = pA;
                (0, link_1.addLinkCylinderMesh)(addLinkOptions, addLinkParams);
            }
        }
    }
    return shape_1.Shape.create('Interactions', interactions, mesh_builder_1.MeshBuilder.getMesh(mesh), (g) => { var _a; return (_a = colors.get(g)) !== null && _a !== void 0 ? _a : 0; }, (g) => 1, (g) => { var _a; return (_a = tooltips.get(g)) !== null && _a !== void 0 ? _a : ''; });
}
function cylinder(mesh, a, b, radius, style) {
    const props = {
        radiusBottom: radius,
        radiusTop: radius,
        topCap: true,
        bottomCap: true,
    };
    if (style === 'dashed') {
        const dist = linear_algebra_1.Vec3.distance(a, b);
        const count = Math.ceil(dist / (2 * radius));
        (0, cylinder_1.addFixedCountDashedCylinder)(mesh, a, b, 1.0, count, true, props);
    }
    else {
        if (style !== 'solid') {
            console.warn(`Unknown style '${style}', using 'solid' instead.`);
        }
        (0, cylinder_1.addSimpleCylinder)(mesh, a, b, props);
    }
}
