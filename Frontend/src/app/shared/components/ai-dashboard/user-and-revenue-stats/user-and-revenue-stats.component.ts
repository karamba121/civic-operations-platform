import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

type RangeOption = 'monthly' | 'quarterly' | 'annually';

@Component({
  selector: 'app-user-and-revenue-stats',
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  templateUrl: './user-and-revenue-stats.component.html',
  styleUrl: './user-and-revenue-stats.component.css',
})


export class UserAndRevenueStatsComponent {
  selectedRange: RangeOption = 'monthly';
  openDropdown: string | null = null;

  constructor() {
    this.applyRange(this.selectedRange);
  }
  
  toggleDropdown(key: string) {
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  closeDropdown() {
    this.openDropdown = null;
  }

  setRange(range: RangeOption) {
    this.selectedRange = range;
    this.applyRange(range);
  }

  private applyRange(range: RangeOption) {
 
  }

  getRangeButtonClass(range: RangeOption) {
    return this.selectedRange === range
      ? 'shadow-theme-xs bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
      : 'text-gray-500 dark:text-gray-400';
  }

  public series: ApexAxisChartSeries = [
    {
      name: 'Users',
      data: [
        23000, 24500, 22500, 24800, 23200, 25240, 24600, 27000, 25800, 28500,
        27200, 31000,
      ],
    },
    {
      name: 'Revenue',
      data: [
        13000, 14300, 12600, 14800, 13400, 15500, 14700, 17000, 16000, 18500,
        17200, 20000,
      ],
    },
  ];

  public legend: ApexLegend = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    markers: {
      strokeWidth: 0,
    },
    itemMargin: {
      horizontal: 10,
      vertical: 5,
    },
  };

  public colors: string[] = ['#465FFF', '#9CB9FF'];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    height: 440,
    type: 'area',
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  };

  public fill: ApexFill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0,
      stops: [0, 100],
    },
  };

  public stroke: ApexStroke = {
    curve: 'straight',
    width: [2, 2],
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
      format: 'MMM dd, yyyy',
    },
    y: [
      {
        formatter: (val: number) => val.toLocaleString(),
      },
      {
        formatter: (val: number) => '$' + (val / 1000).toFixed(2) + 'K',
      },
    ],
    marker: {
      show: true,
    },
  };

  public xaxis: ApexXAxis = {
    type: 'category',
    categories: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
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
    min: 0,
    max: 35000,
    tickAmount: 7,
    labels: {
      formatter: (val: number) => {
        if (val === 0) return '0';
        return (val / 1000).toFixed(0) + 'K';
      },
    },
    title: {
      style: {
        fontSize: '0px',
      },
    },
  };
}
