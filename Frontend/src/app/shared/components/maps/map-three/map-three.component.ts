import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-three',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-three.component.html',
  styles: [':host { display: block; }']
})
export class MapThreeComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  private map?: L.Map;

  ngOnInit() {
    const homeLatLng: L.LatLngTuple = [40.765, -74.45];
    const officeLatLng: L.LatLngTuple = [40.78, -74.41];

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [40.772, -74.43],
      zoom: 13,
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    ).addTo(this.map);

    const makeIcon = (label: string, svgPath: string) =>
      L.divIcon({
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="
              width:40px;height:40px;border-radius:50%;
              border:1px solid #c7d7fe;
              background:#eff4ff;color:#3538CD;
              display:flex;align-items:center;justify-content:center;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>
            </div>
            <div style="
              margin-top:6px;background:#fff;color:#1d2939;
              border-radius:999px;padding:2px 10px;font-size:11px;
              font-weight:500;box-shadow:0 2px 8px rgba(0,0,0,0.12);
              white-space:nowrap;
            ">${label}</div>
          </div>
        `,
        className: '',
        iconSize: [60, 80],
        iconAnchor: [30, 40],
      });

    const homeSvg = '<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><polyline points="9 22 9 12 15 12 15 22"/>';
    const officeSvg = '<rect x="2" y="7" width="20" height="15" rx="1"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12.01"/>';

    L.marker(homeLatLng, { icon: makeIcon('Home', homeSvg) }).addTo(this.map);
    L.marker(officeLatLng, { icon: makeIcon('Office', officeSvg) }).addTo(this.map);
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
