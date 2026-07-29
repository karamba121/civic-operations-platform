
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-update-notification',
  imports: [],
  templateUrl: './update-notification.component.html',
  styles: ``
})
export class UpdateNotificationComponent {

  @Input() title!: string;
  @Input() message!: string;
  @Output() laterClick = new EventEmitter<void>();
  @Output() updateClick = new EventEmitter<void>();

  onLaterClick() {
    this.laterClick.emit();
  }

  onUpdateClick() {
    this.updateClick.emit();
  }
}
