
import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexStroke,
  ApexMarkers,
  ApexGrid,
  ApexDataLabels,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  ApexResponsive,
  NgApexchartsModule
} from 'ng-apexcharts';
import { ChartTabComponent } from '../../common/chart-tab/chart-tab.component';

@Component({
  selector: 'app-crm-statistics-chart',
  imports: [NgApexchartsModule, ChartTabComponent],
  templateUrl: './crm-statistics-chart.component.html'
})
export class CrmStatisticsChartComponent {
  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    height: 220,
    type: 'area',
    toolbar: { show: false }
  };

  public legend: ApexLegend = {
    show: false,
    position: 'top',
    horizontalAlign: 'left'
  };

  public colors: string[] = ['#465FFF', '#9CB9FF'];

  public fill: ApexFill = {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0
    }
  };

  public responsive: ApexResponsive[] = [
    {
      breakpoint: 480,
      options: { chart: { height: 220 } }
    },
    {
      breakpoint: 1600,
      options: { chart: { height: 220 } }
    },
    {
      breakpoint: 2600,
      options: { chart: { height: 250 } }
    }
  ];

  public stroke: ApexStroke = {
    curve: 'straight',
    width: [2, 2]
  };

  public markers: ApexMarkers = { size: 0 };

  public grid: ApexGrid = {
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } }
  };

  public dataLabels: ApexDataLabels = { enabled: false };

  public tooltip: ApexTooltip = {
    x: { format: 'dd MMM yyyy' }
  };

  public xaxis: ApexXAxis = {
    type: 'category',
    categories: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false }
  };

  public yaxis: ApexYAxis = {
    title: { text: undefined }
  };

  public series: ApexAxisChartSeries = [
    {
      name: 'Sales',
      data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235]
    },
    {
      name: 'Revenue',
      data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140]
    }
  ];
}