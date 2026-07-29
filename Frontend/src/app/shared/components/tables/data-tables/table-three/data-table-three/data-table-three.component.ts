import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';
import { CheckboxComponent } from '../../../../form/input/checkbox.component';
import { ButtonComponent } from '../../../../ui/button/button.component';
import { BadgeComponent } from '../../../../ui/badge/badge.component';

interface User {
  name: string;
  email: string;
}

interface TableRow {
  id: number;
  user: User;
  position: string;
  location: string;
  status: string;
  salary: string;
}

@Component({
  selector: 'app-data-table-three',
  imports: [
    PaginationComponent,
    FormsModule,
    CheckboxComponent,
    ButtonComponent,
    BadgeComponent
],
  templateUrl: './data-table-three.component.html',
  styles: ``
})
export class DataTableThreeComponent {

  tableRowData: TableRow[] = [
    { id: 1, user: { name: 'Lindsey Curtis', email: 'demoemail@gmail.com' }, position: 'Sales Assistant', location: 'Edinburgh', status: 'Hired', salary: '$89,500' },
    { id: 2, user: { name: 'Kaiya George', email: 'demoemail@gmail.com' }, position: 'Chief Executive Officer', location: 'London', status: 'In Progress', salary: '$105,000' },
    { id: 3, user: { name: 'Zain Geidt', email: 'demoemail@gmail.com' }, position: 'Junior Technical Author', location: 'San Francisco', status: 'In Progress', salary: '$120,000' },
    { id: 4, user: { name: 'Abram Schleifer', email: 'demoemail@gmail.com' }, position: 'Software Engineer', location: 'New York', status: 'Hired', salary: '$95,000' },
    { id: 5, user: { name: 'Carla George', email: 'demoemail@gmail.com' }, position: 'Integration Specialist', location: 'Chicago', status: 'Pending', salary: '$80,000' },
    { id: 6, user: { name: 'Emery Culhane', email: 'demoemail@gmail.com' }, position: 'Pre-Sales Support', location: 'Los Angeles', status: 'Hired', salary: '$75,000' },
    { id: 7, user: { name: 'Livia Donin', email: 'demoemail@gmail.com' }, position: 'Sales Assistant', location: 'Seattle', status: 'Hired', salary: '$88,000' },
    { id: 8, user: { name: 'Lincoln Herwitz', email: 'demoemail@gmail.com' }, position: 'Senior Javascript Developer', location: 'Austin', status: 'Hired', salary: '$92,000' },
    { id: 9, user: { name: 'Miracle Bator', email: 'demoemail@gmail.com' }, position: 'Software Engineer', location: 'Boston', status: 'In Progress', salary: '$115,000' },
    { id: 10, user: { name: 'Ekstrom Bothman', email: 'demoemail@gmail.com' }, position: 'Sales Assistant', location: 'Denver', status: 'In Progress', salary: '$70,000' }
  ];

  checkedItems: { [key: number]: boolean } = {};
  isAllChecked: boolean = false;
  rowsPerPage: number = 5;
  currentPage: number = 1;
  totalPages: number = 0;
  totalEntries: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;
  currentData: TableRow[] = [];

  ngOnInit() {
    this.tableRowData.forEach(item => this.checkedItems[item.id] = false);
    this.updatePagination();
  }

  handlePageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  handleCheckboxChange(id: number) {
    this.checkedItems[id] = !this.checkedItems[id];
    this.isAllChecked = Object.values(this.checkedItems).every(checked => checked);
  }

  toggleAllCheckboxes() {
    this.isAllChecked = !this.isAllChecked;
    this.tableRowData.forEach(item => this.checkedItems[item.id] = this.isAllChecked);
  }

  getBadgeColor(status: string) {
    return status === 'Hired' ? 'success' : status === 'In Progress' ? 'warning' : 'error';
  }

  updatePagination() {
    this.totalEntries = this.tableRowData.length;
    this.totalPages = Math.ceil(this.totalEntries / this.rowsPerPage);
    this.startIndex = (this.currentPage - 1) * this.rowsPerPage;
    this.endIndex = Math.min(this.startIndex + this.rowsPerPage, this.totalEntries);
    this.currentData = this.tableRowData.slice(this.startIndex, this.endIndex);
  }
}
