import { FormsModule } from '@angular/forms';

import { Component } from '@angular/core';
import { BadgeComponent } from '../../ui/badge/badge.component';

interface Transaction {
  image: string;
  action: string;
  date: string;
  amount: string;
  category: string;
  status: 'Success' | 'Pending' | 'Failed';
}

@Component({
  selector: 'app-latest-transactions',
  imports: [FormsModule, BadgeComponent],
  templateUrl: './latest-transactions.component.html',
})
export class LatestTransactionsComponent {
  transactionData: Transaction[] = [
    {
      image: '/images/brand/brand-08.svg',
      action: 'Bought PYPL',
      date: 'Nov 23, 01:00 PM',
      amount: '$2,567.88',
      category: 'Finance',
      status: 'Success',
    },
    {
      image: '/images/brand/brand-07.svg',
      action: 'Bought AAPL',
      date: 'Nov 23, 01:00 PM',
      amount: '$2,567.88',
      category: 'Finance',
      status: 'Pending',
    },
    {
      image: '/images/brand/brand-15.svg',
      action: 'Sell KKST',
      date: 'Nov 23, 01:00 PM',
      amount: '$2,567.88',
      category: 'Finance',
      status: 'Success',
    },
    {
      image: '/images/brand/brand-02.svg',
      action: 'Bought FB',
      date: 'Nov 23, 01:00 PM',
      amount: '$2,567.88',
      category: 'Finance',
      status: 'Success',
    },
    {
      image: '/images/brand/brand-10.svg',
      action: 'Sell AMZN',
      date: 'Nov 23, 01:00 PM',
      amount: '$2,567.88',
      category: 'Finance',
      status: 'Failed',
    },
  ];

  searchTerm = '';
  get filteredTransactions() {
    if (!this.searchTerm) return this.transactionData;
    const term = this.searchTerm.toLowerCase();
    return this.transactionData.filter(
      t =>
        t.action.toLowerCase().includes(term) ||
        t.date.toLowerCase().includes(term) ||
        t.amount.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        t.status.toLowerCase().includes(term)
    );
  }

  getBadgeColor(type: 'Success' | 'Pending' | 'Failed'): 'success' | 'warning' | 'error' {
    if (type === 'Success') return 'success';
    if (type === 'Pending') return 'warning';
    return 'error';
  }
}
