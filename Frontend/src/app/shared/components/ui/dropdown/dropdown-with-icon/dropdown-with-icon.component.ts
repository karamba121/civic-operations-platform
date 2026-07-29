import { Component } from '@angular/core';
import { DropdownItemComponent } from '../dropdown-item/dropdown-item.component';
import { DropdownComponent } from './../dropdown.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown-with-icon',
  imports: [
    CommonModule,
    DropdownComponent,
    DropdownItemComponent,
  ],
  templateUrl: './dropdown-with-icon.component.html',
  styles: ``
})
export class DropdownWithIconComponent {

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }
}
