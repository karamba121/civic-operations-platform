import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { FilledRibbonsComponent } from '../../../shared/components/ui/ribbons/filled-ribbons/filled-ribbons.component';
import { RibbonWithHoverComponent } from '../../../shared/components/ui/ribbons/ribbon-with-hover/ribbon-with-hover.component';
import { RibbonWithShapeComponent } from '../../../shared/components/ui/ribbons/ribbon-with-shape/ribbon-with-shape.component';
import { RoundedRibbonComponent } from '../../../shared/components/ui/ribbons/rounded-ribbon/rounded-ribbon.component';
import { PageBreadcrumbComponent } from './../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-ribbons',
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    RibbonWithHoverComponent,
    RibbonWithShapeComponent,
    RoundedRibbonComponent,
    FilledRibbonsComponent,
  ],
  templateUrl: './ribbons.component.html',
  styles: ``
})
export class RibbonsComponent {

}
