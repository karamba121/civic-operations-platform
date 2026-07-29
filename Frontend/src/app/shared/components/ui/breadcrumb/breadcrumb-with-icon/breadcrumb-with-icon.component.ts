import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../common/component-card/component-card.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumb-with-icon',
  imports: [
    ComponentCardComponent,
    RouterModule,
  ],
  templateUrl: './breadcrumb-with-icon.component.html',
  styles: ``
})
export class BreadcrumbWithIconComponent {

}
