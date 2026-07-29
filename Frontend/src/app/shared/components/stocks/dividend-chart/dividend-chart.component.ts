
import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  ApexAxisChartSeries, ApexChart, ApexFill, ApexStroke, ApexGrid,
  ApexDataLabels, ApexTooltip, ApexXAxis, ApexYAxis, ApexLegend, ApexPlotOptions
} from 'ng-apexcharts';

@Component({
  selector: 'app-dividend-chart',
  imports: [
    DropdownComponent,
    DropdownItemComponent,
    NgApexchartsModule
],
  templateUrl: './dividend-chart.component.html',
  styles: ``
})
export class DividendChartComponent {

  public series: ApexAxisChartSeries = [
    {
      name: "Sales",
      data: [168, 385, 201, 298, 187, 195],
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
      columnWidth: "39%",
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
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
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

  // Dropdown logic (optional, for UI parity)
  public isOpen = false;
  toggleDropdown() { this.isOpen = !this.isOpen; }
  closeDropdown() { this.isOpen = false; }
}
