
import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexStroke,
  ApexLegend,
  ApexYAxis,
  ApexGrid,
  ApexFill,
  ApexTooltip,
  NgApexchartsModule
} from 'ng-apexcharts';
import { ChartTabComponent } from '../../common/chart-tab/chart-tab.component';

@Component({
  selector: 'app-analytics-bar-chart',
  imports: [ChartTabComponent, NgApexchartsModule],
  templateUrl: './analytics-bar-chart.component.html'
})
export class AnalyticsBarChartComponent {
  public series: ApexAxisChartSeries = [
    {
      name: 'Sales',
      data: [
        168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112, 123, 212,
        270, 190, 310, 115, 90, 380, 112, 223, 292, 170, 290, 110, 115, 290,
        380, 312,
      ],
    },
  ];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    height: 350,
    toolbar: { show: false }
  };

  public colors: string[] = ['#465fff'];

  public plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '45%',
      borderRadius: 5,
      borderRadiusApplication: 'end',
    }
  };

  public dataLabels: ApexDataLabels = { enabled: false };

  public stroke: ApexStroke = {
    show: true,
    width: 4,
    colors: ['transparent'],
  };

  public xaxis: ApexXAxis = {
    categories: Array.from({ length: 30 }, (_, i) => (i + 1).toString()),
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  public legend: ApexLegend = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Outfit',
  };

  public grid: ApexGrid = {
    yaxis: { lines: { show: true } }
  };

  public fill: ApexFill = { opacity: 1 };

  public tooltip: ApexTooltip = {
    x: { show: false },
    y: { formatter: (val: number) => `${val}` }
  };
}