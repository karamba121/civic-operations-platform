import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { AddProductFormComponent } from '../../../shared/components/ecommerce/add-product-form/add-product-form.component';

@Component({
  selector: 'app-add-product',
  imports: [
    PageBreadcrumbComponent,
    AddProductFormComponent,
  ],
  templateUrl: './add-product.component.html',
  styles: ``
})
export class AddProductComponent {

}
