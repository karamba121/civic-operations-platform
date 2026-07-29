import { Component } from '@angular/core';
import { EmailSidebarComponent } from '../../../shared/components/email/email-sidebar/email-sidebar/email-sidebar.component';
import { EmailWrapperComponent } from '../../../shared/components/email/email-details/email-wrapper/email-wrapper.component';

@Component({
  selector: 'app-email-details',
  imports: [
    EmailSidebarComponent,
    EmailWrapperComponent,
  ],
  templateUrl: './email-details.component.html',
  styles: ``
})
export class EmailDetailsComponent {

}
