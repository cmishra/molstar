/**
 * Copyright (c) 2021-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { StructureProperties, StructureElement, Bond } from '../../mol-model/structure';
import { Color } from '../../mol-util/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { getPaletteParams, getPalette } from '../../mol-util/color/palette';
import { ColorThemeCategory } from './categories';
const DefaultList = 'many-distinct';
const DefaultColor = Color(0xFAFAFA);
const DefaultWaterColor = Color(0xFF0D0D);
const Description = 'Gives every chain a color based on its `label_entity_id` value.';
export const EntityIdColorThemeParams = {
    ...getPaletteParams({ type: 'colors', colorList: DefaultList }),
    overrideWater: PD.Boolean(false, { description: 'Override the color for water molecules.' }),
    waterColor: PD.Color(DefaultWaterColor, { hideIf: p => !p.overrideWater, description: 'Color for water molecules (if overrideWater is true).' }),
};
export function getEntityIdColorThemeParams(ctx) {
    const params = PD.clone(EntityIdColorThemeParams);
    return params;
}
function key(entityId, sourceSerial) {
    return `${entityId}|${sourceSerial}`;
}
function getSourceSerialMap(structure) {
    const map = new WeakMap();
    let count = 0;
    for (let i = 0, il = structure.models.length; i < il; ++i) {
        const sd = structure.models[i].sourceData;
        if (!map.has(sd))
            map.set(sd, count++);
    }
    return map;
}
function getEntityIdSerialMap(structure, sourceMap) {
    var _a;
    const map = new Map();
    for (let i = 0, il = structure.models.length; i < il; ++i) {
        const sourceSerial = (_a = sourceMap.get(structure.models[i].sourceData)) !== null && _a !== void 0 ? _a : -1;
        const { label_entity_id } = structure.models[i].atomicHierarchy.chains;
        for (let j = 0, jl = label_entity_id.rowCount; j < jl; ++j) {
            const k = key(label_entity_id.value(j), sourceSerial);
            if (!map.has(k))
                map.set(k, map.size);
        }
        const { coarseHierarchy } = structure.models[i];
        if (coarseHierarchy.isDefined) {
            const { entity_id: spheres_entity_id } = coarseHierarchy.spheres;
            for (let j = 0, jl = spheres_entity_id.rowCount; j < jl; ++j) {
                const k = key(spheres_entity_id.value(j), sourceSerial);
                if (!map.has(k))
                    map.set(k, map.size);
            }
            const { entity_id: gaussians_entity_id } = coarseHierarchy.gaussians;
            for (let j = 0, jl = gaussians_entity_id.rowCount; j < jl; ++j) {
                const k = key(gaussians_entity_id.value(j), sourceSerial);
                if (!map.has(k))
                    map.set(k, map.size);
            }
        }
    }
    return map;
}
function getEntityId(location) {
    switch (location.unit.kind) {
        case 0 /* Unit.Kind.Atomic */:
            return StructureProperties.chain.label_entity_id(location);
        case 1 /* Unit.Kind.Spheres */:
        case 2 /* Unit.Kind.Gaussians */:
            return StructureProperties.coarse.entity_id(location);
    }
}
export function EntityIdColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const l = StructureElement.Location.create(ctx.structure.root);
        const sourceSerialMap = getSourceSerialMap(ctx.structure);
        const entityIdSerialMap = getEntityIdSerialMap(ctx.structure.root, sourceSerialMap);
        const labelTable = Array.from(entityIdSerialMap.keys());
        const valueLabel = (i) => labelTable[i];
        const palette = getPalette(entityIdSerialMap.size, props, { valueLabel });
        legend = palette.legend;
        color = (location) => {
            var _a;
            let structElemLoc;
            if (StructureElement.Location.is(location)) {
                structElemLoc = location;
            }
            else if (Bond.isLocation(location)) {
                l.unit = location.aUnit;
                l.element = location.aUnit.elements[location.aIndex];
                structElemLoc = l;
            }
            else {
                return DefaultColor;
            }
            const entityId = getEntityId(structElemLoc);
            const sourceSerial = (_a = sourceSerialMap.get(structElemLoc.unit.model.sourceData)) !== null && _a !== void 0 ? _a : -1;
            if (props.overrideWater) {
                const entities = structElemLoc.unit.model.entities;
                const entityType = entities.data.type.value(entities.getEntityIndex(entityId));
                if (entityType === 'water')
                    return props.waterColor;
            }
            const k = key(entityId, sourceSerial);
            const serial = entityIdSerialMap.get(k);
            return serial === undefined ? DefaultColor : palette.color(serial);
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: EntityIdColorTheme,
        granularity: 'group',
        color,
        props,
        description: Description,
        legend
    };
}
export const EntityIdColorThemeProvider = {
    name: 'entity-id',
    label: 'Entity Id',
    category: ColorThemeCategory.Chain,
    factory: EntityIdColorTheme,
    getParams: getEntityIdColorThemeParams,
    defaultValues: PD.getDefaultValues(EntityIdColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
