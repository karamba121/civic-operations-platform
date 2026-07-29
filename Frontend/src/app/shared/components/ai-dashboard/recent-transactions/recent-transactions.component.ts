import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';

@Component({
  selector: 'app-recent-transactions',
  imports: [
    CommonModule,
    FormsModule,
    DropdownItemComponent,
    DropdownComponent,
  ],
  templateUrl: './recent-transactions.component.html',
  styleUrl: './recent-transactions.component.css',
})
export class RecentTransactionsComponent {
  searchTerm = '';
  openDropdown: string | null = null;
  currentPage = 1;
  readonly itemsPerPage = 5;


  readonly transactions = [
    { id: 'txn-1', paidBy: 'John Doe', email: 'johndoe@gmail.com', packageName: 'Starter - Monthly', price: '$20.00', paidDate: '28 Feb, 2029', status: 'Active' },
    { id: 'txn-2', paidBy: 'Kierra Briggs', email: 'kierra@gmail.com', packageName: 'Growth - Yearly', price: '$249.00', paidDate: '28 Jan, 2029', status: 'Active' },
    { id: 'txn-3', paidBy: 'Wade Warren', email: 'wade@example.com', packageName: 'Enterprise - Monthly', price: '$99.00', paidDate: '15 Jan, 2029', status: 'Pending' },
    { id: 'txn-4', paidBy: 'Kristin Watson', email: 'kristin@example.com', packageName: 'Pro - Monthly', price: '$59.00', paidDate: '06 Jan, 2029', status: 'Active' },
    { id: 'txn-5', paidBy: 'Cody Fisher', email: 'cody@example.com', packageName: 'Starter - Yearly', price: '$199.00', paidDate: '24 Dec, 2028', status: 'Canceled' },
    { id: 'txn-6', paidBy: 'Claire Robertson', email: 'claire@example.com', packageName: 'Growth - Yearly', price: '$249.00', paidDate: '28 Jan, 2029', status: 'Active' },
    { id: 'txn-7', paidBy: 'Esther Howard', email: 'esther@example.com', packageName: 'Pro - Yearly', price: '$299.00', paidDate: '28 Jan, 2029', status: 'Active' },
    { id: 'txn-8', paidBy: 'Jenny Wilson', email: 'jenny@example.com', packageName: 'Enterprise - Monthly', price: '$99.00', paidDate: '28 Jan, 2029', status: 'Active' },
    { id: 'txn-9', paidBy: 'Ralph Edwards', email: 'ralph@example.com', packageName: 'Starter - Monthly', price: '$20.00', paidDate: '28 Jan, 2029', status: 'Pending' },
    { id: 'txn-10', paidBy: 'Jacob Jones', email: 'jacob@example.com', packageName: 'Growth - Yearly', price: '$249.00', paidDate: '28 Jan, 2029', status: 'Active' },
    { id: 'txn-11', paidBy: 'John Doe', email: 'johndoe@gmail.com', packageName: 'Starter - Monthly', price: '$20.00', paidDate: '28 Feb, 2029', status: 'Active' },
    { id: 'txn-12', paidBy: 'Kierra Briggs', email: 'kierra@gmail.com', packageName: 'Growth - Yearly', price: '$249.00', paidDate: '28 Jan, 2029', status: 'Active' },
    { id: 'txn-13', paidBy: 'Wade Warren', email: 'wade@example.com', packageName: 'Enterprise - Monthly', price: '$99.00', paidDate: '15 Jan, 2029', status: 'Pending' },
    { id: 'txn-14', paidBy: 'Kristin Watson', email: 'kristin@example.com', packageName: 'Pro - Monthly', price: '$59.00', paidDate: '06 Jan, 2029', status: 'Active' },
    { id: 'txn-15', paidBy: 'Cody Fisher', email: 'cody@example.com', packageName: 'Starter - Yearly', price: '$199.00', paidDate: '24 Dec, 2028', status: 'Canceled' },
    { id: 'txn-16', paidBy: 'Claire Robertson', email: 'claire@example.com', packageName: 'Growth - Yearly', price: '$249.00', paidDate: '28 Jan, 2029', status: 'Active' },
    { id: 'txn-17', paidBy: 'Esther Howard', email: 'esther@example.com', packageName: 'Pro - Yearly', price: '$299.00', paidDate: '28 Jan, 2029', status: 'Active' },
    { id: 'txn-18', paidBy: 'Jenny Wilson', email: 'jenny@example.com', packageName: 'Enterprise - Monthly', price: '$99.00', paidDate: '28 Jan, 2029', status: 'Active' },
    { id: 'txn-19', paidBy: 'Ralph Edwards', email: 'ralph@example.com', packageName: 'Starter - Monthly', price: '$20.00', paidDate: '28 Jan, 2029', status: 'Pending' },
    { id: 'txn-20', paidBy: 'Jacob Jones', email: 'jacob@example.com', packageName: 'Growth - Yearly', price: '$249.00', paidDate: '28 Jan, 2029', status: 'Active' },
  ] as const;

  get filteredTransactions() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.transactions;
    }

    return this.transactions.filter((transaction) =>
      [
        transaction.paidBy,
        transaction.email,
        transaction.packageName,
        transaction.price,
        transaction.paidDate,
        transaction.status,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredTransactions.length / this.itemsPerPage));
  }

  get paginatedTransactions() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get visiblePageNumbers() {
    const total = this.totalPages;
    if (total <= 5) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    if (this.currentPage <= 3) {
      return [1, 2, 3, '...', total - 1, total] as const;
    }

    if (this.currentPage >= total - 2) {
      return [1, 2, '...', total - 2, total - 1, total] as const;
    }

    return [1, '...', this.currentPage, '...', total] as const;
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  goToPreviousPage() {
    this.setPage(this.currentPage - 1);
  }

  goToNextPage() {
    this.setPage(this.currentPage + 1);
  }

  toggleDropdown(key: string) {
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  closeDropdown() {
    this.openDropdown = null;
  }



  getStatusClass(status: string) {
    switch (status) {
      case 'Active':
        return 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500';
      case 'Pending':
        return 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400';
      default:
        return 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400';
    }
  }
}
