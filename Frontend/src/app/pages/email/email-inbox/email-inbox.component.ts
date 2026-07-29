import { Component } from '@angular/core';
import { EmailSidebarComponent } from '../../../shared/components/email/email-sidebar/email-sidebar/email-sidebar.component';
import { EmailContentComponent } from '../../../shared/components/email/email-inbox/email-content/email-content.component';

@Component({
  selector: 'app-email-inbox',
  imports: [
    EmailSidebarComponent,
    EmailContentComponent,
  ],
  templateUrl: './email-inbox.component.html',
  styles: ``
})
export class EmailInboxComponent {

}
