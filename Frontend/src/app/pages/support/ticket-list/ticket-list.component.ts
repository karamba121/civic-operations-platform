import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SupportMetricsComponent } from '../../../shared/components/support/support-metrics/support-metrics.component';
import { SupportListComponent } from '../../../shared/components/support/support-list/support-list.component';

@Component({
  selector: 'app-ticket-list',
  imports: [
    PageBreadcrumbComponent,
    SupportMetricsComponent,
    SupportListComponent,
  ],
  templateUrl: './ticket-list.component.html',
  styles: ``
})
export class TicketListComponent {

}
