
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
  selector: 'app-growth-chart',
  imports: [
    NgApexchartsModule
],
  templateUrl: './growth-chart.component.html',
})
export class GrowthChartComponent {
  public growthSeries: ApexAxisChartSeries = [
    {
      name: "Revenue",
      data: [12500, 14000, 15500, 14800, 16200, 17500, 18200],
    }
  ];

  public growthChart: ApexChart = {
    type: "area",
    height: 65,
    sparkline: { enabled: true },
    animations: { enabled: true, speed: 800 },
    toolbar: { show: false }
  };

  public growthColors: string[] = ["#10b981"];
  public growthStroke: ApexStroke = {
    curve: "smooth",
    width: 2
  };
  public growthFill: ApexFill = {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.6,
      opacityTo: 0.1,
      stops: [0, 100]
    }
  };
  public growthTooltip: ApexTooltip = {
    fixed: { enabled: false },
    x: { show: false },
    y: {
      formatter: (value: number) => "$" + value.toLocaleString()
    },
    marker: { show: false }
  };
}