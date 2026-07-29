import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CreateInvoiceTableComponent } from '../../../shared/components/ecommerce/create-invoice/create-invoice-table/create-invoice-table.component';
import { InvoicePreviewModalComponent } from '../../../shared/components/ecommerce/create-invoice/invoice-preview-modal/invoice-preview-modal.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-create-invoice',
  imports: [
    PageBreadcrumbComponent,
    InputFieldComponent,
    LabelComponent,
    CreateInvoiceTableComponent,
    InvoicePreviewModalComponent,
    ButtonComponent,
  ],
  templateUrl: './create-invoice.component.html',
  styles: ``
})
export class CreateInvoiceComponent {

}
