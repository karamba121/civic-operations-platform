import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { DefaultProgressbarExampleComponent } from '../../../shared/components/ui/progress-bar/default-progressbar-example/default-progressbar-example.component';
import { ProgressbarInMultipleSizesComponent } from '../../../shared/components/ui/progress-bar/progressbar-in-multiple-sizes/progressbar-in-multiple-sizes.component';
import { ProgressbarWithInsideLabelComponent } from '../../../shared/components/ui/progress-bar/progressbar-with-inside-label/progressbar-with-inside-label.component';
import { ProgressbarWithOutsideLabelComponent } from '../../../shared/components/ui/progress-bar/progressbar-with-outside-label/progressbar-with-outside-label.component';

@Component({
  selector: 'app-progress-bar',
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    DefaultProgressbarExampleComponent,
    ProgressbarInMultipleSizesComponent,
    ProgressbarWithInsideLabelComponent,
    ProgressbarWithOutsideLabelComponent,
  ],
  templateUrl: './progress-bar.component.html',
  styles: ``
})
export class ProgressBarComponent {

}
