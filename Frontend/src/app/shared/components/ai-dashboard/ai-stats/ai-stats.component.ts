import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ai-stats',
  imports: [
    CommonModule
  ],
  templateUrl: './ai-stats.component.html',
  styleUrl: './ai-stats.component.css',
})
export class AiStatsComponent {

  readonly stats = [
    {
      label: 'Users',
      value: '10,590',
      period: 'Last 30 Days',
      change: '3.52%',
      trend: 'up',
      icon: 'users',
      accentClass: 'text-brand-400',
    },
    {
      label: 'Projects',
      value: '15,682',
      period: 'Last 30 Days',
      change: '3.52%',
      trend: 'up',
      icon: 'projects',
      accentClass: 'text-sky-400',
    },
    {
      label: 'Revenue',
      value: '$90,369',
      period: 'Last 30 Days',
      change: '14.8%',
      trend: 'up',
      icon: 'revenue',
      accentClass: 'text-success-500',
    },
    {
      label: 'Paid Users',
      value: '520',
      period: 'Last 30 Days',
      change: '9.05%',
      trend: 'down',
      icon: 'paidUsers',
      accentClass: 'text-orange-400',
    },
  ] as const;
}
