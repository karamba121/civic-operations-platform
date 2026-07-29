
import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexStroke,
  ApexTooltip,
  NgApexchartsModule
} from 'ng-apexcharts';

@Component({
  selector: 'app-churn-rate-chart',
  imports: [
    NgApexchartsModule
],
  templateUrl: './churn-rate-chart.component.html',
})
export class ChurnRateChartComponent {
  public churnSeries: ApexAxisChartSeries = [
    {
      name: "Churn Rate",
      data: [4.5, 4.2, 4.6, 4.3, 4.1, 4.2, 4.26],
    }
  ];

  public churnChart: ApexChart = {
    type: "area",
    height: 65,
    sparkline: { enabled: true },
    animations: { enabled: true, speed: 800 },
    toolbar: { show: false }
  };

  public churnColors: string[] = ["#ef4444"];
  public churnStroke: ApexStroke = {
    curve: "smooth",
    width: 2
  };
  public churnFill: ApexFill = {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.6,
      opacityTo: 0.1,
      stops: [0, 100]
    }
  };
  public churnTooltip: ApexTooltip = {
    fixed: { enabled: false },
    x: { show: false },
    y: {
      formatter: (value: number) => value.toFixed(2) + '%'
    },
    marker: { show: false }
  };
}