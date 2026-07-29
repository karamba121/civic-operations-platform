import { Component } from '@angular/core';
import { AnalyticsMetricsComponent } from '../../../shared/components/analytics/analytics-metrics/analytics-metrics.component';
import { AnalyticsBarChartComponent } from '../../../shared/components/analytics/analytics-bar-chart/analytics-bar-chart.component';
import { TopChannelComponent } from '../../../shared/components/analytics/top-channel/top-channel.component';
import { TopPagesComponent } from '../../../shared/components/analytics/top-pages/top-pages.component';
import { ActiveUsersChartComponent } from '../../../shared/components/analytics/active-users-chart/active-users-chart.component';
import { AcquisitionChannelChartComponent } from '../../../shared/components/analytics/acquisition-channel-chart/acquisition-channel-chart.component';
import { SessionChartComponent } from '../../../shared/components/analytics/session-chart/session-chart.component';
import { DemographicCardComponent } from '../../../shared/components/ecommerce/demographic-card/demographic-card.component';
import { RecentAnalyticsOrderComponent } from '../../../shared/components/analytics/recent-analytics-order/recent-analytics-order.component';

@Component({
  selector: 'app-analytics',
  imports: [
    AnalyticsMetricsComponent,
    AnalyticsBarChartComponent,
    TopChannelComponent,
    TopPagesComponent,
    ActiveUsersChartComponent,
    AcquisitionChannelChartComponent,
    SessionChartComponent,
    DemographicCardComponent,
    RecentAnalyticsOrderComponent,
  ],
  templateUrl: './analytics.component.html'
})
export class AnalyticsComponent {

}
