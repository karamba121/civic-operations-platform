import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { InvoiceMainComponent } from '../../../shared/components/invoice/invoice-main/invoice-main.component';

@Component({
  selector: 'app-single-invoice',
  imports: [
    PageBreadcrumbComponent,
    InvoiceMainComponent
  ],
  templateUrl: './single-invoice.component.html',
  styles: ``
})
export class SingleInvoiceComponent {

}
