import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ticket-reply-content',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './ticket-reply-content.component.html',
  styles: ``
})
export class TicketReplyContentComponent {

  selected: string = 'in-progress';

  options = [
    { label: 'In-Progress', value: 'in-progress' },
    { label: 'Solved', value: 'solved' },
    { label: 'On-Hold', value: 'on-hold' },
  ];

  getSelectedClass (value: string): string {
    return this.selected === value ? 'bg-white' : 'bg-white dark:bg-[#171f2e]';
  }
}
