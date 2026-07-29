import { Component } from '@angular/core';
import { DefaultTooltipComponent } from '../../../shared/components/ui/tooltip/default-tooltip/default-tooltip.component';
import { TooltipPlacementComponent } from '../../../shared/components/ui/tooltip/tooltip-placement/tooltip-placement.component';
import { WhiteAndDarkTooltipComponent } from '../../../shared/components/ui/tooltip/white-and-dark-tooltip/white-and-dark-tooltip.component';
import { ComponentCardComponent } from './../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from './../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-tooltips',
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    DefaultTooltipComponent,
    WhiteAndDarkTooltipComponent,
    TooltipPlacementComponent
  ],
  templateUrl: './tooltips.component.html',
  styles: ``
})
export class TooltipsComponent {

}
