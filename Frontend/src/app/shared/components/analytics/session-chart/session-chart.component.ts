
import { Component } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexDataLabels,
  ApexLegend,
  ApexResponsive,
  ApexStroke,
  ApexTooltip,
  NgApexchartsModule
} from 'ng-apexcharts';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';

@Component({
  selector: 'app-session-chart',
  imports: [NgApexchartsModule, DropdownComponent, DropdownItemComponent],
  templateUrl: './session-chart.component.html'
})
export class SessionChartComponent {
  isOpen = false;

  public series: ApexNonAxisChartSeries = [45, 65, 25];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'donut',
    width: 445,
    height: 290,
  };

  public colors: string[] = ['#3641f5', '#7592ff', '#dde9ff'];

  public labels: string[] = ['Desktop', 'Mobile', 'Tablet'];

  public plotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '65%',
        background: 'transparent',
        labels: {
          show: true,
          value: {
            show: true,
            offsetY: 0,
          },
        },
      },
    },
  };

  public states = {
    hover: { filter: { type: 'none' } },
    active: {
      allowMultipleDataPointsSelection: false,
      filter: { type: 'darken' }
    }
  };

  public dataLabels: ApexDataLabels = { enabled: false };

  public tooltip: ApexTooltip = { enabled: false };

  public stroke: ApexStroke = {
    show: false,
    width: 4,
  };

  public legend: ApexLegend = {
    show: true,
    position: 'bottom',
    horizontalAlign: 'center',
    fontFamily: 'Outfit',
    fontSize: '14px',
    fontWeight: 400,
    markers: {
      // size: 4,
      shape: 'circle',
      strokeWidth: 0,
    },
    itemMargin: {
      horizontal: 10,
      vertical: 0,
    },
    labels: {
      useSeriesColors: true,
    },
  };

  public responsive: ApexResponsive[] = [
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 370,
          height: 290,
        },
      },
    },
  ];

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
