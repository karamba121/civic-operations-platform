import { Component } from '@angular/core';
import { MarketingMetricsCardsComponent } from '../../../shared/components/marketing/marketing-metrics-cards/marketing-metrics-cards.component';
import { ImpressionChartComponent } from '../../../shared/components/marketing/impression-chart/impression-chart.component';
import { FeaturedCampaignComponent } from '../../../shared/components/marketing/featured-campaign/featured-campaign.component';
import { TrafficStatsComponent } from '../../../shared/components/marketing/traffic-stats/traffic-stats.component';
import { TrafficSourceComponent } from '../../../shared/components/marketing/traffic-source/traffic-source.component';

@Component({
  selector: 'app-marketing',
  imports: [
    MarketingMetricsCardsComponent,
    ImpressionChartComponent,
    FeaturedCampaignComponent,
    TrafficStatsComponent,
    TrafficSourceComponent,
  ],
  templateUrl: './marketing.component.html',
})
export class MarketingComponent {

}
