import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../services/theme.service';
import {
  ApexChart,
  ApexStroke,
  ApexTooltip,
  NgApexchartsModule
} from 'ng-apexcharts';

@Component({
  selector: 'app-radial-chart-three',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './radial-chart-three.component.html',
  styles: [':host { display: block; }']
})
export class RadialChartThreeComponent implements OnInit, OnDestroy {
  public series: number[] = [62.25, 75, 50, 35];
  public colors: string[] = ['#FCE7F6', '#BDB4FE', '#7A5AF8', '#4E5BA6'];

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
        size: '50%',
        background: 'transparent',
      },
      track: {
        background: '#F2F4F7',
        strokeWidth: '100%',
        margin: 4,
      },
      dataLabels: {
        name: {
          show: true,
          fontSize: '14px',
          fontWeight: '500',
          color: '#667085',
          offsetY: -4,
          formatter: () => 'Total',
        },
        value: {
          show: true,
          fontSize: '22px',
          fontWeight: '700',
          color: '#101828',
          offsetY: 14,
          formatter: () => '62.25%',
        },
        total: {
          show: true,
          label: 'Total',
          fontSize: '14px',
          fontWeight: '500',
          color: '#667085',
          formatter: () => '62.25%',
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
        ...this.plotOptions.radialBar,
        track: {
          ...this.plotOptions.radialBar.track,
          background: isDark ? '#1D2939' : '#F2F4F7',
        },
        dataLabels: {
          ...this.plotOptions.radialBar.dataLabels,
          name: {
            ...this.plotOptions.radialBar.dataLabels.name,
            color: isDark ? '#98A2B3' : '#667085',
          },
          value: {
            ...this.plotOptions.radialBar.dataLabels.value,
            color: isDark ? '#ffffff' : '#101828',
          },
          total: {
            ...this.plotOptions.radialBar.dataLabels.total,
            color: isDark ? '#98A2B3' : '#667085',
          },
        },
      },
    };
  }
}
