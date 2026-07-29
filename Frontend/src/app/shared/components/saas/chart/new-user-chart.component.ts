
import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexStroke,
  ApexTooltip,
  ApexMarkers,
  ApexGrid,
  ApexDataLabels,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  NgApexchartsModule
} from 'ng-apexcharts';

@Component({
  selector: 'app-new-user-chart',
  imports: [
    NgApexchartsModule
],
  template: `
    <div class="-ml-3">
      <apx-chart
        [series]="series"
        [chart]="chart"
        [colors]="colors"
        [stroke]="stroke"
        [fill]="fill"
        [markers]="markers"
        [grid]="grid"
        [dataLabels]="dataLabels"
        [tooltip]="tooltip"
        [xaxis]="xaxis"
        [yaxis]="yaxis"
        [legend]="legend"
      ></apx-chart>
    </div>
  `,
  styles: ``
})
export class NewUserChartComponent {

  public series: ApexAxisChartSeries = [
    {
      name: "Sales",
      data: [180, 190, 170, 160, 175, 165, 170],
    },
    {
      name: "Revenue",
      data: [40, 30, 50, 40, 55, 40, 100],
    },
  ];

  public chart: ApexChart = {
    fontFamily: "Outfit, sans-serif",
    height: 200,
    type: "area",
    toolbar: { show: false },
    zoom: { enabled: false }
  };

  public colors: string[] = ["#465FFF", "#9CB9FF"];

  public stroke: ApexStroke = {
    curve: "straight",
    width: [2, 2]
  };

  public fill: ApexFill = {
    type: "gradient",
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0,
    }
  };

  public markers: ApexMarkers = {
    size: 0,
    strokeColors: "#fff",
    strokeWidth: 2,
    hover: { size: 6 }
  };

  public grid: ApexGrid = {
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } }
  };

  public dataLabels: ApexDataLabels = { enabled: false };

  public tooltip: ApexTooltip = {
    enabled: true,
    x: { format: "dd MMM yyyy" }
  };

  public xaxis: ApexXAxis = {
    type: "category",
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false }
  };

  public yaxis: ApexYAxis = {
    labels: {
      style: {
        fontSize: "12px",
        colors: ["#6B7280"]
      }
    },
    title: {
      text: "",
      style: { fontSize: "0px" }
    }
  };

  public legend: ApexLegend = {
    show: false,
    position: "top",
    horizontalAlign: "left"
  };
}
