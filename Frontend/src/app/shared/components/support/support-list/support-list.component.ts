import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';

interface Ticket {
  id: string;
  name: string;
  email: string;
  subject: string;
  date: string;
  status: 'Solved' | 'Pending';
  statusClass: string;
}

interface FilterData {
  category: string;
  company: string;
}

@Component({
  selector: 'app-support-list',
  imports: [
    CommonModule,
    FormsModule,
    TableDropdownComponent,
  ],
  templateUrl: './support-list.component.html',
  styles: ``
})
export class SupportListComponent {

  tickets: Ticket[] = [
    {
      id: "#323534",
      name: "Lindsey Curtis",
      email: "demoemail@gmail.com",
      subject: "Issue with Dashboard Login Access",
      date: "12 Feb, 2027",
      status: "Solved",
      statusClass:
        "bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500",
    },
    {
      id: "#323535",
      name: "Kaiya George",
      email: "demoemail@gmail.com",
      subject: "Billing Information Not Updating Properly",
      date: "13 Mar, 2027",
      status: "Pending",
      statusClass:
        "bg-warning-50 dark:bg-warning-500/15 text-warning-600 dark:text-warning-500",
    },
    {
      id: "#323536",
      name: "Zain Geidt",
      email: "demoemail@gmail.com",
      subject: "Bug Found in Dark Mode Layout",
      date: "19 Mar, 2027",
      status: "Pending",
      statusClass:
        "bg-warning-50 dark:bg-warning-500/15 text-warning-600 dark:text-warning-500",
    },
    {
      id: "#323537",
      name: "Abram Schleifer",
      email: "demoemail@gmail.com",
      subject: "Request to Add New Integration Feature",
      date: "25 Apr, 2027",
      status: "Solved",
      statusClass:
        "bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500",
    },
    {
      id: "#323538",
      name: "Mia Chen",
      email: "mia.chen@email.com",
      subject: "Unable to Reset Password",
      date: "28 Apr, 2027",
      status: "Pending",
      statusClass:
        "bg-warning-50 dark:bg-warning-500/15 text-warning-600 dark:text-warning-500",
    },
    {
      id: "#323539",
      name: "John Doe",
      email: "john.doe@email.com",
      subject: "Feature Request: Dark Mode",
      date: "30 Apr, 2027",
      status: "Solved",
      statusClass:
        "bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500",
    },
    {
      id: "#323540",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      subject: "Error 500 on Dashboard",
      date: "01 May, 2027",
      status: "Pending",
      statusClass:
        "bg-warning-50 dark:bg-warning-500/15 text-warning-600 dark:text-warning-500",
    },
    {
      id: "#323541",
      name: "Carlos Ruiz",
      email: "carlos.ruiz@email.com",
      subject: "Cannot Download Invoice",
      date: "02 May, 2027",
      status: "Solved",
      statusClass:
        "bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500",
    },
    {
      id: "#323542",
      name: "Emily Clark",
      email: "emily.clark@email.com",
      subject: "UI Bug in Mobile View",
      date: "03 May, 2027",
      status: "Pending",
      statusClass:
        "bg-warning-50 dark:bg-warning-500/15 text-warning-600 dark:text-warning-500",
    },
    {
      id: "#323543",
      name: "Liam Wong",
      email: "liam.wong@email.com",
      subject: "Account Locked",
      date: "04 May, 2027",
      status: "Solved",
      statusClass:
        "bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500",
    },
    {
      id: "#323544",
      name: "Sophia Patel",
      email: "sophia.patel@email.com",
      subject: "Integration Not Working",
      date: "05 May, 2027",
      status: "Pending",
      statusClass:
        "bg-warning-50 dark:bg-warning-500/15 text-warning-600 dark:text-warning-500",
    },
    {
      id: "#323545",
      name: "Noah Kim",
      email: "noah.kim@email.com",
      subject: "Request for API Access",
      date: "06 May, 2027",
      status: "Solved",
      statusClass:
        "bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500",
    },
  ]

  selectedStatus: string = 'All';
  searchQuery: string = '';
  filterData: FilterData = { category: '', company: '' };
  showFilter: boolean = false;
  currentPage: number = 1;
  perPage: number = 10;
  sortBy: string = '';
  sortAsc: boolean = true;
  selectAll: boolean = false;
  selected: string[] = [];

  get filteredTickets(): Ticket[] {
    return this.tickets
      .filter(
        (ticket) => this.selectedStatus === 'All' || ticket.status === this.selectedStatus
      )
      .filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          ticket.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          ticket.email.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
      .filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(this.filterData.category.toLowerCase()) &&
          ticket.email.toLowerCase().includes(this.filterData.company.toLowerCase())
      );
  }

  get sortedTickets(): Ticket[] {
    const sorted = [...this.filteredTickets];
    if (this.sortBy) {
      sorted.sort((a, b) => {
        let valA: any = a[this.sortBy as keyof Ticket];
        let valB: any = b[this.sortBy as keyof Ticket];
        if (this.sortBy === 'date') {
          const parse = (v: string) =>
            new Date(v.replace(/(\d{2}) (\w+), (\d{4})/, '$2 $1, $3'));
          valA = parse(valA as string);
          valB = parse(valB as string);
        } else {
          valA = (valA as string).toLowerCase();
          valB = (valB as string).toLowerCase();
        }
        if (valA < valB) return this.sortAsc ? -1 : 1;
        if (valA > valB) return this.sortAsc ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }

  get totalPages(): number {
    return Math.ceil(this.sortedTickets.length / this.perPage);
  }

  get paginatedTickets(): Ticket[] {
    return this.sortedTickets.slice(
      (this.currentPage - 1) * this.perPage,
      this.currentPage * this.perPage
    );
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get endEntry(): number {
    return Math.min(this.currentPage * this.perPage, this.sortedTickets.length);
  }

  handleSort(field: string): void {
    if (this.sortBy === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortBy = field;
      this.sortAsc = true;
    }
  }

  handlePrevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  handleNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  handleGoToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  handleToggleAll(): void {
    if (this.selectAll) {
      this.selected = [];
    } else {
      this.selected = this.paginatedTickets.map((ticket) => ticket.id);
    }
    this.selectAll = !this.selectAll;
  }

  handleToggleOne(id: string): void {
    if (this.selected.includes(id)) {
      this.selected = this.selected.filter((i) => i !== id);
    } else {
      this.selected = [...this.selected, id];
    }
    this.selectAll = this.selected.length === this.paginatedTickets.length;
  }

  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page on search
  }

  handleViewMore(): void {
    // Logic for view more
  }

  handleDelete(): void {
    // Logic for delete
  }

  handleStatusChange (status: string): void {
    this.selectedStatus = status;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as Element;
    if (
      this.showFilter &&
      target.closest &&
      !target.closest('.filter-dropdown')
    ) {
      this.showFilter = false;
    }
  }
}
