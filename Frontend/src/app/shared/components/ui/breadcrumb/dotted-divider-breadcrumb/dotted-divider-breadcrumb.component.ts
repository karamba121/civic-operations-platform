import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../common/component-card/component-card.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dotted-divider-breadcrumb',
  imports: [
    ComponentCardComponent,
    RouterModule,
  ],
  templateUrl: './dotted-divider-breadcrumb.component.html',
  styles: ``
})
export class DottedDividerBreadcrumbComponent {

}
