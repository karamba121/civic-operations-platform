import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApexChart, NgApexchartsModule } from 'ng-apexcharts';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';

@Component({
  selector: 'app-api-token-usage',
  imports: [
    CommonModule,
    NgApexchartsModule,
    DropdownComponent,
    DropdownItemComponent,
  ],
  templateUrl: './api-token-usage.component.html',
  styleUrl: './api-token-usage.component.css',
})
export class ApiTokenUsageComponent {
  openDropdown: string | null = null;

  readonly tokenUsageProviders = [
    {
      name: 'GPT',
      meta: '2 API keys configured',
      usage: '7M',
      value: 900,
      color: '#7592FF',
    },
    {
      name: 'Gemini',
      meta: '1 API key configured',
      usage: '7M',
      value: 700,
      color: '#7CD4FD',
    },
    {
      name: 'xAI',
      meta: '2 API key configured',
      usage: '4.5M',
      value: 850,
      color: '#BDB4FE',
    },
  ] as const;

  toggleDropdown(key: string) {
    this.openDropdown = this.openDropdown === key ? null : key;
  }
  closeDropdown() {
    this.openDropdown = null;
  }

  tokenChartSeries: ApexNonAxisChartSeries = [900, 700, 850];
  tokenChartColors = ['#7592FF', '#7CD4FD', '#BDB4FE'];
  tokenChartLabels = ['Chat GPT', 'Gemini Pro', 'Grok'];

  tokenChart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'donut',
    width: 250,
    height: 250,
  };

  tokenChartStroke: ApexStroke = {
    show: false,
    width: 4,
    colors: ['transparent'],
  };

  tokenChartPlotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '70%',
        background: 'transparent',
        labels: {
          show: true,
          name: {
            show: true,
            offsetY: 0,
            color: '#1D2939',
            fontSize: '12px',
            fontWeight: 'normal',
          },
          value: {
            show: true,
            offsetY: 10,
            color: '#1D2939',
            fontSize: '12px',
            fontWeight: 600,
            formatter: (val: string) => val,
          },
          total: {
            show: true,
            showAlways: true,
            label: '13.5M',
            fontSize: '24px',
            fontWeight: 600,
            color: '#1D2939',
            formatter: () => '2450',
          },
        },
      },
    },
  };

  tokenChartLegend: ApexLegend = { show: false };
  tokenChartDataLabels: ApexDataLabels = { enabled: false };
  tokenChartTooltip: ApexTooltip = {
    enabled: true,
    custom: function ({ series, seriesIndex, w }: any) {
      return (
          '<div class="rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">' +
          '<div class="flex items-center gap-2">' +
          ' <div class="size-2 rounded-full" style="background-color: ' +
          w.config.colors[seriesIndex] +
          '"></div>' +
          ' <span class="text-xs font-medium text-gray-800 dark:text-white/90">' +
          w.config.labels[seriesIndex] +
          "</span>" +
          "</div>" +
          '<div class="mt-1 text-xs text-gray-500 dark:text-gray-400">' +
          series[seriesIndex] +
          " Units" +
          "</div>" +
          "</div>"
        );
    },
  };

  tokenChartResponsive: ApexResponsive[] = [
    {
      breakpoint: 640,
      options: { chart: { width: 280, height: 280 } },
    },
    {
      breakpoint: 2600,
      options: { chart: { width: 240, height: 240 } },
    },
  ];
}
