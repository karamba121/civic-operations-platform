import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  ApexGrid,
  ApexFill,
  ApexTooltip,
  NgApexchartsModule
} from 'ng-apexcharts';

@Component({
  selector: 'app-bar-chart-six',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './bar-chart-six.component.html',
})
export class BarChartSixComponent {
  public series: ApexAxisChartSeries = [
    {
      name: 'Category A',
      data: [620, 500, 480, 615, 620],
    },
    {
      name: 'Category B',
      data: [350, 505, 395, 205, 350],
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
      horizontal: true,
      barHeight: '40%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
      dataLabels: {
        position: 'top',
      },
    },
  };

  public dataLabels: ApexDataLabels = {
    enabled: false,
  };

  public colors: string[] = ['#465FFF', '#E4E7EC'];

  public xaxis: ApexXAxis = {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    min: 0,
    max: 700,
    tickAmount: 7,
    labels: {
      style: {
        fontSize: '12px',
        colors: '#667085',
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  };

  public yaxis: ApexYAxis = {
    labels: {
      style: {
        fontSize: '12px',
        colors: '#344054',
      },
    },
  };

  public legend: any = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    markers: {
      shape: 'circle',
      size: 6,
    },
    itemMargin: {
      horizontal: 12,
    },
    labels: {
      colors: '#344054',
    },
  };

  public grid: ApexGrid = {
    borderColor: '#F2F4F7',
    strokeDashArray: 0,
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: false,
      },
    },
  };

  public fill: ApexFill = {
    opacity: 1,
  };

  public tooltip: ApexTooltip = {
    x: {
      show: true,
    },
  };
}
