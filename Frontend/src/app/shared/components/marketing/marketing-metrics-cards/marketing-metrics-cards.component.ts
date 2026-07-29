import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-marketing-metrics-cards',
  imports: [CommonModule],
  templateUrl: './marketing-metrics-cards.component.html',
  styles: ``
})
export class MarketingMetricsCardsComponent {

  metrics = [
    {
      icon: 'shooting-star',
      label: 'Avg. Client Rating',
      value: '7.8/10',
      change: '+20%',
      changeClass: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
      comparison: 'Vs last month'
    },
    {
      icon: 'group',
      label: 'Instagram Followers',
      value: '5,934',
      change: '-3.59%',
      changeClass: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
      comparison: 'Vs last month'
    },
    {
      icon: 'dollar-line',
      label: 'Total Revenue',
      value: '$9,758',
      change: '+15%',
      changeClass: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
      comparison: 'Vs last month'
    }
  ];
}
