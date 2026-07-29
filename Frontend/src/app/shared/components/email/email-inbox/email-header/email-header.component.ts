import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DropdownComponent } from '../../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../ui/dropdown/dropdown-item/dropdown-item.component';
import { CheckboxComponent } from '../../../form/input/checkbox.component';

@Component({
  selector: 'app-email-header',
  imports: [
    CommonModule,
    DropdownComponent,
    DropdownItemComponent,
    CheckboxComponent
  ],
  templateUrl: './email-header.component.html',
  styles: ``
})
export class EmailHeaderComponent {

  @Input() isChecked: boolean = false;
  @Output() onSelectAll = new EventEmitter<boolean>();
  
  isOpen = false;
  isOpenTwo = false;

  handleCheckboxChange(checked: boolean) {
    this.onSelectAll.emit(checked);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  toggleDropdownTwo() {
    this.isOpenTwo = !this.isOpenTwo;
  }

  closeDropdownTwo() {
    this.isOpenTwo = false;
  }

}
