
import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-chat-header-title',
  imports: [
    DropdownComponent,
    DropdownItemComponent
],
  templateUrl: './chat-header-title.component.html',
  styles: ``
})
export class ChatHeaderTitleComponent {

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }
}
