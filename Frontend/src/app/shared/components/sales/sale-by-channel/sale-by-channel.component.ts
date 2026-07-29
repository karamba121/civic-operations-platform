import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  colors: string[];
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  legend: ApexLegend;
};

@Component({
  selector: 'app-sale-by-channel',
  imports: [CommonModule, DropdownComponent, DropdownItemComponent, NgApexchartsModule],
  templateUrl: './sale-by-channel.component.html',
  styleUrl: './sale-by-channel.component.css',
})
export class SaleByChannelComponent implements OnInit {

  openDropdown: string | null = null;
  public chartOptions!: Partial<ChartOptions>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initChart();
    }
  }

  toggleDropdown(key: string) {
    this.openDropdown = this.openDropdown === key ? null : key;
  }
  
  closeDropdown() {
    this.openDropdown = null;
  }

  initChart() {
    const darkCount = 14;
    const lightCount = 14;
    const grayCount = 14;

    const totalBars = darkCount + lightCount + grayCount;

    const colors = [
      ...Array(darkCount).fill("#465FFF"),
      ...Array(lightCount).fill("#36BFFA"),
      ...Array(grayCount).fill("#E4E7EC"),
    ];

    this.chartOptions = {
      series: [
        {
          name: "Sales",
          data: Array(totalBars).fill(100),
        },
      ],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 32,
        sparkline: { enabled: true },
        toolbar: { show: false },
        animations: { enabled: false },
      },

      plotOptions: {
        bar: {
          horizontal: false,
          distributed: true,
          columnWidth: "70%",
          borderRadius: 1,
          borderRadiusApplication: "around",
        },
      },

      colors: colors,

      dataLabels: { enabled: false },

      xaxis: {
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },

      yaxis: { show: false },

      grid: {
        show: false,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      },

      tooltip: { enabled: false },
      legend: { show: false },
    };
  }
}
