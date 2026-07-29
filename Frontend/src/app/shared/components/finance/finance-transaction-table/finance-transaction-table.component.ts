import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Transaction {
  id: string;
  activity: string;
  price: string;
  date: string;
  status: string;
  status_type: 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-finance-transaction-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-transaction-table.component.html',
  styleUrl: './finance-transaction-table.component.css',
})
export class FinanceTransactionTableComponent {
  transactions: Transaction[] = [
    {
      id: 'NIV_034834',
      activity: 'Hotel Booking',
      price: '$9,234.87',
      date: '15 Mar, 2028 08:22 AM',
      status: 'Completed',
      status_type: 'success',
    },
    {
      id: 'NIV_034345',
      activity: 'Online Shopping',
      price: '$4,567.23',
      date: '28 Feb, 2028 09:15 AM',
      status: 'Completed',
      status_type: 'success',
    },
    {
      id: 'NIV_093854',
      activity: 'Game Purchase',
      price: '$22,101.76',
      date: '14 Feb, 2028 02:55 PM',
      status: 'In Progress',
      status_type: 'warning',
    },
    {
      id: 'NIV_005378',
      activity: 'Utility Bill Payment',
      price: '$7,890.45',
      date: '02 Feb, 2028 06:30 PM',
      status: 'Completed',
      status_type: 'success',
    },
    {
      id: 'NIV_823930',
      activity: 'Online Course Enrollment',
      price: '$11,223.90',
      date: '22 Jan, 2028 11:02 AM',
      status: 'Completed',
      status_type: 'success',
    },
  ];

  selectedItems: string[] = [];
  openActionMenuId: string | null = null;

  isAllSelected(): boolean {
    return this.selectedItems.length === this.transactions.length && this.transactions.length > 0;
  }

  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedItems = [];
    } else {
      this.selectedItems = this.transactions.map((t) => t.id);
    }
  }

  toggleItem(id: string) {
    const index = this.selectedItems.indexOf(id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(id);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedItems.includes(id);
  }

  toggleActionMenu(event: MouseEvent, id: string) {
    event.stopPropagation();
    this.openActionMenuId = this.openActionMenuId === id ? null : id;
  }

  @HostListener('document:click')
  closeActionMenu() {
    this.openActionMenuId = null;
  }
}
