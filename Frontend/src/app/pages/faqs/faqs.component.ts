import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { FaqsOneComponent } from '../../shared/components/ui-example/faqs-example/faqs-one/faqs-one.component';
import { FaqsTwoComponent } from '../../shared/components/ui-example/faqs-example/faqs-two/faqs-two.component';
import { FaqsThreeComponent } from '../../shared/components/ui-example/faqs-example/faqs-three/faqs-three.component';

@Component({
  selector: 'app-faqs',
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    FaqsOneComponent,
    FaqsTwoComponent,
    FaqsThreeComponent,
  ],
  templateUrl: './faqs.component.html',
  styles: ``
})
export class FaqsComponent {

}
