
import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-delivery-vehicle',
  imports: [
    DropdownComponent,
    DropdownItemComponent
],
  templateUrl: './delivery-vehicle.component.html',
  styles: ``
})
export class DeliveryVehicleComponent {

  isOpen: boolean = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
