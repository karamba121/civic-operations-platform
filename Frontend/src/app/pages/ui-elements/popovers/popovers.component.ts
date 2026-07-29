import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { DefaultPopoverComponent } from '../../../shared/components/ui/popover/default-popover/default-popover.component';
import { PopoverButtonComponent } from '../../../shared/components/ui/popover/popover-button/popover-button.component';
import { PopoverWithLinkComponent } from '../../../shared/components/ui/popover/popover-with-link/popover-with-link.component';

@Component({
  selector: 'app-popovers',
  imports: [
    ComponentCardComponent,
    PageBreadcrumbComponent,
    DefaultPopoverComponent,
    PopoverButtonComponent,
    PopoverWithLinkComponent,
  ],
  templateUrl: './popovers.component.html',
  styles: ``
})
export class PopoversComponent {

}
