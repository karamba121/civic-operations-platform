
import { Component } from '@angular/core';
import { SaasMetricsComponent } from '../../../shared/components/saas/saas-metrics/saas-metrics.component';
import { ChurnRateChartComponent } from '../../../shared/components/saas/churn-rate-chart/churn-rate-chart.component';
import { GrowthChartComponent } from '../../../shared/components/saas/growth-chart/growth-chart.component';
import { FunnelChartComponent } from '../../../shared/components/saas/funnel-chart/funnel-chart.component';
import { SaasInvoiceTableComponent } from '../../../shared/components/saas/saas-invoice-table/saas-invoice-table.component';
import { ProductPerformanceTabComponent } from '../../../shared/components/saas/product-performance-tab/product-performance-tab.component';
import { ActivitiesCardComponent } from '../../../shared/components/saas/activities-card/activities-card.component';

@Component({
  selector: 'app-saas',
  imports: [
    SaasMetricsComponent,
    ChurnRateChartComponent,
    GrowthChartComponent,
    FunnelChartComponent,
    SaasInvoiceTableComponent,
    ProductPerformanceTabComponent,
    ActivitiesCardComponent
],
  templateUrl: './saas.component.html'
})
export class SaasComponent {

}
