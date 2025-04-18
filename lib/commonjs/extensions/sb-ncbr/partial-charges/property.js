"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SbNcbrPartialChargesPropertyProvider = void 0;
exports.hasPartialChargesCategories = hasPartialChargesCategories;
const param_definition_1 = require("../../../mol-util/param-definition");
const mmcif_1 = require("../../../mol-model-formats/structure/mmcif");
const custom_property_1 = require("../../../mol-model/custom-property");
const custom_model_property_1 = require("../../../mol-model-props/common/custom-model-property");
const array_1 = require("../../../mol-util/array");
const db_1 = require("../../../mol-data/db");
const PartialChargesPropertyParams = {
    typeId: param_definition_1.ParamDefinition.Select(0, [[0, '0']]),
};
const DefaultPartialChargesPropertyParams = param_definition_1.ParamDefinition.clone(PartialChargesPropertyParams);
function getParams(model) {
    var _a, _b;
    return (_b = (_a = getData(model).value) === null || _a === void 0 ? void 0 : _a.params) !== null && _b !== void 0 ? _b : DefaultPartialChargesPropertyParams;
}
const PropertyKey = 'sb-ncbr-partial-charges-property-data';
function getData(model) {
    if (PropertyKey in model._staticPropertyData) {
        return model._staticPropertyData[PropertyKey];
    }
    let data;
    if (!exports.SbNcbrPartialChargesPropertyProvider.isApplicable(model)) {
        data = { value: undefined };
    }
    else {
        const typeIdToMethod = getTypeIdToMethod(model);
        const typeIdToAtomIdToCharge = getTypeIdToAtomIdToCharge(model);
        const typeIdToResidueToCharge = getTypeIdToResidueIdToCharge(model, typeIdToAtomIdToCharge);
        const maxAbsoluteAtomCharges = getMaxAbsoluteCharges(typeIdToAtomIdToCharge);
        const maxAbsoluteResidueCharges = getMaxAbsoluteCharges(typeIdToResidueToCharge);
        const maxAbsoluteAtomChargeAll = getMaxAbsoluteAtomChargeAll(maxAbsoluteAtomCharges, maxAbsoluteResidueCharges);
        const options = Array.from(typeIdToMethod.entries()).map(([typeId, method]) => [typeId, method]);
        const params = {
            typeId: param_definition_1.ParamDefinition.Select(1, options),
        };
        data = {
            value: {
                typeIdToMethod,
                typeIdToAtomIdToCharge,
                typeIdToResidueToCharge,
                maxAbsoluteAtomCharges,
                maxAbsoluteResidueCharges,
                maxAbsoluteAtomChargeAll,
                params,
            },
        };
    }
    model._staticPropertyData[PropertyKey] = data;
    return data;
}
function getTypeIdToMethod(model) {
    const typeIdToMethod = new Map();
    const sourceData = model.sourceData;
    const rowCount = sourceData.data.frame.categories.sb_ncbr_partial_atomic_charges_meta.rowCount;
    const typeIds = sourceData.data.frame.categories.sb_ncbr_partial_atomic_charges_meta.getField('id');
    const methods = sourceData.data.frame.categories.sb_ncbr_partial_atomic_charges_meta.getField('method');
    if (!typeIds || !methods) {
        return typeIdToMethod;
    }
    for (let i = 0; i < rowCount; ++i) {
        const typeId = typeIds.int(i);
        const method = methods.str(i);
        typeIdToMethod.set(typeId, method);
    }
    return typeIdToMethod;
}
function getTypeIdToAtomIdToCharge(model) {
    var _a;
    const atomIdToCharge = new Map();
    const sourceData = model.sourceData;
    const rowCount = sourceData.data.frame.categories.sb_ncbr_partial_atomic_charges.rowCount;
    const typeIds = sourceData.data.frame.categories.sb_ncbr_partial_atomic_charges.getField('type_id');
    const atomIds = sourceData.data.frame.categories.sb_ncbr_partial_atomic_charges.getField('atom_id');
    const charges = sourceData.data.frame.categories.sb_ncbr_partial_atomic_charges.getField('charge');
    if (!typeIds || !atomIds || !charges)
        return atomIdToCharge;
    for (let i = 0; i < rowCount; ++i) {
        const typeId = typeIds.int(i);
        const atomId = atomIds.int(i);
        const isPresent = charges.valueKind(i) === db_1.Column.ValueKind.Present;
        if (!isPresent)
            continue;
        const charge = charges.float(i);
        if (!atomIdToCharge.has(typeId))
            atomIdToCharge.set(typeId, new Map());
        (_a = atomIdToCharge.get(typeId)) === null || _a === void 0 ? void 0 : _a.set(atomId, charge);
    }
    return atomIdToCharge;
}
function getTypeIdToResidueIdToCharge(model, typeIdToAtomIdToCharge) {
    const { offsets, count } = model.atomicHierarchy.residueAtomSegments;
    const { atomId: atomIds } = model.atomicConformation;
    const residueToCharge = new Map();
    typeIdToAtomIdToCharge.forEach((atomIdToCharge, typeId) => {
        if (!residueToCharge.has(typeId))
            residueToCharge.set(typeId, new Map());
        const residueCharges = residueToCharge.get(typeId);
        for (let rI = 0; rI < count; rI++) {
            let charge = 0;
            for (let aI = offsets[rI], _aI = offsets[rI + 1]; aI < _aI; aI++) {
                const atom_id = atomIds.value(aI);
                charge += atomIdToCharge.get(atom_id) || 0;
            }
            for (let aI = offsets[rI], _aI = offsets[rI + 1]; aI < _aI; aI++) {
                const atom_id = atomIds.value(aI);
                residueCharges.set(atom_id, charge);
            }
        }
    });
    return residueToCharge;
}
function getMaxAbsoluteCharges(typeIdToCharge) {
    const maxAbsoluteCharges = new Map();
    typeIdToCharge.forEach((idToCharge, typeId) => {
        const charges = Array.from(idToCharge.values());
        const [min, max] = (0, array_1.arrayMinMax)(charges);
        const bound = Math.max(Math.abs(min), max);
        maxAbsoluteCharges.set(typeId, bound);
    });
    return maxAbsoluteCharges;
}
function getMaxAbsoluteAtomChargeAll(maxAbsoluteAtomCharges, maxAbsoluteResidueCharges) {
    let maxAbsoluteCharge = 0;
    maxAbsoluteAtomCharges.forEach((_, typeId) => {
        const maxCharge = maxAbsoluteAtomCharges.get(typeId) || 0;
        if (maxCharge > maxAbsoluteCharge)
            maxAbsoluteCharge = maxCharge;
    });
    maxAbsoluteResidueCharges.forEach((_, typeId) => {
        const maxCharge = maxAbsoluteResidueCharges.get(typeId) || 0;
        if (maxCharge > maxAbsoluteCharge)
            maxAbsoluteCharge = maxCharge;
    });
    return maxAbsoluteCharge;
}
function hasPartialChargesCategories(model) {
    if (!model || !mmcif_1.MmcifFormat.is(model.sourceData))
        return false;
    const { categories } = model.sourceData.data.frame;
    return ('atom_site' in categories &&
        'sb_ncbr_partial_atomic_charges' in categories &&
        'sb_ncbr_partial_atomic_charges_meta' in categories);
}
exports.SbNcbrPartialChargesPropertyProvider = custom_model_property_1.CustomModelProperty.createProvider({
    label: 'SB NCBR Partial Charges Property Provider',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'sb-ncbr-partial-charges-property-provider',
    }),
    type: 'static',
    defaultParams: DefaultPartialChargesPropertyParams,
    getParams: (data) => getParams(data),
    isApplicable: (model) => hasPartialChargesCategories(model),
    obtain: (_ctx, model) => Promise.resolve(getData(model)),
});
