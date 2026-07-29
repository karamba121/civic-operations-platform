import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-activities-card',
  imports: [
    CommonModule,
    DropdownComponent,
    DropdownItemComponent
  ],
  templateUrl: './activities-card.component.html',
  styles: ``
})
export class ActivitiesCardComponent {

  isOpen = false;

  activities = [
    {
      user: 'Francisco Grbbs',
      avatar: '/images/user/user-01.jpg',
      action: 'created invoice',
      invoice: 'PQ-4491C',
      time: 'Just Now',
      highlight: true,
      highlightText: 'New invoice',
      highlightIcon: 'M9 5.0625H14.0625L12.5827 8.35084C12.4506 8.64443 12.4506 8.98057 12.5827 9.27416L14.0625 12.5625H10.125C9.50368 12.5625 9 12.0588 9 11.4375V10.875M3.9375 10.875H9M3.9375 3.375H7.875C8.49632 3.375 9 3.87868 9 4.5V10.875M3.9375 15.9375V2.0625',
      highlightColor: '#12B76A'
    },
    {
      user: 'Courtney Henry',
      avatar: '/images/user/user-03.jpg',
      action: 'created invoice',
      invoice: 'HK-234G',
      time: '15 minutes ago'
    },
    {
      user: 'Bessie Cooper',
      avatar: '/images/user/user-04.jpg',
      action: 'created invoice',
      invoice: 'LH-2891C',
      time: '5 months ago'
    },
    {
      user: 'Theresa Web',
      avatar: '/images/user/user-05.jpg',
      action: 'created invoice',
      invoice: 'CK-125NH',
      time: '2 weeks ago'
    }
  ];

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
