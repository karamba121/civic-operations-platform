import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  NgApexchartsModule
} from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-pie-chart-five',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './pie-chart-five.component.html'
})
export class PieChartFiveComponent implements OnInit, OnDestroy {
  public series: number[] = [35, 25, 20, 12, 8];
  public labels: string[] = ['Email', 'Social Media', 'Mobile', 'Direct', 'Other'];
  public colors: string[] = ['#4E5BA6', '#4E5BA6', '#BDB4FE', '#B9E6FE', '#FCE7F6'];

  public chart: ApexChart = {
    type: 'donut',
    height: 280,
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
  };

  public plotOptions: ApexPlotOptions = {
    pie: {
      startAngle: -90,
      endAngle: 90,
      offsetY: 10,
      donut: {
        size: '55%',
      },
    },
  };

  public dataLabels: ApexDataLabels = {
    enabled: false,
  };

  public stroke: ApexStroke = {
    show: true,
    width: 3,
    colors: ['#ffffff'],
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
      horizontal: 10,
      vertical: 0,
    },
    labels: {
      colors: '#344054',
    },
    fontSize: '13px',
  };

  public tooltip: ApexTooltip = {
    enabled: false,
  };

  public responsive: any[] = [
    {
      breakpoint: 480,
      options: {
        chart: {
          height: 240,
        },
      },
    },
  ];

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
    this.stroke = {
      ...this.stroke,
      colors: [isDark ? '#1D2939' : '#ffffff']
    };
    this.legend = {
      ...this.legend,
      labels: {
        colors: isDark ? '#98A2B3' : '#344054'
      }
    };
  }
}
