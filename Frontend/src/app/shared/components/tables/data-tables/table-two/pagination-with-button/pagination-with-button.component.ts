import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination-button',
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center gap-4 xl:justify-start">
      <!-- Previous Button -->
      <button
        (click)="handlePageChange(currentPage - 1)"
        [disabled]="currentPage === 1"
        class="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <!-- Page Numbers -->
      <ul class="flex items-center gap-1">
        @if (startPage > 1) {
        <li class="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 dark:text-gray-400">...</li>
        }
        @for (page of pages; track $index) {
        <li>
          <button
            (click)="handlePageChange(page)"
            class="px-4 py-2 flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500"
            [ngClass]="{
              'bg-brand-500 text-white': currentPage === page,
              'text-gray-700 dark:text-gray-400': currentPage !== page
            }"
          >
            {{ page }}
          </button>
        </li>
        }
        @if (endPage < totalPages) {  
        <li class="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 dark:text-gray-400">...</li>
        }
      </ul>

      <!-- Next Button -->
      <button
        (click)="handlePageChange(currentPage + 1)"
        [disabled]="currentPage === totalPages"
        class="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]
})
export class PaginationButtonComponent {
  @Input() totalPages: number = 1;
  @Input() initialPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  currentPage: number = this.initialPage;
  pages: number[] = [];
  startPage: number = 1;
  endPage: number = 1;

  ngOnInit() {
    this.currentPage = this.initialPage;
    this.updatePages();
  }

  ngOnChanges() {
    this.updatePages();
  }

  handlePageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePages();
    this.pageChange.emit(page);
  }

  private updatePages() {
    const pagesToShow = 5;
    this.startPage = Math.max(1, this.currentPage - Math.floor(pagesToShow / 2));
    this.endPage = Math.min(this.totalPages, this.startPage + pagesToShow - 1);
    
    this.pages = [];
    for (let i = this.startPage; i <= this.endPage; i++) {
      this.pages.push(i);
    }
  }
}