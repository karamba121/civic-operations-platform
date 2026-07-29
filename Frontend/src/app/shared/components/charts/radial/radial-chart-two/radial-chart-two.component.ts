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
  selector: 'app-radial-chart-two',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './radial-chart-two.component.html',
  styles: [':host { display: block; }']
})
export class RadialChartTwoComponent implements OnInit, OnDestroy {
  public series: number[] = [75, 55, 40];
  public colors: string[] = ['#262E89', '#FEB273', '#BDB4FE'];

  public chart: ApexChart = {
    type: 'radialBar',
    height: 300,
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
  };

  public plotOptions: any = {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      offsetY: 60,
      hollow: {
        size: '25%',
        background: 'transparent',
      },
      track: {
        background: '#F4F5F5',
        strokeWidth: '100%',
        margin: 2,
      },
      dataLabels: {
        name: {
          show: false,
        },
        value: {
          show: false,
        },
        total: {
          show: false,
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
          background: isDark ? '#1D2939' : '#F4F5F5',
        },
      },
    };
  }
}
