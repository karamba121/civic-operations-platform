import { Component, Input } from '@angular/core';
import { AddIntegrationModalComponent } from './../add-integration-modal/add-integration-modal.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-integration-breadcrumb',
  imports: [
    AddIntegrationModalComponent,
    RouterModule,
  ],
  templateUrl: './integration-breadcrumb.component.html',
  styles: ``
})
export class IntegrationBreadcrumbComponent {

  @Input() pageTitle: string = '';
}
