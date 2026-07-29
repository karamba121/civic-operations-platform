import { Component } from '@angular/core';
import { RevenueStatisticsComponent } from '../../../shared/components/sales/revenue-statistics/revenue-statistics.component';
import { SaleByChannelComponent } from '../../../shared/components/sales/sale-by-channel/sale-by-channel.component';
import { SaleByCountryComponent } from '../../../shared/components/sales/sale-by-country/sale-by-country.component';
import { SaleStatsComponent } from '../../../shared/components/sales/sale-stats/sale-stats.component';
import { TopProductTableComponent } from '../../../shared/components/sales/top-product-table/top-product-table.component';
import { UserRetentionComponent } from '../../../shared/components/sales/user-retention/user-retention.component';

@Component({
  selector: 'app-sales',
  imports: [
    SaleStatsComponent,
    RevenueStatisticsComponent,
    UserRetentionComponent,
    SaleByChannelComponent,
    SaleByCountryComponent,
    TopProductTableComponent
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
})
export class SalesComponent {

}
