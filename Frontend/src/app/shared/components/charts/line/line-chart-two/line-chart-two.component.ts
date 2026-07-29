import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexStroke,
  ApexFill,
  ApexMarkers,
  ApexGrid,
  ApexDataLabels,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexLegend
} from 'ng-apexcharts';

import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-line-chart-two',
  imports: [
    NgApexchartsModule
],
  templateUrl: './line-chart-two.component.html',
  styles: ``
})
export class LineChartTwoComponent {

  public series: ApexAxisChartSeries = [
    {
      name: 'Sales',
      data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
    },
    {
      name: 'Revenue',
      data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
    },
  ];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    height: 310,
    type: 'area',
    toolbar: {
      show: false,
    },
  };

  public colors: string[] = ['#465FFF', '#9CB9FF'];

  public stroke: ApexStroke = {
    curve: 'smooth',
    width: [2, 2],
  };

  public fill: ApexFill = {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0,
    },
  };

  public markers: ApexMarkers = {
    size: 0,
  };

  public grid: ApexGrid = {
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  };

  public dataLabels: ApexDataLabels = {
    enabled: false,
  };

  public tooltip: ApexTooltip = {
    x: {
      format: 'dd MMM yyyy',
    },
  };

  public xaxis: ApexXAxis = {
    type: 'category',
    categories: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  };

  public yaxis: ApexYAxis = {
    title: {
      text: '',
      style: {
        fontSize: '0px',
      },
    },
  };

  public legend: ApexLegend = {
    show: false,
    position: 'top',
    horizontalAlign: 'left',
  };
}
