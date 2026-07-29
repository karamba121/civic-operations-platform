
import { Component } from '@angular/core';
import { EmailDetailsHeaderComponent } from '../email-details-header/email-details-header.component';
import { EmailDetailsBottomComponent } from '../email-details-bottom/email-details-bottom.component';

@Component({
  selector: 'app-email-wrapper',
  imports: [
    EmailDetailsHeaderComponent,
    EmailDetailsBottomComponent
],
  templateUrl: './email-wrapper.component.html',
  styles: ``
})
export class EmailWrapperComponent {

}
