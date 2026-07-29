import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule} from 'ng-apexcharts';
import { DropdownComponent } from '../../../shared/components/ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../shared/components/ui/dropdown/dropdown-item/dropdown-item.component';
import { AiStatsComponent } from '../../../shared/components/ai-dashboard/ai-stats/ai-stats.component';
import { ApiTokenUsageComponent } from '../../../shared/components/ai-dashboard/api-token-usage/api-token-usage.component';
import { UserAndRevenueStatsComponent } from '../../../shared/components/ai-dashboard/user-and-revenue-stats/user-and-revenue-stats.component';
import { RecentTransactionsComponent } from '../../../shared/components/ai-dashboard/recent-transactions/recent-transactions.component';
import { UserProjectAnalyticsComponent } from '../../../shared/components/ai-dashboard/user-project-analytics/user-project-analytics.component';


@Component({
  selector: 'app-ai',
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    AiStatsComponent,
    ApiTokenUsageComponent,
    UserAndRevenueStatsComponent,
    RecentTransactionsComponent,
    UserProjectAnalyticsComponent,
  ],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.css',
})
export class AiComponent {

 
}
