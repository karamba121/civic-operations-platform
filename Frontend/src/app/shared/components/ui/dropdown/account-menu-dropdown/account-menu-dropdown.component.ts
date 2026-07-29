import { Component } from '@angular/core';
import { DropdownItemComponent } from '../dropdown-item/dropdown-item.component';
import { DropdownComponent } from './../dropdown.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-menu-dropdown',
  imports: [
    CommonModule,
    DropdownComponent,
    DropdownItemComponent,
  ],
  templateUrl: './account-menu-dropdown.component.html',
  styles: ``
})
export class AccountMenuDropdownComponent {

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }
}
