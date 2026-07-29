import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CustomerPinPointMapComponent } from '../../../shared/components/maps/vector/customer-pin-point-map/customer-pin-point-map.component';
import { GlobalUserMapComponent } from '../../../shared/components/maps/vector/global-user-map/global-user-map.component';
import { TrafficAnalyticsMapComponent } from '../../../shared/components/maps/vector/traffic-analytics-map/traffic-analytics-map.component';

@Component({
  selector: 'app-vector-maps',
  imports: [
    PageBreadcrumbComponent,
    GlobalUserMapComponent,
    TrafficAnalyticsMapComponent,
    CustomerPinPointMapComponent
  ],
  templateUrl: './vector-maps.component.html',
})
export class VectorMapsComponent {

}
