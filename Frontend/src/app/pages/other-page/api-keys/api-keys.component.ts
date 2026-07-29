import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ApiKeyTableComponent } from '../../../shared/components/api-keys/api-key-table/api-key-table.component';

@Component({
  selector: 'app-api-keys',
  imports: [
    PageBreadcrumbComponent,
    ApiKeyTableComponent,
  ],
  templateUrl: './api-keys.component.html',
  styles: ``
})
export class ApiKeysComponent {

}
