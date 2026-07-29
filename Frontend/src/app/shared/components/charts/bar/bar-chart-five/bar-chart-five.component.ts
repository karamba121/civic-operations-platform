import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule
} from 'ng-apexcharts';

@Component({
  selector: 'app-bar-chart-five',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './bar-chart-five.component.html',
})
export class BarChartFiveComponent {
  public series: ApexAxisChartSeries = [
    {
      name: '2023',
      data: [80, 60, 70, 40, 65, 45, 48, 55, 58, 50, 67, 75],
    },
    {
      name: '2024',
      data: [90, 50, 65, 25, 78, 68, 75, 90, 30, 70, 90, 95],
    },
  ];

  public chart: ApexChart = {
    type: 'bar',
    height: 300,
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
  };

  public plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '50%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
    },
  };

  public dataLabels: ApexDataLabels = {
    enabled: false,
  };

  public stroke: ApexStroke = {
    show: true,
    width: 4,
    colors: ['transparent'],
  };

  public colors: string[] = ['#C2D6FF', '#465FFF'];

  public xaxis: ApexXAxis = {
    categories: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    axisTicks: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
  };

  public yaxis: ApexYAxis = {
    labels: {
      formatter: (val: number) => `${val}%`,
      style: {
        fontSize: '12px',
        colors: '#344054',
      },
    },
    max: 100,
  };

  public fill: ApexFill = {
    opacity: 1,
  };

  public tooltip: ApexTooltip = {
    y: {
      formatter: (val: number) => `${val}%`,
    },
  };

  public legend: ApexLegend = {
    show: false,
  };

  public grid: ApexGrid = {
    borderColor: '#F2F4F7',
    strokeDashArray: 0,
  };
}
