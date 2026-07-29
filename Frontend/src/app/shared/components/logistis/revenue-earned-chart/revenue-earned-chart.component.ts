
import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  NgApexchartsModule
} from 'ng-apexcharts';

@Component({
  selector: 'app-revenue-earned-chart',
  imports: [
    DropdownComponent,
    DropdownItemComponent,
    NgApexchartsModule
],
  templateUrl: './revenue-earned-chart.component.html',
  styles: ``
})
export class RevenueEarnedChartComponent {

  isOpen: boolean = false;

  public series: ApexAxisChartSeries = [
    {
      name: 'New Sales',
      data: [300, 350, 310, 370, 248, 287, 295, 191, 269, 201, 185, 252, 151]
    }
  ];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    height: 70,
    type: 'area',
    parentHeightOffset: 0,
    toolbar: { show: false }
  };

  public grid: ApexGrid = {
    show: false
  };

  public colors: string[] = ['#12B76A'];

  public fill: ApexFill = {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0
    }
  };

  public legend: ApexLegend = {
    show: false
  };

  public tooltip: ApexTooltip = {
    enabled: false
  };

  public dataLabels: ApexDataLabels = {
    enabled: false
  };

  public stroke: ApexStroke = {
    curve: 'smooth',
    width: 1
  };

  public xaxis: ApexXAxis = {
    type: 'datetime',
    categories: [
      '2018-09-19T00:00:00.000Z',
      '2018-09-19T01:30:00.000Z',
      '2018-09-19T02:30:00.000Z',
      '2018-09-19T03:30:00.000Z',
      '2018-09-19T04:30:00.000Z',
      '2018-09-19T05:30:00.000Z',
      '2018-09-19T06:30:00.000Z',
      '2018-09-19T07:30:00.000Z',
      '2018-09-19T08:30:00.000Z',
      '2018-09-19T09:30:00.000Z',
      '2018-09-19T10:30:00.000Z',
      '2018-09-19T11:30:00.000Z',
      '2018-09-19T12:30:00.000Z'
    ],
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false }
  };

  public yaxis: ApexYAxis = {
    labels: { show: false }
  };

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
