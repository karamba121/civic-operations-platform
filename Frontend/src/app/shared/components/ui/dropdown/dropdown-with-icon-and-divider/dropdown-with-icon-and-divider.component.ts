import { Component } from '@angular/core';
import { DropdownItemComponent } from '../dropdown-item/dropdown-item.component';
import { DropdownComponent } from './../dropdown.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown-with-icon-and-divider',
  imports: [
    CommonModule,
    DropdownComponent,
    DropdownItemComponent,
  ],
  templateUrl: './dropdown-with-icon-and-divider.component.html',
  styles: ``
})
export class DropdownWithIconAndDividerComponent {

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }
}
