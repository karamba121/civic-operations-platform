
import { Component } from '@angular/core';
import { BadgeComponent } from '../../ui/badge/badge.component';

@Component({
  selector: 'app-crm-metrics',
  imports: [
    BadgeComponent
],
  templateUrl: './crm-metrics.component.html',
  styles: ``
})
export class CrmMetricsComponent {

  metrics = [
    {
      id: 1,
      title: "Active Deal",
      value: "$120,369",
      change: "+20%",
      direction: "up",
      comparisonText: "last month",
    },
    {
      id: 2,
      title: "Revenue Total",
      value: "$234,210",
      change: "+9.0%",
      direction: "up",
      comparisonText: "last month",
    },
    {
      id: 3,
      title: "Closed Deals",
      value: "874",
      change: "-4.5%",
      direction: "down",
      comparisonText: "last month",
    },
  ];

  getBadgeColor(direction: string): 'success' | 'error' | 'warning' {
    if (direction === 'up') return 'success';
    if (direction === 'down') return 'error';
    return 'warning';
  }
}
