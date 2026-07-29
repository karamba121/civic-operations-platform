import { Component } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-pie-chart-three',
  imports: [NgApexchartsModule],
  templateUrl: './pie-chart-three.component.html',
  styles: [`
  :host {
    ::ng-deep .apexcharts-tooltip {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    ::ng-deep .apexcharts-tooltip.apexcharts-theme-light {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
    }
  }
`]
})
export class PieChartThreeComponent {
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

  tokenChartSeries = [900, 700, 850];
  tokenChartColors = ['#7592FF', '#7CD4FD', '#BDB4FE'];
  tokenChartLabels = ['ChatGPT', 'Gemini', 'xAI'];

  tokenChart: any = {
    type: 'donut',
    height: 320,
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
  };

  tokenChartStroke: any = {
    show: false,
    width: 0,
  };

  tokenChartPlotOptions: any = {
    pie: {
      donut: {
        size: '70%',
        background: 'transparent',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '13px',
            fontWeight: '400',
            color: '#667085',
            offsetY: 20,
          },
          value: {
            show: true,
            fontSize: '28px',
            fontWeight: '700',
            color: '#101828',
            offsetY: -16,
            formatter: () => '13.5M',
          },
          total: {
            show: true,
            label: 'Total API Token used',
            fontSize: '13px',
            fontWeight: '400',
            color: '#667085',
            formatter: () => '13.5M',
          },
        },
      },
    },
  };

  tokenChartLegend: any = {
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
      horizontal: 10,
      vertical: 4,
    },
    labels: {
      colors: '#344054',
    },
    fontSize: '13px',
  };

  tokenChartDataLabels: any = { enabled: false };

  tokenChartTooltip: any = {
    enabled: false,
  };

  tokenChartResponsive: any[] = [];
}
