import { Component } from '@angular/core';
import { PieChartFiveComponent } from '../../../shared/components/charts/pie/pie-chart-five/pie-chart-five.component';
import { PieChartFourComponent } from '../../../shared/components/charts/pie/pie-chart-four/pie-chart-four.component';
import { PieChartOneComponent } from '../../../shared/components/charts/pie/pie-chart-one/pie-chart-one.component';
import { PieChartThreeComponent } from '../../../shared/components/charts/pie/pie-chart-three/pie-chart-three.component';
import { PieChartTwoComponent } from '../../../shared/components/charts/pie/pie-chart-two/pie-chart-two.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';


@Component({
  selector: 'app-pie-chart',
  imports: [
    PieChartOneComponent,
    PageBreadcrumbComponent,
    PieChartTwoComponent,
    PieChartThreeComponent,
    PieChartFourComponent,
    PieChartFiveComponent
  ],
  templateUrl: './pie-chart.component.html',
  styles: ``
})
export class PieChartComponent {

}
