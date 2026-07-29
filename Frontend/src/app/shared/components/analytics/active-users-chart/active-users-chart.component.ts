
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
  ApexResponsive,
  NgApexchartsModule
} from 'ng-apexcharts';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-active-users-chart',
  imports: [
    NgApexchartsModule,
    DropdownComponent,
    DropdownItemComponent
],
  templateUrl: './active-users-chart.component.html'
})
export class ActiveUsersChartComponent {
  isOpen = false;

  public series: ApexAxisChartSeries = [
    {
      name: 'Sales',
      data: [180, 181, 182, 184, 183, 182, 181, 182, 183, 185, 186, 183],
    },
  ];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    height: 140,
    type: 'area',
    toolbar: { show: false }
  };

  public colors: string[] = ['#465FFF'];

  public fill: ApexFill = {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0,
    }
  };

  public responsive: ApexResponsive[] = [
    {
      breakpoint: 1024,
      options: { chart: { height: 300 } }
    },
    {
      breakpoint: 1366,
      options: { chart: { height: 320 } }
    }
  ];

  public stroke: ApexStroke = {
    curve: 'smooth',
    width: 2
  };

  public grid: ApexGrid = {
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: false } }
  };

  public dataLabels: ApexDataLabels = { enabled: false };

  public tooltip: ApexTooltip = {
    x: { format: 'dd MMM yyyy' }
  };

  public xaxis: ApexXAxis = {
    type: 'category',
    categories: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { show: false }
  };

  public yaxis: ApexYAxis = {
    labels: { show: false },
    title: { text: undefined }
  };

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
