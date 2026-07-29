import { Component } from '@angular/core';
import { CashflowOverviewComponent } from '../../../shared/components/finance/cashflow-overview/cashflow-overview.component';
import { FinanceStatsComponent } from '../../../shared/components/finance/finance-stats/finance-stats.component';
import { FinanceTransactionTableComponent } from '../../../shared/components/finance/finance-transaction-table/finance-transaction-table.component';
import { MyCardsComponent } from '../../../shared/components/finance/my-cards/my-cards.component';
import { QuickSendComponent } from '../../../shared/components/finance/quick-send/quick-send.component';
import { SpendingWidgetComponent } from '../../../shared/components/finance/spending-widget/spending-widget.component';
import { TotalBalanceOverviewComponent } from '../../../shared/components/finance/total-balance-overview/total-balance-overview.component';

@Component({
  selector: 'app-finance',
  imports: [
    TotalBalanceOverviewComponent,
    FinanceStatsComponent,
    CashflowOverviewComponent,
    SpendingWidgetComponent,
    QuickSendComponent,
    MyCardsComponent,
    FinanceTransactionTableComponent
  ],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.css',
})
export class FinanceComponent {

}
