import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ApexChart,
  ApexDataLabels,
  ApexStroke,
  ApexTooltip,
  ApexYAxis,
  NgApexchartsModule
} from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-radar-chart-one',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './radar-chart-one.component.html',
  styles: [':host { display: block; }']
})
export class RadarChartOneComponent implements OnInit, OnDestroy {
  public series: any[] = [
    {
      name: 'Data',
      data: [9, 7, 3, 5, 3, 4, 6, 8],
    },
  ];

  public labels: string[] = [
    'Estonia',
    'Germany',
    'France',
    'Spain',
    'Italy',
    'Canada',
    'Japan',
    'Brazil',
  ];

  public colors: string[] = ['#465FFF'];

  public chart: ApexChart = {
    type: 'radar',
    height: 320,
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
    background: 'transparent',
  };

  public fill: any = { opacity: 0.3 };

  public stroke: ApexStroke = { show: true, width: 3, colors: ['#465FFF'] };

  public markers: any = {
    size: 4,
    colors: ['#465FFF'],
    strokeColors: '#fff',
    strokeWidth: 2,
  };

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
    max: 9,
    tickAmount: 3,
    labels: {
      style: { fontSize: '11px', colors: '#98A2B3' },
      formatter: (val: number) => `${val}`,
    },
  };

  public xaxis: any = {
    labels: {
      style: {
        fontSize: '13px',
        colors: Array(8).fill('#344054'),
      },
    },
  };

  public legend: any = { show: false };

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
    
    this.markers = {
      ...this.markers,
      strokeColors: isDark ? '#1D2939' : '#fff'
    };

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
          colors: Array(8).fill(isDark ? '#98A2B3' : '#344054'),
        },
      },
    };
  }
}
