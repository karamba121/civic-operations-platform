import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../common/component-card/component-card.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-default-breadcrumb-example',
  imports: [
    ComponentCardComponent,
    RouterModule,
  ],
  templateUrl: './default-breadcrumb-example.component.html',
  styles: ``
})
export class DefaultBreadcrumbExampleComponent {

}
