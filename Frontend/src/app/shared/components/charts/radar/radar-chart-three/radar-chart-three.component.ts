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
  selector: 'app-radar-chart-three',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './radar-chart-three.component.html',
  styles: [':host { display: block; }']
})
export class RadarChartThreeComponent implements OnInit, OnDestroy {
  public series: any[] = [
    { name: 'Weekly', data: [100, 40, 60, 25, 60, 80, 20] }
  ];

  public labels: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  public colors: string[] = ['#465FFF'];

  public chart: ApexChart = {
    type: 'radar',
    height: 380,
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
    background: 'transparent',
  };

  public fill: any = { opacity: 0.3 };

  public stroke: ApexStroke = { show: true, width: 2, colors: ['#465FFF'] };

  public markers: any = { size: 0 };

  public dataLabels: ApexDataLabels = {
    enabled: true,
    background: {
      enabled: true,
      borderRadius: 6,
      borderWidth: 0,
      foreColor: '#465FFF',
      padding: 6,
      dropShadow: { enabled: false },
    },
    style: { fontSize: '12px', fontWeight: '600', colors: ['#ffffff'] },
    formatter: (val: number) => `${val}`,
  } as any;

  public plotOptions: any = {
    radar: {
      polygons: {
        strokeColors: '#E4E7EC',
        connectorColors: '#E4E7EC',
        fill: {
          colors: ['#F2F4F7', '#ffffff'],
        },
      },
    },
  };

  public yaxis: ApexYAxis = {
    show: true,
    min: 0,
    max: 140,
    tickAmount: 7,
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
    
    this.plotOptions = {
      radar: {
        polygons: {
          strokeColors: isDark ? '#313D4F' : '#E4E7EC',
          connectorColors: isDark ? '#313D4F' : '#E4E7EC',
          fill: {
            colors: isDark ? ['#1e2d40', '#1a2535'] : ['#F2F4F7', '#ffffff'],
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
  }
}
