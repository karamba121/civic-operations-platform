
import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-chat-box-header',
  imports: [
    DropdownComponent,
    DropdownItemComponent
],
  templateUrl: './chat-box-header.component.html',
  styles: ``
})
export class ChatBoxHeaderComponent {

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }
}
