import * as am5 from "@amcharts/amcharts5";
import am5geodata_usaLow from "@amcharts/amcharts5-geodata/usaLow";
import * as am5map from "@amcharts/amcharts5/map";
import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-customer-pin-point-map',
  imports: [CommonModule],
  templateUrl: './customer-pin-point-map.component.html',
  styles: [':host { display: block; }']
})
export class CustomerPinPointMapComponent implements OnInit, OnDestroy {
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
          projection: am5map.geoAlbersUsa(),
        })
      );

      let polygonSeries = this.chart.series.push(
        am5map.MapPolygonSeries.new(this.root, {
          geoJSON: am5geodata_usaLow,
        })
      );

      polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        interactive: true,
        fill: am5.color(0xC5D8FF), // USA map fill
        stroke: am5.color(0xffffff),
        strokeWidth: 2,
      });

      polygonSeries.mapPolygons.template.states.create("hover", {
        fill: am5.color(0x465FFF),
      });

      // Add blue dot markers
      let pointSeries = this.chart.series.push(
        am5map.MapPointSeries.new(this.root, {})
      );

      const markers = [
        { name: "Los Angeles", lat: 34.05, lon: -118.24 },
        { name: "New York", lat: 40.71, lon: -74.0, radius: 8 },
        { name: "Chicago", lat: 41.87, lon: -87.62 },
        { name: "Houston", lat: 29.76, lon: -95.36 },
        { name: "Denver", lat: 39.73, lon: -104.99 },
        { name: "Seattle", lat: 47.6, lon: -122.33 },
        { name: "Miami", lat: 25.76, lon: -80.19 },
        { name: "Atlanta", lat: 33.74, lon: -84.38 },
        { name: "Philadelphia", lat: 39.95, lon: -75.16 },
        { name: "Boston", lat: 42.36, lon: -71.05 },
        { name: "Nashville", lat: 36.16, lon: -86.78 },
        { name: "Dallas", lat: 32.77, lon: -96.79 },
        { name: "Minneapolis", lat: 44.97, lon: -93.26 },
        { name: "Washington D.C.", lat: 38.9, lon: -77.03, radius: 6 },
        { name: "San Francisco", lat: 37.77, lon: -122.41 },
        { name: "Las Vegas", lat: 36.1, lon: -115.17 },
        { name: "Phoenix", lat: 33.44, lon: -112.07 },
        { name: "San Antonio", lat: 29.42, lon: -98.49 },
      ];

      markers.forEach(m => {
        pointSeries.pushDataItem({
          latitude: m.lat,
          longitude: m.lon,
        });

        pointSeries.bullets.push(() =>
          am5.Bullet.new(this.root, {
            sprite: am5.Circle.new(this.root, {
              radius: m.radius || 5,
              fill: am5.color(0x465FFF),
              stroke: am5.color(0xffffff),
              strokeWidth: 2,
              tooltipText: m.name
            })
          })
        );
      });
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
