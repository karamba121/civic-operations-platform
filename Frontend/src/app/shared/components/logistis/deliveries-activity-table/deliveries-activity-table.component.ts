import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Row {
  id: string;
  category: string;
  company: string;
  arrival: string;
  route: string;
  price: string;
  status: string;
  statusClass: string;
}

interface Sort {
  column: string;
  asc: boolean;
}

@Component({
  selector: 'app-deliveries-activity-table',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './deliveries-activity-table.component.html',
  styles: ``
})
export class DeliveriesActivityTableComponent {

  selectedTab: string = 'All';
  showFilter: boolean = false;
  
  rows: Row[] = [
    {
      id: '#324112',
      category: 'Furniture',
      company: 'HomeLine',
      arrival: '10 Apr 2028 2:15 pm',
      route: 'Berlin–Milan',
      price: '$1,250.00',
      status: 'Delivered',
      statusClass: 'bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500 text-xs rounded-full px-2 py-0.5 font-medium'
    },
    {
      id: '#325678',
      category: 'Clothing',
      company: 'StylePro',
      arrival: '21 May 2028 9:00 am',
      route: 'Paris–Rome',
      price: '$340.75',
      status: 'Delivered',
      statusClass: 'bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500 text-xs rounded-full px-2 py-0.5 font-medium'
    },
    {
      id: '#326789',
      category: 'Books',
      company: 'EduSource',
      arrival: '02 Jun 2028 11:45 am',
      route: 'New York–Chicago',
      price: '$128.40',
      status: 'In Transit',
      statusClass: 'bg-warning-50 dark:bg-warning-500/15 text-warning-600 dark:text-warning-400 text-xs rounded-full px-2 py-0.5 font-medium'
    },
    {
      id: '#327003',
      category: 'Automotive',
      company: 'AutoParts Co.',
      arrival: '18 Mar 2028 4:00 pm',
      route: 'Tokyo–Osaka',
      price: '$2,150.89',
      status: 'Delivered',
      statusClass: 'bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500 text-xs rounded-full px-2 py-0.5 font-medium'
    },
    {
      id: '#328556',
      category: 'Electronics',
      company: 'TechNova',
      arrival: '25 Jul 2028 10:30 am',
      route: 'San Francisco–Seattle',
      price: '$849.99',
      status: 'Delivered',
      statusClass: 'bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500 text-xs rounded-full px-2 py-0.5 font-medium'
    },
    {
      id: '#329101',
      category: 'Health',
      company: 'MediCorp',
      arrival: '30 May 2028 3:00 pm',
      route: 'Toronto–Vancouver',
      price: '$579.20',
      status: 'Delivered',
      statusClass: 'bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500 text-xs rounded-full px-2 py-0.5 font-medium'
    },
    {
      id: '#330212',
      category: 'Toys',
      company: 'FunTime',
      arrival: '07 Jun 2028 1:15 pm',
      route: 'Sydney–Melbourne',
      price: '$212.65',
      status: 'Delivered',
      statusClass: 'bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500 text-xs rounded-full px-2 py-0.5 font-medium'
    },
    {
      id: '#331145',
      category: 'Kitchen',
      company: 'CookWell',
      arrival: '13 May 2028 12:30 pm',
      route: 'Madrid–Barcelona',
      price: '$489.90',
      status: 'Delivered',
      statusClass: 'bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500 text-xs rounded-full px-2 py-0.5 font-medium'
    },
    {
      id: '#332800',
      category: 'Beauty',
      company: 'GlamShine',
      arrival: '28 Jun 2028 5:45 pm',
      route: 'Dubai–Doha',
      price: '$323.75',
      status: 'Canceled',
      statusClass: 'text-xs rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-600 dark:bg-red-500/15 dark:text-red-500'
    },
    {
      id: '#333902',
      category: 'Sports',
      company: 'FitZone',
      arrival: '19 Jul 2028 8:00 am',
      route: 'Los Angeles–Las Vegas',
      price: '$489.90',
      status: '$675.00', // Note: This seems to be a typo in the original data; should likely be a status like 'Delivered'
      statusClass: 'bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500 text-xs rounded-full px-2 py-0.5 font-medium'
    }
  ];
  selectedRows: string[] = [];
  sort: Sort = { column: '', asc: true };
  page: number = 1;
  perPage: number = 5;

  get totalPages(): number {
    return Math.ceil(this.rows.length / this.perPage);
  }
  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get startRow(): number {
    return (this.page - 1) * this.perPage;
  }

  get endRow(): number {
    return this.page * this.perPage;
  }

  toggleAll(): void {
    if (this.selectedRows.length === this.rows.length) {
      this.selectedRows = [];
    } else {
      this.selectedRows = this.rows.map(r => r.id);
    }
  }

  toggleRow(id: string): void {
    this.selectedRows = this.selectedRows.includes(id)
      ? this.selectedRows.filter(r => r !== id)
      : [...this.selectedRows, id];
  }

  sortBy(col: string): void {
    this.sort = {
      column: this.sort.column === col ? col : col,
      asc: this.sort.column === col ? !this.sort.asc : true
    };
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  goToPage(n: number): void {
    this.page = n;
  }

  getPaginatedRows(): Row[] {
    let sorted = [...this.rows];
    if (this.sort.column) {
      sorted.sort((a, b) => {
        const valA = a[this.sort.column as keyof Row];
        const valB = b[this.sort.column as keyof Row];
        if (this.sort.column === 'arrival') {
          return (Number(new Date(valA)) - Number(new Date(valB))) * (this.sort.asc ? 1 : -1);
        }
        if (valA < valB) return this.sort.asc ? -1 : 1;
        if (valA > valB) return this.sort.asc ? 1 : -1;
        return 0;
      });
    }
    return sorted.slice(this.startRow, this.endRow);
  }

  setSelectedTab(tab: string): void {
    this.selectedTab = tab;
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }
}
