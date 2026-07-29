
import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexStroke,
  ApexGrid,
  ApexDataLabels,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  ApexOptions,
  NgApexchartsModule
} from 'ng-apexcharts';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { ChartTabComponent } from '../../common/chart-tab/chart-tab.component';

@Component({
  selector: 'app-traffic-stats',
  imports: [
    ChartTabComponent,
    NgApexchartsModule,
    DropdownComponent,
    DropdownItemComponent
],
  templateUrl: './traffic-stats.component.html'
})
export class TrafficStatsComponent {
  isOpen = false;

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    height: 70,
    type: 'area',
    parentHeightOffset: 0,
    toolbar: { show: false }
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
      '2018-09-19T12:30:00.000Z',
    ],
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false }
  };
  public yaxis: ApexYAxis = { labels: { show: false } };
  public stroke: ApexStroke = { curve: 'smooth', width: 1 };
  public fill: ApexFill = { gradient: { opacityFrom: 0.55, opacityTo: 0 } };
  public dataLabels: ApexDataLabels = { enabled: false };
  public tooltip: ApexTooltip = { enabled: false };
  public grid: ApexGrid = { show: false };
  public colors: string[] = ['#12B76A'];
  public legend: ApexLegend = { show: false };

  public series: ApexAxisChartSeries = [
    {
      name: 'New Sales',
      data: [300, 350, 310, 370, 248, 187, 295, 191, 269, 201, 185, 252, 151],
    },
  ];

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}