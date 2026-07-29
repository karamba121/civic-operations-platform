
import { Component } from '@angular/core';
import { LabelListComponent } from '../label-list/label-list.component';
import { FilterListComponent } from '../filter-list/filter-list.component';
import { MailBoxComponent } from '../mail-box/mail-box.component';

@Component({
  selector: 'app-email-sidebar',
  imports: [
    LabelListComponent,
    FilterListComponent,
    MailBoxComponent
],
  templateUrl: './email-sidebar.component.html',
  styles: ``
})
export class EmailSidebarComponent {

}
