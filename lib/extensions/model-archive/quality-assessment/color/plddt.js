/**
 * Copyright (c) 2021-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Mandar Deshpande <mandar@ebi.ac.uk>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { QualityAssessment, QualityAssessmentProvider } from '../prop';
import { Bond, Model, StructureElement, Unit } from '../../../../mol-model/structure';
import { Color } from '../../../../mol-util/color';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
import { TableLegend } from '../../../../mol-util/legend';
import { ColorThemeCategory } from '../../../../mol-theme/color/categories';
const DefaultColor = Color(0xaaaaaa);
const ConfidenceColors = {
    'No Score': DefaultColor,
    'Very Low': Color(0xff7d45),
    'Low': Color(0xffdb13),
    'Confident': Color(0x65cbf3),
    'Very High': Color(0x0053d6)
};
const ConfidenceColorLegend = TableLegend(Object.entries(ConfidenceColors));
export function getPLDDTConfidenceColorThemeParams(ctx) {
    var _a;
    return {
        metricId: QualityAssessment.getLocalOptions((_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.models[0], 'pLDDT'),
    };
}
export function PLDDTConfidenceColorTheme(ctx, props) {
    let color = () => DefaultColor;
    if (ctx.structure) {
        const l = StructureElement.Location.create(ctx.structure.root);
        const getColor = (location) => {
            var _a, _b;
            const { unit, element } = location;
            if (!Unit.isAtomic(unit))
                return DefaultColor;
            const qualityAssessment = QualityAssessmentProvider.get(unit.model).value;
            const metric = (_b = (_a = qualityAssessment === null || qualityAssessment === void 0 ? void 0 : qualityAssessment.localMap.get(props.metricId)) === null || _a === void 0 ? void 0 : _a.values) !== null && _b !== void 0 ? _b : qualityAssessment === null || qualityAssessment === void 0 ? void 0 : qualityAssessment.pLDDT;
            let score = metric === null || metric === void 0 ? void 0 : metric.get(unit.model.atomicHierarchy.residueAtomSegments.index[element]);
            if (typeof score !== 'number') {
                score = unit.model.atomicConformation.B_iso_or_equiv.value(element);
            }
            if (score < 0) {
                return DefaultColor;
            }
            else if (score <= 50) {
                return Color(0xff7d45);
            }
            else if (score <= 70) {
                return Color(0xffdb13);
            }
            else if (score <= 90) {
                return Color(0x65cbf3);
            }
            else {
                return Color(0x0053d6);
            }
        };
        color = (location) => {
            if (StructureElement.Location.is(location)) {
                return getColor(location);
            }
            else if (Bond.isLocation(location)) {
                l.unit = location.aUnit;
                l.element = location.aUnit.elements[location.aIndex];
                return getColor(l);
            }
            return DefaultColor;
        };
    }
    return {
        factory: PLDDTConfidenceColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        description: 'Assigns residue colors according to the pLDDT Confidence score. If no Model Archive quality assessment score is available, the B-factor value is used instead.',
        legend: ConfidenceColorLegend
    };
}
export const PLDDTConfidenceColorThemeProvider = {
    name: 'plddt-confidence',
    label: 'pLDDT Confidence',
    category: ColorThemeCategory.Validation,
    factory: PLDDTConfidenceColorTheme,
    getParams: getPLDDTConfidenceColorThemeParams,
    defaultValues: PD.getDefaultValues(getPLDDTConfidenceColorThemeParams({})),
    isApplicable: (ctx) => { var _a; return !!((_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.models.some(m => QualityAssessment.isApplicable(m, 'pLDDT') || (m.atomicConformation.B_iso_or_equiv.isDefined && !Model.isExperimental(m)))); },
    ensureCustomProperties: {
        attach: async (ctx, data) => {
            if (data.structure) {
                for (const m of data.structure.models) {
                    await QualityAssessmentProvider.attach(ctx, m, void 0, true);
                }
            }
        },
        detach: async (data) => {
            if (data.structure) {
                for (const m of data.structure.models) {
                    QualityAssessmentProvider.ref(m, false);
                }
            }
        }
    }
};
