
import { Component, Input } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-folder-card',
  imports: [
    DropdownComponent,
    DropdownItemComponent
],
  templateUrl: './folder-card.component.html',
  styles: ``
})
export class FolderCardComponent {

  @Input() title: string = '';
  @Input() fileCount: string = '';
  @Input() size: string = '';

  isOpen: boolean = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
