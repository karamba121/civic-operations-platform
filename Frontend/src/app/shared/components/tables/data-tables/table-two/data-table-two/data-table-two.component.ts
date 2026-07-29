import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationButtonComponent } from '../pagination-with-button/pagination-with-button.component';

interface TableRow {
  id: number;
  name: string;
  position: string;
  location: string;
  age: number;
  date: string;
  salary: string;
}

type SortKey = 'name' | 'position' | 'location' | 'age' | 'date' | 'salary';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-data-table-two',
  imports: [
    CommonModule,
    PaginationButtonComponent,
    FormsModule,
  ],
  templateUrl:'./data-table-two.component.html',
  styles: ``
})
export class DataTableTwoComponent {

  tableRowData: TableRow[] = [
    { id: 1, name: 'Abram Schleifer', position: 'Sales Assistant', location: 'Edinburgh', age: 57, date: '25 Apr, 2027', salary: '$89,500' },
    { id: 2, name: 'Charlotte Anderson', position: 'Marketing Manager', location: 'London', age: 42, date: '12 Mar, 2025', salary: '$105,000' },
    { id: 3, name: 'Ethan Brown', position: 'Software Engineer', location: 'San Francisco', age: 30, date: '01 Jan, 2024', salary: '$120,000' },
    { id: 4, name: 'Sophia Martinez', position: 'Product Manager', location: 'New York', age: 35, date: '15 Jun, 2026', salary: '$95,000' },
    { id: 5, name: 'James Wilson', position: 'Data Analyst', location: 'Chicago', age: 28, date: '20 Sep, 2025', salary: '$80,000' },
    { id: 6, name: 'Olivia Johnson', position: 'HR Specialist', location: 'Los Angeles', age: 40, date: '08 Nov, 2026', salary: '$75,000' },
    { id: 7, name: 'William Smith', position: 'Financial Analyst', location: 'Seattle', age: 38, date: '03 Feb, 2026', salary: '$88,000' },
    { id: 8, name: 'Isabella Davis', position: 'UI/UX Designer', location: 'Austin', age: 29, date: '18 Jul, 2025', salary: '$92,000' },
    { id: 9, name: 'Liam Moore', position: 'DevOps Engineer', location: 'Boston', age: 33, date: '30 Oct, 2024', salary: '$115,000' },
    { id: 10, name: 'Mia Garcia', position: 'Content Strategist', location: 'Denver', age: 27, date: '12 Dec, 2027', salary: '$70,000' }
  ];

  headers = [
    { key: 'name', label: 'User' },
    { key: 'position', label: 'Position' },
    { key: 'location', label: 'Office' },
    { key: 'age', label: 'Age' },
    { key: 'date', label: 'Start Date' },
    { key: 'salary', label: 'Salary' }
  ];

  currentPage: number = 1;
  itemsPerPage: number = 10;
  sortKey: SortKey = 'name';
  sortOrder: SortOrder = 'asc';
  searchTerm: string = '';
  filteredAndSortedData: TableRow[] = [];
  totalItems: number = 0;
  totalPages: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;
  currentData: TableRow[] = [];

  ngOnInit() {
    this.updateData();
  }

  handlePageChange(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  handleSort(key: SortKey | string) {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key as SortKey;
      this.sortOrder = 'asc';
    }
    this.currentPage = 1; // Reset to first page on sort
    this.updateData();
  }

  updateData() {
    this.filteredAndSortedData = this.tableRowData
      .filter(item =>
        Object.values(item).some(
          value => typeof value === 'string' && value.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => {
        if (this.sortKey === 'salary') {
          const salaryA = parseInt(a[this.sortKey].replace(/\$|,/g, ''));
          const salaryB = parseInt(b[this.sortKey].replace(/\$|,/g, ''));
          return this.sortOrder === 'asc' ? salaryA - salaryB : salaryB - salaryA;
        }
        return this.sortOrder === 'asc'
          ? String(a[this.sortKey]).localeCompare(String(b[this.sortKey]))
          : String(b[this.sortKey]).localeCompare(String(a[this.sortKey]));
      });

    this.updatePagination();
  }

  updatePagination() {
    this.totalItems = this.filteredAndSortedData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
    this.currentData = this.filteredAndSortedData.slice(this.startIndex, this.endIndex);
  }
}
