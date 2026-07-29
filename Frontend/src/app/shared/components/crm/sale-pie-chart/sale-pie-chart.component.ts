// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-sale-pie-chart',
//   imports: [],
//   templateUrl: './sale-pie-chart.component.html',
//   styles: ``
// })
// export class SalePieChartComponent {

// }



import { Component } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexFill,
  ApexStroke,
  ApexLegend,
  ApexResponsive,
  ApexDataLabels,
  ApexTooltip,
  NgApexchartsModule
} from 'ng-apexcharts';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-sale-pie-chart',
  imports: [
    NgApexchartsModule,
    DropdownComponent,
    DropdownItemComponent
],
  templateUrl: './sale-pie-chart.component.html'
})
export class SalePieChartComponent {
  isOpen = false;

  public series: ApexNonAxisChartSeries = [900, 700, 850];

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'donut',
    width: 280,
    height: 280
  };

  public colors: string[] = ['#3641f5', '#7592ff', '#dde9ff'];
  public labels: string[] = ['Affiliate', 'Direct', 'Adsense'];

  public stroke: ApexStroke = {
    show: false,
    width: 4
  };

  public plotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '65%',
        background: 'transparent',
        labels: {
          show: true,
          name: {
            show: true,
            offsetY: 0,
            color: '#1D2939',
            fontSize: '12px',
            fontWeight: 'normal',
            formatter: () => 'Total 3.5K'
          },
          value: {
            show: true,
            offsetY: 10,
            color: '#667085',
            fontSize: '14px',
            formatter: () => 'Used of 1.1K'
          },
          total: {
            show: true,
            label: 'Total',
            color: '#000000',
            fontSize: '20px',
            fontWeight: 'bold'
          }
        }
      }
    }
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
  public legend: ApexLegend = { show: false };

  public responsive: ApexResponsive[] = [
    {
      breakpoint: 640,
      options: { chart: { width: 280, height: 280 } }
    },
    {
      breakpoint: 2600,
      options: { chart: { width: 240, height: 240 } }
    }
  ];

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}