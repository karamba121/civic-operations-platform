import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as maplibregl from 'maplibre-gl';

@Component({
  selector: 'app-map-one',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-one.component.html',
  styles: [':host { display: block; }']
})
export class MapOneComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  private map?: maplibregl.Map;

  ngOnInit() {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [-77.0369, 38.9072], // Washington D.C. [lng, lat]
      zoom: 8.5,
      scrollZoom: false,
      attributionControl: false,
    });
  }

  zoomIn() {
    this.map?.zoomIn();
  }

  zoomOut() {
    this.map?.zoomOut();
  }

  ngOnDestroy() {
    this.map?.remove();
  }
}
