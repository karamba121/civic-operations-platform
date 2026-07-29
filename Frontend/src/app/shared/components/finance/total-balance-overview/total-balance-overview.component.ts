import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexStroke,
  ApexFill,
  ApexMarkers,
  ApexTooltip,
} from 'ng-apexcharts';

@Component({
  selector: 'app-total-balance-overview',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './total-balance-overview.component.html',
  styleUrl: './total-balance-overview.component.css',
})
export class TotalBalanceOverviewComponent {
  accountNumber = '•••• •••• •••• 5332';

  currencyOptions = [
    { code: 'USD', flag: 'images/flag/flag-01.png' },
    { code: 'EUR', flag: 'images/flag/flag-02.png' },
    { code: 'GBP', flag: 'images/flag/flag-03.png' },
    { code: 'JPY', flag: 'images/flag/flag-04.png' },
  ];

  periodOptions = ['June 2025', 'May 2025', 'Apr 2025', 'Q1 2025', 'Last 30 Days', 'Last 7 Days'];

  openCurrency = false;
  selectedCurrency = this.currencyOptions[0];

  openDate = false;
  selectedDate = this.periodOptions[0];

  copied = false;

  public series: ApexAxisChartSeries = [
    {
      name: 'Balance',
      data: [
        20, 24, 23, 25, 30, 35, 40, 30, 32, 33, 29, 28, 27, 29, 45, 58, 70,
        80, 72, 68, 85, 79, 77, 75,
      ],
    },
  ];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'area',
    height: 70,
    sparkline: {
      enabled: true,
    },
    toolbar: {
      show: false,
    },
    animations: {
      enabled: true,
    },
  };

  public colors: string[] = ['#465FFF'];

  public stroke: ApexStroke = {
    curve: 'smooth',
    width: 2,
  };

  public fill: ApexFill = {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.65,
      opacityTo: 0,
    },
  };

  public markers: ApexMarkers = {
    size: 0,
  };

  public tooltip: ApexTooltip = {
    enabled: false,
  };

  toggleCurrency() {
    this.openCurrency = !this.openCurrency;
    if (this.openCurrency) this.openDate = false;
  }

  selectCurrency(currency: any) {
    this.selectedCurrency = currency;
    this.openCurrency = false;
  }

  toggleDate() {
    this.openDate = !this.openDate;
    if (this.openDate) this.openCurrency = false;
  }

  selectDate(period: string) {
    this.selectedDate = period;
    this.openDate = false;
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.accountNumber);
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }

  closeDropdowns() {
    this.openCurrency = false;
    this.openDate = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.closeDropdowns();
  }
}
