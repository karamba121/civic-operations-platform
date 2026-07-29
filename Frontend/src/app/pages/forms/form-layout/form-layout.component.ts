import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from './../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BasicFormComponent } from '../../../shared/components/form/example-form/basic-form/basic-form.component';
import { ExampleFormOneComponent } from '../../../shared/components/form/example-form/example-form-one/example-form-one.component';
import { ExampleFormWithIconComponent } from '../../../shared/components/form/example-form/example-form-with-icon/example-form-with-icon.component';
import { ExampleFormTwoComponent } from '../../../shared/components/form/example-form/example-form-two/example-form-two.component';

@Component({
  selector: 'app-form-layout',
  imports: [
    PageBreadcrumbComponent,
    BasicFormComponent,
    ExampleFormOneComponent,
    ExampleFormWithIconComponent,
    ExampleFormTwoComponent,
  ],
  templateUrl: './form-layout.component.html',
  styles: ``
})
export class FormLayoutComponent {

}
