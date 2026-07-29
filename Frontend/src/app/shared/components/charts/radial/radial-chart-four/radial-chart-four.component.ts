import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../services/theme.service';
import {
  ApexChart,
  ApexStroke,
  NgApexchartsModule
} from 'ng-apexcharts';

@Component({
  selector: 'app-radial-chart-four',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './radial-chart-four.component.html',
  styles: [`
    :host {
      display: block;
      
      ::ng-deep .apexcharts-tooltip {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
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
export class RadialChartFourComponent implements OnInit, OnDestroy {
  private dataValues = [20, 20, 20, 20];
  
  public series: number[] = [80, 80, 80, 80];
  public labels: string[] = ['Loans', 'Mortgage', 'Savings', 'Credit Card'];
  public colors: string[] = ['#161950', '#252DAE', '#465FFF', '#9CB9FF'];

  public chart: ApexChart = {
    type: 'radialBar',
    height: 320,
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
  };

  public plotOptions: any = {
    radialBar: {
      startAngle: 0,
      endAngle: 360,
      hollow: {
        margin: 0,
        size: '45%',
        background: 'transparent',
      },
      track: {
        show: true,
        background: '#F2F4F7',
        strokeWidth: '100%',
        margin: 0,
      },
      dataLabels: {
        show: false,
      },
    },
  };

  public stroke: ApexStroke = {
    lineCap: 'butt',
  };

  public legend: any = {
    show: true,
    position: 'left',
    verticalAlign: 'middle',
    floating: false,
    markers: {
      shape: 'circle',
      size: 6,
      offsetX: -2,
      strokeWidth: 0,
    },
    formatter: (seriesName: string, opts: any) => {
      const pct = this.dataValues[opts.seriesIndex];
      return `${seriesName} &nbsp;&nbsp; <strong>${pct}%</strong>`;
    },
    itemMargin: {
      vertical: 6,
    },
    labels: {
      colors: '#344054',
    },
    fontSize: '13px',
  };

  public tooltip: any = {
    enabled: true,
    custom: ({ seriesIndex, w }: any) => {
      const label = w.globals.labels[seriesIndex];
      const pct = this.dataValues[seriesIndex];
      const color = w.globals.colors[seriesIndex];
      return `<div class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800" style="font-family: Outfit, sans-serif; font-size: 13px;">
        <span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;"></span>
        <span class="text-gray-600 dark:text-gray-400">${label}:</span>
        <strong class="text-gray-900 dark:text-white">${pct}%</strong>
      </div>`;
    },
  };

  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeSubscription = this.themeService.theme$.subscribe((theme) => {
      this.updateThemeSettings(theme);
    });
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

  private updateThemeSettings(theme: string) {
    const isDark = theme === 'dark';
    
    this.plotOptions = {
      ...this.plotOptions,
      radialBar: {
        ...this.plotOptions.radialBar,
        track: {
          ...this.plotOptions.radialBar.track,
          background: isDark ? '#1D2939' : '#F2F4F7',
        },
      },
    };

    this.legend = {
      ...this.legend,
      labels: {
        colors: isDark ? '#98A2B3' : '#344054',
      },
    };
  }
}
