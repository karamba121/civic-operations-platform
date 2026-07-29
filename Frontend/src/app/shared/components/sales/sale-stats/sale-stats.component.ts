import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DatePickerTwoComponent } from '../../form/date-picker-two/date-picker-two.component';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexFill,
  ApexGrid,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
  ApexYAxis,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  fill: ApexFill;
  grid: ApexGrid;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  yaxis: ApexYAxis;
  colors: string[];
};

export interface StatCard {
  title: string;
  value: string;
  change: string;
  iconPath: string;
  iconColor: string;
  iconPath2?: string;
  chartOptions: ChartOptions;
}

@Component({
  selector: 'app-sale-stats',
  imports: [CommonModule, NgApexchartsModule, DatePickerTwoComponent],
  templateUrl: './sale-stats.component.html',
  styleUrl: './sale-stats.component.css',
})
export class SaleStatsComponent {
  private readonly seriesData = [300, 350, 310, 370, 248, 187, 295, 191, 269, 201, 185, 252, 151];
  private readonly categories = [
    '2018-09-19T00:00:00.000Z', '2018-09-19T01:30:00.000Z', '2018-09-19T02:30:00.000Z',
    '2018-09-19T03:30:00.000Z', '2018-09-19T04:30:00.000Z', '2018-09-19T05:30:00.000Z',
    '2018-09-19T06:30:00.000Z', '2018-09-19T07:30:00.000Z', '2018-09-19T08:30:00.000Z',
    '2018-09-19T09:30:00.000Z', '2018-09-19T10:30:00.000Z', '2018-09-19T11:30:00.000Z',
    '2018-09-19T12:30:00.000Z',
  ];

  private getChartOptions(color: string): ChartOptions {
    return {
      series: [{ name: 'New Sales', data: this.seriesData }],
      colors: [color],
      chart: {
        fontFamily: 'Outfit, sans-serif',
        height: 70,
        type: 'area',
        parentHeightOffset: 0,
        toolbar: { show: false },
      },
      grid: { show: false },
      fill: {
        type: 'gradient',
        gradient: { enabled: true, opacityFrom: 0.55, opacityTo: 0 },
      } as ApexFill,
      legend: { show: false },
      tooltip: { enabled: false },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 1 },
      xaxis: {
        type: 'datetime',
        categories: this.categories,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
      },
      yaxis: { labels: { show: false } },
    };
  }

  stats: StatCard[] = [
    {
      title: 'Total Revenue',
      value: '$10,590',
      change: '32%',
      iconColor: '#12B76A',
      iconPath: 'M15.484 7.72335C15.484 6.28004 14.314 5.11 12.8707 5.11H11.8138C9.99228 5.11 8.51562 6.58666 8.51562 8.4082C8.51562 9.783 9.36841 11.0136 10.6557 11.4964L13.344 12.5046C14.6312 12.9873 15.484 14.2179 15.484 15.5927C15.484 17.4143 14.0074 18.8909 12.1858 18.8909H11.129C9.68566 18.8909 8.51562 17.7209 8.51562 16.2776M11.9996 19.2831L11.9996 21.2085M11.9996 2.79199L11.9996 4.71734',
      chartOptions: this.getChartOptions('#12B76A'),
    },
    {
      title: 'Total Sales',
      value: '1,320',
      change: '32%',
      iconColor: '#7A5AF8',
      iconPath: 'M4.25 8L2 8M3.5 12H2M2.75 16H2M7.91619 19.1243H19.1489C19.9166 19.1243 20.5603 18.5448 20.6407 17.7814L21.8249 6.53203C21.9181 5.64637 21.2237 4.875 20.3331 4.875H9.10039C8.33275 4.875 7.68899 5.45455 7.60863 6.21796L6.42443 17.4673C6.3312 18.3529 7.02564 19.1243 7.91619 19.1243ZM13.5391 4.875H16.2108L15.4608 9.86401H12.7891L13.5391 4.875Z',
      chartOptions: this.getChartOptions('#7C3AED'),
    },
    {
      title: 'Conversion Rate',
      value: '4.38%',
      change: '32%',
      iconColor: '#0BA5EC',
      iconPath: 'M18.752 7.37695H5.25196M15.3773 4.00098L18.75 7.37587L15.3773 10.751M5.25 16.625H18.75M8.62471 20.001L5.25196 16.6261L8.62471 13.251',
      chartOptions: this.getChartOptions('#38BDF8'),
    },
    {
      title: 'Refund Rate',
      value: '1.2%',
      change: '32%',
      iconColor: '#F04438',
      iconPath: 'M20.6389 10.8655V8.16168C20.6389 7.3664 19.9942 6.72168 19.1989 6.72168H4.31891C3.52361 6.72168 2.87891 7.3664 2.87891 8.16168V16.3217C2.87891 17.117 3.52361 17.7617 4.31891 17.7617H8.96575M12.7199 10.2372C12.429 10.0976 12.1032 10.0193 11.759 10.0193C10.5315 10.0193 9.53656 11.0144 9.53656 12.2417C9.53656 12.587 9.61532 12.914 9.75587 13.2056M11.7589 15.1717H18.1689C19.5331 15.1717 20.6389 16.2776 20.6389 17.6417C20.6389 19.0058 19.5331 20.1116 18.1689 20.1116H14.2357M11.7589 15.1717L13.6777 13.2517M11.7589 15.1717L13.6777 17.0917',
      iconPath2: 'M6.20312 12.2422H6.21312',
      chartOptions: this.getChartOptions('#F04438'),
    },
  ];
}
