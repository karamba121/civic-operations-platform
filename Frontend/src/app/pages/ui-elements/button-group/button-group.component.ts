import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { PrimaryButtonGroupComponent } from '../../../shared/components/ui/buttons-group/primary-button-group/primary-button-group.component';
import { SecondaryButtonGroupComponent } from '../../../shared/components/ui/buttons-group/secondary-button-group/secondary-button-group.component';
import { SecondaryButtonGroupWithLeftIconComponent } from '../../../shared/components/ui/buttons-group/secondary-button-group-with-left-icon/secondary-button-group-with-left-icon.component';
import { SecondaryButtonGroupWithRightIconComponent } from '../../../shared/components/ui/buttons-group/secondary-button-group-with-right-icon/secondary-button-group-with-right-icon.component';
import { ButtonGroupWithLeftIconComponent } from '../../../shared/components/ui/buttons-group/button-group-with-left-icon/button-group-with-left-icon.component';
import { ButtonGroupWithRightIconComponent } from '../../../shared/components/ui/buttons-group/button-group-with-right-icon/button-group-with-right-icon.component';

@Component({
  selector: 'app-button-group',
  imports: [
    ComponentCardComponent,
    PageBreadcrumbComponent,
    PrimaryButtonGroupComponent,
    SecondaryButtonGroupComponent,
    SecondaryButtonGroupWithLeftIconComponent,
    SecondaryButtonGroupWithRightIconComponent,
    ButtonGroupWithLeftIconComponent,
    ButtonGroupWithRightIconComponent
  ],
  templateUrl: './button-group.component.html',
  styles: ``
})
export class ButtonGroupComponent {

}
