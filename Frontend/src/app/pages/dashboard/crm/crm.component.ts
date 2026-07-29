import { Component } from '@angular/core';
import { CrmMetricsComponent } from '../../../shared/components/crm/crm-metrics/crm-metrics.component';
import { CrmStatisticsChartComponent } from '../../../shared/components/crm/crm-statistics-chart/crm-statistics-chart.component';
import { EstimatedRevenueComponent } from '../../../shared/components/crm/estimated-revenue/estimated-revenue.component';
import { SalePieChartComponent } from '../../../shared/components/crm/sale-pie-chart/sale-pie-chart.component';
import { UpcomingScheduleComponent } from '../../../shared/components/crm/upcoming-schedule/upcoming-schedule.component';
import { CrmRecentOrdersComponent } from '../../../shared/components/crm/crm-recent-orders/crm-recent-orders.component';

@Component({
  selector: 'app-crm',
  imports: [
    CrmMetricsComponent,
    CrmStatisticsChartComponent,
    EstimatedRevenueComponent,
    SalePieChartComponent,
    UpcomingScheduleComponent,
    CrmRecentOrdersComponent,
  ],
  templateUrl: './crm.component.html'
})
export class CrmComponent {

}
