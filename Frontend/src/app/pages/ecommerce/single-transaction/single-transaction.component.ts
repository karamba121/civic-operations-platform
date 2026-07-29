import { Component } from '@angular/core';
import { TransactionHeaderComponent } from '../../../shared/components/transactions/transaction-header/transaction-header.component';
import { CustomerDetailsComponent } from '../../../shared/components/transactions/customer-details/customer-details.component';
import { OrderHistoryComponent } from '../../../shared/components/transactions/order-history/order-history.component';
import { OrderDetailsTableComponent } from '../../../shared/components/transactions/order-details-table/order-details-table.component';
import { PageBreadcrumbComponent } from "../../../shared/components/common/page-breadcrumb/page-breadcrumb.component";

@Component({
  selector: 'app-single-transaction',
  imports: [
    TransactionHeaderComponent,
    CustomerDetailsComponent,
    OrderHistoryComponent,
    OrderDetailsTableComponent,
    PageBreadcrumbComponent
],
  templateUrl: './single-transaction.component.html',
  styles: ``
})
export class SingleTransactionComponent {

}
