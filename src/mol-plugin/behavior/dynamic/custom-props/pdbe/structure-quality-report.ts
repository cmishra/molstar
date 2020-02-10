/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { OrderedSet } from '../../../../../mol-data/int';
import { StructureQualityReport, StructureQualityReportProvider } from '../../../../../mol-model-props/pdbe/structure-quality-report';
import { StructureQualityReportColorTheme } from '../../../../../mol-model-props/pdbe/themes/structure-quality-report';
import { Loci } from '../../../../../mol-model/loci';
import { StructureElement } from '../../../../../mol-model/structure';
import { ParamDefinition as PD } from '../../../../../mol-util/param-definition';
import { PluginBehavior } from '../../../behavior';
import { ThemeDataContext } from '../../../../../mol-theme/theme';
import { CustomProperty } from '../../../../../mol-model-props/common/custom-property';

export const PDBeStructureQualityReport = PluginBehavior.create<{ autoAttach: boolean, showTooltip: boolean }>({
    name: 'pdbe-structure-quality-report-prop',
    category: 'custom-props',
    display: { name: 'PDBe Structure Quality Report' },
    ctor: class extends PluginBehavior.Handler<{ autoAttach: boolean, showTooltip: boolean }> {

        private provider = StructureQualityReportProvider

        private labelPDBeValidation = (loci: Loci): string | undefined => {
            if (!this.params.showTooltip) return void 0;

            switch (loci.kind) {
                case 'element-loci':
                    if (loci.elements.length === 0) return void 0;
                    const e = loci.elements[0];
                    const u = e.unit;
                    if (!u.model.customProperties.has(StructureQualityReportProvider.descriptor)) return void 0;

                    const se = StructureElement.Location.create(u, u.elements[OrderedSet.getAt(e.indices, 0)]);
                    const issues = StructureQualityReport.getIssues(se);
                    if (issues.length === 0) return 'PDBe Validation: No Issues';
                    return `PDBe Validation: ${issues.join(', ')}`;

                default: return void 0;
            }
        }

        register(): void {
            this.ctx.customModelProperties.register(this.provider, false);
            this.ctx.lociLabels.addProvider(this.labelPDBeValidation);

            this.ctx.structureRepresentation.themeCtx.colorThemeRegistry.add('pdbe-structure-quality-report', {
                label: 'PDBe Structure Quality Report',
                factory: StructureQualityReportColorTheme,
                getParams: () => ({}),
                defaultValues: {},
                isApplicable: (ctx: ThemeDataContext) => StructureQualityReport.isApplicable(ctx.structure?.models[0]),
                ensureCustomProperties: (ctx: CustomProperty.Context, data: ThemeDataContext) => {
                    return data.structure ? StructureQualityReportProvider.attach(ctx, data.structure.models[0]) : Promise.resolve()
                }
            })
        }

        update(p: { autoAttach: boolean, showTooltip: boolean }) {
            let updated = this.params.autoAttach !== p.autoAttach
            this.params.autoAttach = p.autoAttach;
            this.params.showTooltip = p.showTooltip;
            this.ctx.customModelProperties.setDefaultAutoAttach(this.provider.descriptor.name, this.params.autoAttach);
            return updated;
        }

        unregister() {
            this.ctx.customModelProperties.unregister(StructureQualityReportProvider.descriptor.name);
            this.ctx.lociLabels.removeProvider(this.labelPDBeValidation);
            this.ctx.structureRepresentation.themeCtx.colorThemeRegistry.remove('pdbe-structure-quality-report')
        }
    },
    params: () => ({
        autoAttach: PD.Boolean(false),
        showTooltip: PD.Boolean(true)
    })
});