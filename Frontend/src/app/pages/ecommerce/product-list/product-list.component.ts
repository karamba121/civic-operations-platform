import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ProductListTableComponent } from '../../../shared/components/ecommerce/product-list-table/product-list-table.component';

@Component({
  selector: 'app-product-list',
  imports: [
    PageBreadcrumbComponent,
    ProductListTableComponent,
  ],
  templateUrl: './product-list.component.html',
  styles: ``
})
export class ProductListComponent {

}
