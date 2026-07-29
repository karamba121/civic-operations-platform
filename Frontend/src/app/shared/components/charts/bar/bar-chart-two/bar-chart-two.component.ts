import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexDataLabels,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  ApexGrid,
  ApexFill,
  ApexTooltip
} from 'ng-apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';


@Component({
  selector: 'app-bar-chart-two',
  imports: [
    NgApexchartsModule
],
  templateUrl: './bar-chart-two.component.html',
  styles: ``
})
export class BarChartTwoComponent {

   public series: ApexAxisChartSeries = [
    {
      name: 'Direct',
      data: [44, 55, 41, 67, 22, 43, 55, 41],
    },
    {
      name: 'Referral',
      data: [13, 23, 20, 8, 13, 27, 13, 23],
    },
    {
      name: 'Organic Search',
      data: [11, 17, 15, 15, 21, 14, 18, 20],
    },
    {
      name: 'Social',
      data: [21, 7, 25, 13, 22, 8, 18, 20],
    },
  ];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    stacked: true,
    height: 315,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  };

  public colors: string[] = ['#2a31d8', '#465fff', '#7592ff', '#c2d6ff'];

  public plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '39%',
      borderRadius: 10,
      borderRadiusApplication: 'end',
      borderRadiusWhenStacked: 'last'
    },
  };

  public dataLabels: ApexDataLabels = {
    enabled: false,
  };

  public xaxis: ApexXAxis = {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  };

  public yaxis: ApexYAxis = {
    title: {
      text: undefined,
    },
  };

  public legend: ApexLegend = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Outfit',
    fontSize: '14px',
    fontWeight: 400,
    markers: {
      // size: 5,
      shape: 'circle',
      strokeWidth: 0,
    },
    itemMargin: {
      horizontal: 10,
      vertical: 0,
    },
  };

  public grid: ApexGrid = {
    yaxis: {
      lines: {
        show: true,
      },
    },
  };

  public fill: ApexFill = {
    opacity: 1,
  };

  public tooltip: ApexTooltip = {
    x: {
      show: false,
    },
    y: {
      formatter: (val: number) => val.toString(),
    },
  };
}
