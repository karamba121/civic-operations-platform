
import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexStroke,
  ApexTooltip,
  ApexPlotOptions,
  ApexXAxis,
  ApexLegend,
  ApexGrid,
  ApexDataLabels,
  ApexYAxis,
  NgApexchartsModule
} from 'ng-apexcharts';

@Component({
  selector: 'app-daily-sale-chart',
  imports: [
    NgApexchartsModule
],
  template: `
    <div class="-ml-3">
      <apx-chart
        [series]="series"
        [chart]="chart"
        [colors]="colors"
        [plotOptions]="plotOptions"
        [dataLabels]="dataLabels"
        [stroke]="stroke"
        [xaxis]="xaxis"
        [legend]="legend"
        [yaxis]="yaxis"
        [grid]="grid"
        [fill]="fill"
        [tooltip]="tooltip"
      ></apx-chart>
    </div>
  `,
  styles: ``
})
export class DailySaleChartComponent {

  public series: ApexAxisChartSeries = [
    {
      name: "Sales",
      data: [168, 385, 201, 298, 187, 195, 160],
    }
  ];

  public chart: ApexChart = {
    fontFamily: "Outfit, sans-serif",
    type: "bar",
    height: 200,
    toolbar: { show: false }
  };

  public colors: string[] = ["#465fff"];
  public plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: "50%",
      borderRadius: 5,
      borderRadiusApplication: "end"
    }
  };
  public dataLabels: ApexDataLabels = { enabled: false };
  public stroke: ApexStroke = {
    show: true,
    width: 4,
    colors: ["transparent"]
  };
  public xaxis: ApexXAxis = {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    axisBorder: { show: false },
    axisTicks: { show: false }
  };
  public legend: ApexLegend = {
    show: true,
    position: "top",
    horizontalAlign: "left",
    fontFamily: "Outfit"
  };
  public yaxis: ApexYAxis = {
    title: { text: undefined }
  };
  public grid: ApexGrid = {
    yaxis: { lines: { show: true } }
  };
  public fill: ApexFill = { opacity: 1 };
  public tooltip: ApexTooltip = {
    x: { show: false },
    y: {
      formatter: (val: number) => `${val}`
    }
  };
}
