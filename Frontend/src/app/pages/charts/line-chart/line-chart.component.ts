
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { LineChartOneComponent } from '../../../shared/components/charts/line/line-chart-one/line-chart-one.component';
import { LineChartTwoComponent } from '../../../shared/components/charts/line/line-chart-two/line-chart-two.component';
import { LineChartThreeComponent } from '../../../shared/components/charts/line/line-chart-three/line-chart-three.component';


@Component({
  selector: 'app-line-chart',
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    LineChartOneComponent,
    LineChartTwoComponent,
    LineChartThreeComponent
],
  templateUrl: './line-chart.component.html',
  styles: ``
})
export class LineChartComponent {

}
