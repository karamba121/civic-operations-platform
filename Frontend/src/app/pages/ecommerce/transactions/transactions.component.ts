import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { TransactionListComponent } from '../../../shared/components/ecommerce/transaction-list/transaction-list.component';

@Component({
  selector: 'app-transactions',
  imports: [
    PageBreadcrumbComponent,
    TransactionListComponent,
  ],
  templateUrl: './transactions.component.html',
  styles: ``
})
export class TransactionsComponent {

}
