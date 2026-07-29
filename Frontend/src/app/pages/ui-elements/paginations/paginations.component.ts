import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { PaginationWithTextComponent } from '../../../shared/components/ui/pagination/pagination-with-text/pagination-with-text.component';
import { PaginationWithIconComponent } from '../../../shared/components/ui/pagination/pagination-with-icon/pagination-with-icon.component';
import { PaginationWithTextAndIconComponent } from '../../../shared/components/ui/pagination/pagination-with-text-and-icon/pagination-with-text-and-icon.component';

@Component({
  selector: 'app-paginations',
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    PaginationWithTextComponent,
    PaginationWithIconComponent,
    PaginationWithTextAndIconComponent,
  ],
  templateUrl: './paginations.component.html',
  styles: ``
})
export class PaginationsComponent {

  handlePageChange(page: number) {
    console.log(`Page changed to ${page}`);
    // Here you would typically fetch data for the new page
  }
}
