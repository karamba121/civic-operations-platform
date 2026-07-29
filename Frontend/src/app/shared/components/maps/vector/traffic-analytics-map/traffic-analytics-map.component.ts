import * as am5 from "@amcharts/amcharts5";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import * as am5map from "@amcharts/amcharts5/map";
import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-traffic-analytics-map',
  imports: [CommonModule],
  templateUrl: './traffic-analytics-map.component.html',
  styles: [':host { display: block; }']
})
export class TrafficAnalyticsMapComponent implements OnInit, OnDestroy {
  @ViewChild('chartdiv', { static: true }) chartdiv!: ElementRef;
  root!: am5.Root;
  private chart?: am5map.MapChart;

  constructor(private zone: NgZone) { }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.root = am5.Root.new(this.chartdiv.nativeElement);
      
      // Remove amCharts watermark
      if ((this.root as any)._logo) {
        (this.root as any)._logo.dispose();
      }

      this.chart = this.root.container.children.push(
        am5map.MapChart.new(this.root, {
          panX: "none",
          panY: "none",
          wheelX: "none",
          wheelY: "none",
          projection: am5map.geoMercator(),
        })
      );

      let polygonSeries = this.chart.series.push(
        am5map.MapPolygonSeries.new(this.root, {
          geoJSON: am5geodata_worldLow,
          exclude: ["AQ"],
        })
      );

      polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        interactive: true,
        fill: am5.color(0xC5D8FF), // Light base blue color
        stroke: am5.color(0xffffff),
        strokeWidth: 0.5,
        templateField: "polygonSettings",
      });

      polygonSeries.mapPolygons.template.states.create("hover", {
        fill: am5.color(0x465FFF),
      });

      // Shaded traffic country colors
      polygonSeries.data.setAll([
        { id: "US", polygonSettings: { fill: am5.color(0x3538CD) } },
        { id: "CA", polygonSettings: { fill: am5.color(0x8098F9) } },
        { id: "CN", polygonSettings: { fill: am5.color(0x8098F9) } },
        { id: "FR", polygonSettings: { fill: am5.color(0x9CB9FF) } },
        { id: "BR", polygonSettings: { fill: am5.color(0x9CB9FF) } },
        { id: "RU", polygonSettings: { fill: am5.color(0x9CB9FF) } },
        { id: "AU", polygonSettings: { fill: am5.color(0xADC6FF) } },
      ]);
    });
  }

  zoomIn() {
    this.chart?.zoomIn();
  }

  zoomOut() {
    this.chart?.zoomOut();
  }

  ngOnDestroy() {
    this.root?.dispose();
  }
}
