import { Component } from '@angular/core';
import { RadialChartFourComponent } from '../../../shared/components/charts/radial/radial-chart-four/radial-chart-four.component';
import { RadialChartOneComponent } from '../../../shared/components/charts/radial/radial-chart-one/radial-chart-one.component';
import { RadialChartThreeComponent } from '../../../shared/components/charts/radial/radial-chart-three/radial-chart-three.component';
import { RadialChartTwoComponent } from '../../../shared/components/charts/radial/radial-chart-two/radial-chart-two.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-radial-chart',
  imports: [
    RadialChartOneComponent,
    RadialChartTwoComponent,
    RadialChartThreeComponent,
    RadialChartFourComponent,
    PageBreadcrumbComponent
  ],
  templateUrl: './radial-chart.component.html',
})
export class RadialChartComponent {

}
