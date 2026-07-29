import { Component } from '@angular/core';
import { LogisticsMetricsComponent } from '../../../shared/components/logistis/logistics-metrics/logistics-metrics.component';
import { DeliveryStatisticsChartComponent } from '../../../shared/components/logistis/delivery-statistics-chart/delivery-statistics-chart.component';
import { RevenueEarnedChartComponent } from '../../../shared/components/logistis/revenue-earned-chart/revenue-earned-chart.component';
import { DeliveryVehicleComponent } from '../../../shared/components/logistis/delivery-vehicle/delivery-vehicle.component';
import { TrackingDeliveryMapComponent } from '../../../shared/components/logistis/tracking-delivery-map/tracking-delivery-map.component';
import { TrackingProgressComponent } from '../../../shared/components/logistis/tracking-progress/tracking-progress.component';
import { DeliveryManComponent } from '../../../shared/components/logistis/delivery-man/delivery-man.component';
import { DeliveriesActivityTableComponent } from '../../../shared/components/logistis/deliveries-activity-table/deliveries-activity-table.component';

@Component({
  selector: 'app-logistics',
  imports: [
    LogisticsMetricsComponent,
    DeliveryStatisticsChartComponent,
    RevenueEarnedChartComponent,
    DeliveryVehicleComponent,
    TrackingDeliveryMapComponent,
    TrackingProgressComponent,
    DeliveryManComponent,
    DeliveriesActivityTableComponent,
  ],
  templateUrl: './logistics.component.html',
  styles: ``
})
export class LogisticsComponent {

}
