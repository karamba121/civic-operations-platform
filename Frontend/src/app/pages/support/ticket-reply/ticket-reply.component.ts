import { Component } from '@angular/core';
import { TicketReplyContentComponent } from '../../../shared/components/support/ticket-reply-content/ticket-reply-content.component';
import { TicketDetailsComponent } from '../../../shared/components/support/ticket-details/ticket-details.component';

@Component({
  selector: 'app-ticket-reply',
  imports: [
    TicketReplyContentComponent,
    TicketDetailsComponent,
  ],
  templateUrl: './ticket-reply.component.html',
  styles: ``
})
export class TicketReplyComponent {

}
