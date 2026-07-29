import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BreadcrumbWithIconComponent } from '../../../shared/components/ui/breadcrumb/breadcrumb-with-icon/breadcrumb-with-icon.component';
import { AngelDividerBreadcrumbComponent } from '../../../shared/components/ui/breadcrumb/angel-divider-breadcrumb/angel-divider-breadcrumb.component';
import { DottedDividerBreadcrumbComponent } from '../../../shared/components/ui/breadcrumb/dotted-divider-breadcrumb/dotted-divider-breadcrumb.component';
import { DefaultBreadcrumbExampleComponent } from '../../../shared/components/ui/breadcrumb/default-breadcrumb-example/default-breadcrumb-example.component';

@Component({
  selector: 'app-breadcrumb',
  imports: [
    PageBreadcrumbComponent,
    BreadcrumbWithIconComponent,
    AngelDividerBreadcrumbComponent,
    DottedDividerBreadcrumbComponent,
    DefaultBreadcrumbExampleComponent
  ],
  templateUrl: './breadcrumb.component.html',
  styles: ``
})
export class BreadcrumbComponent {

}
