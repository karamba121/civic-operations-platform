import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart, ApexDataLabels, ApexGrid,
  ApexLegend,
  ApexPlotOptions, ApexStates, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis, NgApexchartsModule
} from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../services/theme.service';


@Component({
  selector: 'app-bar-chart-four',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './bar-chart-four.component.html'
})
export class BarChartFourComponent {

   selectedPeriod = 'Yearly';
  openDropdown = false;

  public series: ApexAxisChartSeries = [
    { name: 'Activity', data: [45] },
    { name: 'Online Purchases', data: [25] },
    { name: 'Groceries', data: [15] },
    { name: 'Digital Goods', data: [20] },
    { name: 'Stationery', data: [10] },
    { name: 'Others', data: [30] },
  ];

  public chartOptions: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    height: 50,
    stacked: true,
    toolbar: {
      show: false,
    },
    animations: {
      enabled: false,
    },
  };

  public colors: string[] = ['#7592FF', '#7CD4FD', '#BDB4FE', '#FE9EFE', '#6FEAA6', '#D0D5DD'];

  public plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      barHeight: '32px',
      borderRadius: 4,
      borderRadiusApplication: 'end',
      borderRadiusWhenStacked: 'last',
    },
  };

  public dataLabels: ApexDataLabels = {
    enabled: false,
  };

  public grid: ApexGrid = {
    show: false,
    padding: {
      top: -30,
      bottom: -20,
      left: -10,
      right: 0,
    },
  };

  public xaxis: ApexXAxis = {
    labels: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  };

  public yaxis: ApexYAxis = {
    labels: {
      show: false,
    },
  };

  public tooltip: ApexTooltip = {
    enabled: true,
    x: {
      show: false,
    },
  };

  public stroke: ApexStroke = {
    show: true,
    width: 1,
    colors: ['#ffffff'],
  };

  public states: ApexStates = {
    hover: {
      filter: {
        type: 'none',
      },
    },
    active: {
      filter: {
        type: 'none',
      },
    },
  };

  public legend: ApexLegend = {
    show: false,
  };

  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeSubscription = this.themeService.theme$.subscribe((theme) => {
      this.updateStrokeColor(theme);
    });
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

  updateStrokeColor(theme: string) {
    this.stroke = {
      ...this.stroke,
      colors: [theme === 'dark' ? '#111827' : '#ffffff'],
    };
  }

  toggleDropdown() {
    this.openDropdown = !this.openDropdown;
  }

  selectPeriod(period: string) {
    this.selectedPeriod = period;
    this.openDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.openDropdown = false;
  }
}
