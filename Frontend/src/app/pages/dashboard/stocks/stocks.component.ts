import { Component } from '@angular/core';
import { StockMetricsListComponent } from '../../../shared/components/stocks/stock-metrics-list/stock-metrics-list.component';
import { ProfilePerformanceComponent } from '../../../shared/components/stocks/profile-performance/profile-performance.component';
import { TrendingStocksComponent } from '../../../shared/components/stocks/trending-stocks/trending-stocks.component';
import { DividendChartComponent } from '../../../shared/components/stocks/dividend-chart/dividend-chart.component';
import { WatchListComponent } from '../../../shared/components/stocks/watch-list/watch-list.component';
import { LatestTransactionsComponent } from '../../../shared/components/stocks/latest-transactions/latest-transactions.component';

@Component({
  selector: 'app-stocks',
  imports: [
    StockMetricsListComponent,
    ProfilePerformanceComponent,
    TrendingStocksComponent,
    DividendChartComponent,
    WatchListComponent,
    LatestTransactionsComponent,
  ],
  templateUrl: './stocks.component.html',
  styles: ``
})
export class StocksComponent {

}
