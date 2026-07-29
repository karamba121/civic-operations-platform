import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationWithIconComponent } from '../pagination-with-icon/pagination-with-icon.component';
import { FormsModule } from '@angular/forms';

interface User {
  image: string;
  name: string;
}

interface TableRowData {
  id: number;
  user: User;
  position: string;
  location: string;
  age: number;
  date: string;
  salary: string;
}

type SortKey = 'name' | 'position' | 'location' | 'age' | 'date' | 'salary';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-data-table-one',
  imports: [
    CommonModule,
    PaginationWithIconComponent,
    FormsModule
  ],
  templateUrl: './data-table-one.component.html',
  styles: ``
})
export class DataTableOneComponent {

  tableData: TableRowData[] = [
    {
      id: 1,
      user: { image: '/images/user/user-20.jpg', name: 'Abram Schleifer' },
      position: 'Sales Assistant',
      location: 'Edinburgh',
      age: 57,
      date: '25 Apr, 2027',
      salary: '$89,500',
    },
    {
      id: 2,
      user: { image: '/images/user/user-21.jpg', name: 'Charlotte Anderson' },
      position: 'Marketing Manager',
      location: 'London',
      age: 42,
      date: '12 Mar, 2025',
      salary: '$105,000',
    },
    {
      id: 3,
      user: { image: '/images/user/user-22.jpg', name: 'Ethan Brown' },
      position: 'Software Engineer',
      location: 'San Francisco',
      age: 30,
      date: '01 Jan, 2024',
      salary: '$120,000',
    },
    {
      id: 4,
      user: { image: '/images/user/user-23.jpg', name: 'Sophia Martinez' },
      position: 'Product Manager',
      location: 'New York',
      age: 35,
      date: '15 Jun, 2026',
      salary: '$95,000',
    },
    {
      id: 5,
      user: { image: '/images/user/user-24.jpg', name: 'James Wilson' },
      position: 'Data Analyst',
      location: 'Chicago',
      age: 28,
      date: '20 Sep, 2025',
      salary: '$80,000',
    },
    {
      id: 6,
      user: { image: '/images/user/user-25.jpg', name: 'Olivia Johnson' },
      position: 'HR Specialist',
      location: 'Los Angeles',
      age: 40,
      date: '08 Nov, 2026',
      salary: '$75,000',
    },
    {
      id: 7,
      user: { image: '/images/user/user-26.jpg', name: 'William Smith' },
      position: 'Financial Analyst',
      location: 'Seattle',
      age: 38,
      date: '03 Feb, 2026',
      salary: '$88,000',
    },
    {
      id: 8,
      user: { image: '/images/user/user-27.jpg', name: 'Isabella Davis' },
      position: 'UI/UX Designer',
      location: 'Austin',
      age: 29,
      date: '18 Jul, 2025',
      salary: '$92,000',
    },
    {
      id: 9,
      user: { image: '/images/user/user-28.jpg', name: 'Liam Moore' },
      position: 'DevOps Engineer',
      location: 'Boston',
      age: 33,
      date: '30 Oct, 2024',
      salary: '$115,000',
    },
    {
      id: 10,
      user: { image: '/images/user/user-29.jpg', name: 'Mia Garcia' },
      position: 'Content Strategist',
      location: 'Denver',
      age: 27,
      date: '12 Dec, 2027',
      salary: '$70,000',
    },
  ];

  columns = [
    { key: 'name', label: 'User' },
    { key: 'position', label: 'Position' },
    { key: 'location', label: 'Office' },
    { key: 'age', label: 'Age' },
    { key: 'date', label: 'Start Date' },
    { key: 'salary', label: 'Salary' },
  ];

  currentPage: number = 1;
  itemsPerPage: number = 10;
  sortKey: SortKey = 'name';
  sortOrder: SortOrder = 'asc';
  searchTerm: string = '';

  get filteredAndSortedData() {
    return this.tableData
      .filter((item) =>
        Object.values(item).some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            (typeof value === 'object' && value.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
        )
      )
      .sort((a, b) => {
        if (this.sortKey === 'name') {
          return this.sortOrder === 'asc'
            ? a.user.name.localeCompare(b.user.name)
            : b.user.name.localeCompare(a.user.name);
        }
        if (this.sortKey === 'salary') {
          const salaryA = Number.parseInt(a[this.sortKey].replace(/\$|,/g, ''));
          const salaryB = Number.parseInt(b[this.sortKey].replace(/\$|,/g, ''));
          return this.sortOrder === 'asc' ? salaryA - salaryB : salaryB - salaryA;
        }
        return this.sortOrder === 'asc'
          ? String(a[this.sortKey]).localeCompare(String(b[this.sortKey]))
          : String(b[this.sortKey]).localeCompare(String(a[this.sortKey]));
      });
  }

  get totalItems() {
    return this.filteredAndSortedData.length;
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get startIndex() {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex() {
    return Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
  }

  get currentData() {
    return this.filteredAndSortedData.slice(this.startIndex, this.endIndex);
  }

  handlePageChange(page: number) {
    console.log(page,'page change')
    this.currentPage = page;
  }

  handleSort(key: SortKey | string) {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key as SortKey;
      this.sortOrder = 'asc';
    }
  }

  onItemsPerPageChange() {
    this.currentPage = 1; // Reset to first page when items per page changes
  }
}
