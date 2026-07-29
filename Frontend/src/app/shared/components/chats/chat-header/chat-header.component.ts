
import { Component, EventEmitter, Output } from '@angular/core';
import { ChatHeaderTitleComponent } from '../chat-header-title/chat-header-title.component';

@Component({
  selector: 'app-chat-header',
  imports: [
    ChatHeaderTitleComponent
],
  templateUrl: './chat-header.component.html',
  styles: ``
})
export class ChatHeaderComponent {

  @Output() toggle = new EventEmitter<void>();

  onToggleClick(): void {
    this.toggle.emit();
  }
}
