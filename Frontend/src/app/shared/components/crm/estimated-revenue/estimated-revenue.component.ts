import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexFill,
  ApexStroke,
  ApexOptions,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-estimated-revenue',
  imports: [
    CommonModule,
    NgApexchartsModule,
    DropdownComponent,
    DropdownItemComponent,
  ],
  templateUrl: './estimated-revenue.component.html',
})
export class EstimatedRevenueComponent {
  isOpen = false;

  public series: ApexNonAxisChartSeries = [90];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'radialBar',
    height: 360,
    sparkline: { enabled: true },
  };

  public colors: string[] = ['#465FFF'];

  public plotOptions: ApexPlotOptions = {
    radialBar: {
      startAngle: -85,
      endAngle: 85,
      hollow: { size: '80%' },
      track: {
        background: '#E4E7EC',
        strokeWidth: '100%',
        margin: 5,
      },
      dataLabels: {
        name: { show: false },
        value: {
          fontSize: '36px',
          fontWeight: '600',
          offsetY: -25,
          color: '#1D2939',
          formatter: (val: number) => `$${val}`,
        },
      },
    },
  };

  public fill: ApexFill = {
    type: 'solid',
    colors: ['#465FFF'],
  };

  public stroke: ApexStroke = {
    lineCap: 'round',
  };

  public labels: string[] = ['June Goals'];

  marketing = { value: '$30,569.00', percent: 85 };
  sales = { value: '$20,486.00', percent: 55 };

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
