import { Component } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexPlotOptions,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexDataLabels,
  ApexStates
} from 'ng-apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';


@Component({
  selector: 'app-pie-chart-one',
  imports: [
    NgApexchartsModule
],
  templateUrl: './pie-chart-one.component.html',
  styles: ``
})
export class PieChartOneComponent {

  public series: ApexNonAxisChartSeries = [45, 65, 25];

  public chart: ApexChart = {
    type: 'donut',
    width: 445,
    height: 290,
    fontFamily: 'Outfit, sans-serif',
  };

  public labels: string[] = ['Desktop', 'Mobile', 'Tablet'];

  public colors: string[] = ['#3641f5', '#7592ff', '#dde9ff'];

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

  public states: ApexStates = {
    hover: {
      filter: {
        type: 'none',
      },
    },
    active: {
      allowMultipleDataPointsSelection: false,
      filter: {
        type: 'darken',
      },
    },
  };

  public dataLabels: ApexDataLabels = {
    enabled: false,
  };

  public tooltip: ApexTooltip = {
    enabled: false,
  };

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
}
