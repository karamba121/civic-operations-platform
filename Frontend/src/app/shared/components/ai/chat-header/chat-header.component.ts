import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClickOutsideDirective } from '../../../directive/click-outside.directive';

@Component({
  selector: 'app-chat-header',
  imports: [ClickOutsideDirective],
  templateUrl: './chat-header.component.html',
  styles: ``
})
export class ChatHeaderComponent {
  @Input() title: string = 'Generate responsive login';
  @Output() openShare = new EventEmitter<void>();

  openDropDown = false;
  selectedAction = 'Remove Starred';

  toggleDropDown() {
    this.openDropDown = !this.openDropDown;
  }

  closeDropDown() {
    this.openDropDown = false;
  }

  toggleAction() {
    this.selectedAction = this.selectedAction === 'Remove Starred' ? 'Add Starred' : 'Remove Starred';
  }
}
