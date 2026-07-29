import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { MapOneComponent } from '../../../shared/components/maps/map-one/map-one.component';
import { MapThreeComponent } from '../../../shared/components/maps/map-three/map-three.component';
import { MapTwoComponent } from '../../../shared/components/maps/map-two/map-two.component';

@Component({
  selector: 'app-maps',
  imports: [
    MapOneComponent,
    MapTwoComponent,
    MapThreeComponent,
    PageBreadcrumbComponent
  ],
  templateUrl: './maps.component.html',
})
export class MapsComponent {

}
