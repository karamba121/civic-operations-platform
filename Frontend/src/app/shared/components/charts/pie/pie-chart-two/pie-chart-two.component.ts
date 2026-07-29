import { Component } from '@angular/core';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTooltip,
} from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../services/theme.service';

import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-pie-chart-two',
  imports: [
    NgApexchartsModule
],
  templateUrl: './pie-chart-two.component.html',
  styles: ``
})
export class PieChartTwoComponent {

  isDarkMode = false;
  private themeSubscription: Subscription | undefined;

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
      this.updatePlotOptions();
    });
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }


  public series: ApexNonAxisChartSeries = [45, 65, 25, 25];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'donut',
    width: 400,
  };

  public labels: string[] = ['Downloads', 'Apps', 'Documents', 'Media'];

  public colors: string[] = ['#9b8afb', '#fd853a', '#fdb022', '#32d583'];

  public stroke: ApexStroke = {
    show: false,
    width: 4,
    colors: ['transparent'],
  };

  public plotOptions!: ApexPlotOptions;

  public dataLabels: ApexDataLabels = {
    enabled: false,
  };

  public tooltip: ApexTooltip = {
    enabled: false,
  };

  public legend: ApexLegend = {
    show: true,
    position: 'bottom',
    horizontalAlign: 'left',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    markers: {
      // size: 6,
      shape: 'circle',
      strokeWidth: 0,
    },
    itemMargin: {
      horizontal: 10,
      vertical: 6,
    },
  };

  public responsive: ApexResponsive[] = [
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 320,
        },
        legend: {
          itemMargin: {
            horizontal: 7,
            vertical: 5,
          },
          fontSize: '12px',
        },
      },
    },
  ];

  updatePlotOptions(): void {
    this.plotOptions = {
      pie: {
        expandOnClick: false,
        donut: {
          size: '65%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              offsetY: -10,
              color: this.isDarkMode ? '#ffffff' : '#1D2939',
              fontSize: '14px',
              fontWeight: 500,
            },
            value: {
              show: true,
              offsetY: 10,
              color: this.isDarkMode ? '#D1D5DB' : '#667085',
              fontSize: '12px',
              fontWeight: 400,
              formatter: () => 'Used of 135 GB',
            },
            total: {
              show: true,
              label: 'Total 135 GB',
              color: this.isDarkMode ? '#ffffff' : '#000000',
              fontSize: '16px',
              fontWeight: 'bold',
            },
          },
        },
      },
    };
  }
}
