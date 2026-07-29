import { Component, Input } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  NgApexchartsModule
} from 'ng-apexcharts';


@Component({
  selector: 'app-storage-details-chart',
  imports: [
    NgApexchartsModule
],
  templateUrl: './storage-details-chart.component.html',
  styles: ``
})
export class StorageDetailsChartComponent {

  public isDarkMode = true;

  public series: number[] = [45, 65, 25, 25];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'donut',
    width: 400
  };

  public colors: string[] = ['#9b8afb', '#fd853a', '#fdb022', '#32d583'];

  public labels: string[] = ['Downloads', 'Apps', 'Documents', 'Media'];

  public stroke: ApexStroke = {
    show: false,
    width: 4,
    colors: ['transparent']
  };

  public plotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '65%',
        background: 'transparent',
        labels: {
          show: true,
          name: {
            show: true,
            offsetY: -10,
            color: this.isDarkMode ? '#ffffff' : '#1D2939',
            fontSize: '14px',
            fontWeight: '500'
          },
          value: {
            show: true,
            offsetY: 0,
            color: this.isDarkMode ? '#D1D5DB' : '#667085',
            fontSize: '16px',
            fontWeight: '400',
            formatter: () => 'Used of 135 GB'
          },
          total: {
            show: true,
            label: 'Total 160 GB',
            color: this.isDarkMode ? '#ffffff' : '#000000',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }
      },
      expandOnClick: false
    }
  };

  public dataLabels: ApexDataLabels = {
    enabled: false
  };

  public tooltip: ApexTooltip = {
    enabled: false
  };

  public legend: ApexLegend = {
    show: true,
    position: 'bottom',
    horizontalAlign: 'left',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    markers: {
      // width: 6,
      // height: 6,
      // radius: 12,
      strokeWidth: 0
    },
    itemMargin: {
      horizontal: 10,
      vertical: 6
    }
  };

  public responsive: ApexResponsive[] = [
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 320
        },
        legend: {
          itemMargin: {
            horizontal: 7,
            vertical: 5
          },
          fontSize: '12px'
        }
      }
    }
  ];
}
