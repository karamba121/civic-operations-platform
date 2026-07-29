import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { SlideOnlyComponent } from '../../../shared/components/ui/carousel/slide-only/slide-only.component';
import { WithControlComponent } from '../../../shared/components/ui/carousel/with-control/with-control.component';
import { WithIndicatorsComponent } from '../../../shared/components/ui/carousel/with-indicators/with-indicators.component';
import { WithControlAndIndicatorsComponent } from '../../../shared/components/ui/carousel/with-control-and-indicators/with-control-and-indicators.component';

@Component({
  selector: 'app-carousel',
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    SlideOnlyComponent,
    WithControlComponent,
    WithIndicatorsComponent,
    WithControlAndIndicatorsComponent,
  ],
  templateUrl: './carousel.component.html',
  styles: ``
})
export class CarouselComponent {

}
