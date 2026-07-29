
import { Component } from '@angular/core';
import { BadgeComponent } from '../../ui/badge/badge.component';

interface Metric {
  id: number;
  title: string;
  value: string;
  change: string;
  direction: 'up' | 'down' | 'neutral';
  comparisonText: string;
}

@Component({
  selector: 'app-analytics-metrics',
  imports: [BadgeComponent],
  templateUrl: './analytics-metrics.component.html',
  styles: ``
})
export class AnalyticsMetricsComponent {

  metrics: Metric[] = [
    {
      id: 1,
      title: "Unique Visitors",
      value: "24.7K",
      change: "+20%",
      direction: "up",
      comparisonText: "Vs last month",
    },
    {
      id: 2,
      title: "Total Pageviews",
      value: "55.9K",
      change: "+4%",
      direction: "up",
      comparisonText: "Vs last month",
    },
    {
      id: 3,
      title: "Bounce Rate",
      value: "54%",
      change: "-1.59%",
      direction: "down",
      comparisonText: "Vs last month",
    },
    {
      id: 4,
      title: "Visit Duration",
      value: "2m 56s",
      change: "+7%",
      direction: "up",
      comparisonText: "Vs last month",
    },
  ];

  getBadgeColor(direction: string): 'success' | 'error' | 'warning' {
    if (direction === 'up') return 'success';
    if (direction === 'down') return 'error';
    return 'warning';
  }
}
