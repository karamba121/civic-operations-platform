import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CountryMapComponent } from '../../ecommerce/country-map/country-map.component';

@Component({
  selector: 'app-sale-by-country',
  imports: [CommonModule, DropdownComponent, DropdownItemComponent, CountryMapComponent],
  templateUrl: './sale-by-country.component.html',
})
export class SaleByCountryComponent {
  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  countries = [
    {
      name: 'USA',
      sales: '$20.594',
      percent: '79%',
      img: 'images/flag/flag-01.png',
      alt: 'flag',
    },
    {
      name: 'France',
      sales: '$20.594',
      percent: '779%',
      img: 'images/flag/flag-02.png',
      alt: 'flag',
    },
    {
      name: 'Japan',
      sales: '$15.230',
      percent: '68%',
      img: 'images/flag/flag-03.png',
      alt: 'flag',
    },
    {
      name: 'Germany',
      sales: '$16.450',
      percent: '72%',
      img: 'images/flag/flag-04.png',
      alt: 'flag',
    },
  ];
}
