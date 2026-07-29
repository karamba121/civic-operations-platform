import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { DefaultModalComponent } from '../../../shared/components/ui-example/modal-example/default-modal/default-modal.component';
import { VerticallyCenteredModalComponent } from '../../../shared/components/ui-example/modal-example/vertically-centered-modal/vertically-centered-modal.component';
import { FormInModalComponent } from '../../../shared/components/ui-example/modal-example/form-in-modal/form-in-modal.component';
import { FullScreenModalComponent } from '../../../shared/components/ui-example/modal-example/full-screen-modal/full-screen-modal.component';
import { ModalBasedAlertsComponent } from '../../../shared/components/ui-example/modal-example/modal-based-alerts/modal-based-alerts.component';

@Component({
  selector: 'app-modals',
  imports: [
    PageBreadcrumbComponent,
    DefaultModalComponent,
    VerticallyCenteredModalComponent,
    FormInModalComponent,
    FullScreenModalComponent,
    ModalBasedAlertsComponent,
  ],
  templateUrl: './modals.component.html',
  styles: ``
})
export class ModalsComponent {

}
