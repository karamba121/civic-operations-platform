import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../services/theme.service';
import {
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexYAxis,
  ApexXAxis,
  NgApexchartsModule
} from 'ng-apexcharts';

@Component({
  selector: 'app-radar-chart-two',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './radar-chart-two.component.html',
  styles: [':host { display: block; }']
})
export class RadarChartTwoComponent implements OnInit, OnDestroy {
  public series: any[] = [
    { name: 'Desktop', data: [70, 55, 40, 30, 10, 5, 60] },
    { name: 'Mobile', data: [55, 40, 50, 60, 15, 35, 45] },
  ];

  public labels: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

  public colors: string[] = ['#3641F5', '#EE46BC'];

  public chart: ApexChart = {
    type: 'radar',
    height: 380,
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
    background: 'transparent',
  };

  public fill: any = { opacity: 0.2 };

  public stroke: ApexStroke = { show: true, width: 2, colors: ['#465FFF', '#F05FB5'] };

  public markers: any = { size: 0 };

  public dataLabels: ApexDataLabels = { enabled: false };

  public plotOptions: any = {
    radar: {
      polygons: {
        strokeColors: '#E4E7EC',
        connectorColors: '#E4E7EC',
        fill: {
          colors: ['#ffffff', '#ffffff'],
        },
      },
    },
  };

  public yaxis: ApexYAxis = {
    show: true,
    min: 0,
    max: 90,
    tickAmount: 9,
    labels: {
      style: { fontSize: '11px', colors: '#98A2B3' },
      formatter: (val: number) => `${val}`,
    },
  };

  public xaxis: any = {
    labels: {
      style: {
        fontSize: '13px',
        colors: Array(7).fill('#344054'),
      },
    },
  };

  public legend: any = {
    show: true,
    position: 'bottom',
    horizontalAlign: 'center',
    markers: { shape: 'circle', size: 6, strokeWidth: 0, offsetX: -2 },
    itemMargin: { horizontal: 12, vertical: 0 },
    labels: { colors: '#344054' },
    fontSize: '14px',
  };

  public tooltip: ApexTooltip = {
    y: { formatter: (val: number) => `${val}` },
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
      radar: {
        polygons: {
          strokeColors: isDark ? '#313D4F' : '#E4E7EC',
          connectorColors: isDark ? '#313D4F' : '#E4E7EC',
          fill: {
            colors: isDark ? ['#1e2d40', '#1a2535'] : ['#ffffff', '#ffffff'],
          },
        },
      },
    };

    this.xaxis = {
      labels: {
        style: {
          fontSize: '13px',
          colors: Array(7).fill(isDark ? '#98A2B3' : '#344054'),
        },
      },
    };

    this.legend = {
      ...this.legend,
      labels: { colors: isDark ? '#98A2B3' : '#344054' }
    };
  }
}
