import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexPlotOptions,
  ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent, NgApexchartsModule
} from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-cashflow-overview',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './cashflow-overview.component.html',
  styleUrl: './cashflow-overview.component.css',
})
export class CashflowOverviewComponent implements OnInit, OnDestroy {
  @ViewChild('chart') chart!: ChartComponent;

  years = ['2025', '2024', '2023', '2022', '2021', '2020'];
  periods = ['3 Month', '6 Month', '1 Year'];

  selectedYear = this.years[0];
  selectedPeriod = this.periods[0];

  openYearDropdown = false;
  openPeriodDropdown = false;

  incomeHidden = false;
  expenseHidden = false;
  hoverSeries: number | null = null;

  private themeSubscription?: Subscription;

  public series: ApexAxisChartSeries = [
    {
      name: 'Income',
      data: [9500, 6400, 14000, 7500, 9500, 10200, 7000, 11600, 9200, 12500, 7600, 6400],
    },
    {
      name: 'Expense',
      data: [6200, 4100, 9200, 5000, 6300, 6800, 4600, 7600, 6000, 8200, 5000, 4100],
    },
  ];

  public chartOptions: ApexChart = {
    type: 'bar',
    height: 250,
    stacked: true,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    fontFamily: 'Outfit, sans-serif',
  };

  public colors: string[] = ['#465FFF', '#9CB9FF'];

  public plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '40%',
      borderRadius: 6,
      borderRadiusApplication: 'end',
      borderRadiusWhenStacked: 'last',
    },
  };

  public dataLabels: ApexDataLabels = {
    enabled: false,
  };

  public fill: ApexFill = {
    opacity: 1,
  };

  public xaxis: ApexXAxis = {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        colors: '#98A2B3',
        fontSize: '12px',
      },
    },
  };

  public yaxis: ApexYAxis = {
    labels: {
      style: {
        colors: '#98A2B3',
        fontSize: '12px',
      },
      formatter: (value) => {
        return value >= 1000 ? `${value / 1000}K` : value.toString();
      },
    },
  };

  public grid: ApexGrid = {
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
    borderColor: '#E9EDF5',
    strokeDashArray: 0,
  };

  public legend: ApexLegend = {
    show: false,
  };

  public tooltip: ApexTooltip = {
    enabled: true,
    x: {
      show: false,
    },
    y: {
      formatter: (value) => `$${value}`,
    },
  };

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeSubscription = this.themeService.theme$.subscribe((theme) => {
      this.updateChartTheme(theme);
    });
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

  updateChartTheme(theme: string) {
    this.grid = {
      ...this.grid,
      borderColor: theme === 'dark' ? '#2E3545' : '#E9EDF5',
    };
  }

  toggleYearDropdown() {
    this.openYearDropdown = !this.openYearDropdown;
    if (this.openYearDropdown) this.openPeriodDropdown = false;
  }

  selectYear(year: string) {
    this.selectedYear = year;
    this.openYearDropdown = false;
  }

  togglePeriodDropdown() {
    this.openPeriodDropdown = !this.openPeriodDropdown;
    if (this.openPeriodDropdown) this.openYearDropdown = false;
  }

  selectPeriod(period: string) {
    this.selectedPeriod = period;
    this.openPeriodDropdown = false;
  }

  toggleSeries(seriesName: string) {
    if (seriesName === 'Income') {
      this.incomeHidden = !this.incomeHidden;
    } else {
      this.expenseHidden = !this.expenseHidden;
    }
    this.chart.toggleSeries(seriesName);
  }

  handleMouseEnter(index: number) {
    if (!this.incomeHidden && !this.expenseHidden) {
      this.hoverSeries = index;
    }
  }

  handleMouseLeave() {
    this.hoverSeries = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.openYearDropdown = false;
    this.openPeriodDropdown = false;
  }
}
