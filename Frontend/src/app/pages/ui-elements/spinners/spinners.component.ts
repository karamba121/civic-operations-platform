import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { SpinnerFourComponent } from '../../../shared/components/ui/spinner/spinner-four/spinner-four.component';
import { SpinnerOneComponent } from '../../../shared/components/ui/spinner/spinner-one/spinner-one.component';
import { SpinnerThreeComponent } from '../../../shared/components/ui/spinner/spinner-three/spinner-three.component';
import { SpinnerTwoComponent } from '../../../shared/components/ui/spinner/spinner-two/spinner-two.component';
import { PageBreadcrumbComponent } from './../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-spinners',
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    SpinnerOneComponent,
    SpinnerTwoComponent,
    SpinnerThreeComponent,
    SpinnerFourComponent,
  ],
  templateUrl: './spinners.component.html',
  styles: ``
})
export class SpinnersComponent {

}
