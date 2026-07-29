import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-traffic-source',
  imports: [CommonModule,DropdownComponent,DropdownItemComponent],
  templateUrl: './traffic-source.component.html',
  styles: ``
})
export class TrafficSourceComponent {

  isOpen = false;

  sources = [
    { name: 'Google', image: '/images/brand/brand-05.svg', percent: 79 },
    { name: 'Youtube', image: '/images/brand/brand-06.svg', percent: 55 },
    { name: 'Facebook', image: '/images/brand/brand-02.svg', percent: 48 },
    { name: 'Instagram', image: '/images/brand/brand-04.svg', percent: 48 },
  ];

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
