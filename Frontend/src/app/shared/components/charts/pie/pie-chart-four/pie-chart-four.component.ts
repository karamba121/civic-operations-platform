import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ApexChart,
  ApexDataLabels,
  ApexStroke,
  NgApexchartsModule
} from 'ng-apexcharts';

@Component({
  selector: 'app-pie-chart-four',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './pie-chart-four.component.html',
  styles: [`
    ::ng-deep #chartThirtySix .apexcharts-tooltip {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
    }
  `]
})
export class PieChartFourComponent {
  public series: number[] = [28, 22, 18, 32];
  public labels: string[] = ['Image', 'Video', 'Audio', 'Documents'];
  public colors: string[] = ['#C2D6FF', '#9CB9FF', '#465FFF', '#2D3282'];

  public chart: ApexChart = {
    type: 'pie',
    height: 300,
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
  };

  public dataLabels: ApexDataLabels = {
    enabled: false,
  };

  public stroke: ApexStroke = {
    show: false,
    width: 0,
  };

  public legend: any = {
    show: true,
    position: 'bottom',
    horizontalAlign: 'center',
    markers: {
      shape: 'circle',
      size: 6,
      offsetX: -2,
      strokeWidth: 0,
    },
    itemMargin: {
      horizontal: 12,
      vertical: 0,
    },
    labels: {
      colors: '#344054',
    },
    fontSize: '14px',
    onItemHover: {
      highlightDataSeries: true,
    },
  };

  public tooltip: any = {
    enabled: true,
    custom: ({ series, seriesIndex, w }: any) => {
      const label = w.config.labels[seriesIndex];
      const value = series[seriesIndex];
      const color = w.config.colors[seriesIndex];
      return `<div class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800" style="font-family: Outfit, sans-serif; font-size: 13px;">
          <span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;"></span>
          <span class="text-gray-600 dark:text-gray-400">${label}:</span>
          <strong class="text-gray-900 dark:text-white">${value}%</strong>
        </div>`;
    },
  };

  public responsive: any[] = [
    {
      breakpoint: 480,
      options: {
        chart: {
          height: 260,
        },
      },
    },
  ];
}
