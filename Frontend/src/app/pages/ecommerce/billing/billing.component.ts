import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BillingInfoComponent } from '../../../shared/components/ecommerce/billing/billing-info/billing-info.component';
import { BillingPlanComponent } from '../../../shared/components/ecommerce/billing/billing-plan/billing-plan.component';
import { BillingInvoiceTableComponent } from '../../../shared/components/ecommerce/billing/billing-invoice-table/billing-invoice-table.component';
import { PaymentMethodComponent } from '../../../shared/components/ecommerce/billing/payment-method/payment-method.component';

@Component({
  selector: 'app-billing',
  imports: [
    PageBreadcrumbComponent,
    BillingInfoComponent,
    BillingPlanComponent,
    BillingInvoiceTableComponent,
    PaymentMethodComponent
  ],
  templateUrl: './billing.component.html',
  styles: ``
})
export class BillingComponent {

}
