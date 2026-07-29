
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination-with-text',
  imports: [],
  templateUrl: './pagination-with-text.component.html',
  styles: ``
})
export class PaginationWithTextComponent {

  @Input() totalPages!: number;
  @Input() initialPage = 1;
  @Output() pageChange = new EventEmitter<number>();

  currentPage = 1;

  ngOnInit() {
    this.currentPage = this.initialPage;
  }

  handlePageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.pageChange.emit(page);
  }

  renderPageNumbers(): (number | 'ellipsis')[] {
    const pageNumbers: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 7;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (this.currentPage > 3) pageNumbers.push('ellipsis');

      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);

      if (this.currentPage <= 3) end = 5;
      if (this.currentPage >= this.totalPages - 2) start = this.totalPages - 4;

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (this.currentPage < this.totalPages - 2) pageNumbers.push('ellipsis');
      pageNumbers.push(this.totalPages);
    }

    return pageNumbers;
  }
}
