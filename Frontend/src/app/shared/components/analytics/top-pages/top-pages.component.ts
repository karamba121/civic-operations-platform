
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-top-pages',
  imports: [RouterModule, DropdownComponent, DropdownItemComponent],
  templateUrl: './top-pages.component.html',
  styles: ``
})
export class TopPagesComponent {

  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  pages = [
    { name: 'tailadmin.com', pageview: '4.7K' },
    { name: 'preview.tailadmin.com', pageview: '3.4K' },
    { name: 'docs.tailadmin.com', pageview: '2.9K' },
    { name: 'tailadmin.com/componetns', pageview: '1.5K' },
  ];
}
