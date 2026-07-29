import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface FinanceStat {
  title: string;
  amount: string;
  iconContainerClass: string;
  iconType: 'wallet' | 'chart' | 'card' | 'shield';
  cardClass: string;
  innerClass: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  trendText?: string;
  isGoal?: boolean;
  goalText?: string;
}

@Component({
  selector: 'app-finance-stats',
  imports: [CommonModule],
  templateUrl: './finance-stats.component.html',
  styleUrl: './finance-stats.component.css',
})
export class FinanceStatsComponent {
  stats: FinanceStat[] = [
    {
      title: 'Total Balance',
      amount: '$24,830',
      iconContainerClass: 'bg-brand-500/10',
      iconType: 'wallet',
      cardClass: 'flex flex-col justify-between rounded-xl bg-white p-6 dark:bg-gray-900',
      innerClass: '',
      trend: 'up',
      trendValue: '3.2%',
      trendText: 'than last month',
    },
    {
      title: 'Monthly Income',
      amount: '$5,200',
      iconContainerClass: 'bg-success-500/10',
      iconType: 'chart',
      cardClass: 'rounded-xl bg-white p-6 dark:bg-gray-900',
      innerClass: 'mb-9.5',
      trend: 'down',
      trendValue: '3.2%',
      trendText: 'than last month',
    },
    {
      title: 'Total Spent',
      amount: '$3,831',
      iconContainerClass: 'bg-orange-500/10',
      iconType: 'card',
      cardClass: 'rounded-xl bg-white p-6 dark:bg-gray-900',
      innerClass: 'mb-9.5',
      trend: 'up',
      trendValue: '295',
      trendText: 'than last month',
    },
    {
      title: 'Saving Rate',
      amount: '26.1%',
      iconContainerClass: 'bg-pink-500/10',
      iconType: 'shield',
      cardClass: 'rounded-xl bg-white p-6 dark:bg-gray-900',
      innerClass: 'mb-9.5',
      isGoal: true,
      goalText: 'Goal: 30% - 3.9% to go',
    },
  ];
}
