import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { AccountMenuDropdownComponent } from '../../../shared/components/ui/dropdown/account-menu-dropdown/account-menu-dropdown.component';
import { DropdownWithDividerComponent } from '../../../shared/components/ui/dropdown/dropdown-with-divider/dropdown-with-divider.component';
import { DropdownWithIconComponent } from '../../../shared/components/ui/dropdown/dropdown-with-icon/dropdown-with-icon.component';
import { DropdownWithIconAndDividerComponent } from '../../../shared/components/ui/dropdown/dropdown-with-icon-and-divider/dropdown-with-icon-and-divider.component';

@Component({
  selector: 'app-dropdowns',
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    AccountMenuDropdownComponent,
    DropdownWithDividerComponent,
    DropdownWithIconComponent,
    DropdownWithIconAndDividerComponent,
  ],
  templateUrl: './dropdowns.component.html',
  styles: ``
})
export class DropdownsComponent {

}
