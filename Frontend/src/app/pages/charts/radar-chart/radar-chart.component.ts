import { Component } from '@angular/core';
import { RadarChartOneComponent } from '../../../shared/components/charts/radar/radar-chart-one/radar-chart-one.component';
import { RadarChartThreeComponent } from '../../../shared/components/charts/radar/radar-chart-three/radar-chart-three.component';
import { RadarChartTwoComponent } from '../../../shared/components/charts/radar/radar-chart-two/radar-chart-two.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-radar-chart',
  imports: [
    RadarChartOneComponent,
    RadarChartTwoComponent,
    RadarChartThreeComponent,
    PageBreadcrumbComponent
  ],
  templateUrl: './radar-chart.component.html',
})
export class RadarChartComponent {

}
