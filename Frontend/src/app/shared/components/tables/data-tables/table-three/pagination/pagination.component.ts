import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center">
      <!-- Previous Button -->
      <button
        (click)="onPageChange.emit(currentPage - 1)"
        [disabled]="currentPage === 1"
        class="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm"
      >
        Previous
      </button>

      <!-- Page Numbers -->
      <div class="flex items-center gap-2">
        @if (currentPage > 3) {
        <span class="px-2">...</span>
        }
        @for (page of pagesAroundCurrent; track $index) {
        <button
          (click)="onPageChange.emit(page)"
          class="px-4 py-2 rounded flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500"
          [ngClass]="{
            'bg-brand-500 text-white': currentPage === page,
            'text-gray-700 dark:text-gray-400': currentPage !== page
          }"
        >
          {{ page }}
        </button>
        }
        @if (currentPage < totalPages - 2) {  
        <span class="px-2">...</span>
        }
      </div>

      <!-- Next Button -->
      <button
        (click)="onPageChange.emit(currentPage + 1)"
        [disabled]="currentPage === totalPages"
        class="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        Next
      </button>
    </div>
  `,
  styles: ``
})
export class PaginationComponent {

  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() onPageChange = new EventEmitter<number>();

  get pagesAroundCurrent(): number[] {
    return Array.from(
      { length: Math.min(3, this.totalPages) },
      (_, i) => i + Math.max(this.currentPage - 1, 1)
    );
  }
}
