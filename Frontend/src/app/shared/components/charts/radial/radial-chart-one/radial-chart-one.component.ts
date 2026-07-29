import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ApexChart,
  ApexStroke,
  ApexTooltip,
  NgApexchartsModule
} from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-radial-chart-one',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './radial-chart-one.component.html',
  styles: [':host { display: block; }']
})
export class RadialChartOneComponent implements OnInit, OnDestroy {
  public series: number[] = [62.25];
  public colors: string[] = ['#465FFF'];

  public chart: ApexChart = {
    type: 'radialBar',
    height: 300,
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
  };

  public plotOptions: any = {
    radialBar: {
      startAngle: 0,
      endAngle: 360,
      hollow: {
        size: '72%',
        background: 'transparent',
      },
      track: {
        background: '#F2F4F7',
        strokeWidth: '100%',
        startAngle: 0,
        endAngle: 360,
      },
      dataLabels: {
        name: {
          show: true,
          fontSize: '15px',
          fontWeight: '600',
          color: '#344054',
          offsetY: -4,
          formatter: (val:boolean) => 'Total',
        },
        value: {
          show: true,
          fontSize: '20px',
          fontWeight: '700',
          color: '#101828',
          offsetY: 16,
          formatter: (val: number) => `${val}%`,
        },
      },
    },
  };

  public stroke: ApexStroke = {
    lineCap: 'butt',
  };

  public legend: any = {
    show: false,
  };

  public tooltip: ApexTooltip = {
    enabled: false,
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
        ...(this.plotOptions.radialBar || {}),
        track: {
          ...(this.plotOptions.radialBar?.track || {}),
          background: isDark ? '#1D2939' : '#F2F4F7',
        },
        dataLabels: {
          ...(this.plotOptions.radialBar?.dataLabels || {}),
          name: {
            ...(this.plotOptions.radialBar?.dataLabels?.name || {}),
            color: isDark ? '#98A2B3' : '#344054',
          },
          value: {
            ...(this.plotOptions.radialBar?.dataLabels?.value || {}),
            color: isDark ? '#ffffff' : '#101828',
          },
        },
      },
    };
  }
}
