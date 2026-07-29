import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-chat-list',
  imports: [
    CommonModule,
    DropdownComponent,
    DropdownItemComponent
  ],
  templateUrl: './chat-list.component.html',
  styles: ``
})
export class ChatListComponent {

  @Input() isOpen = false;
  @Output() onToggle = new EventEmitter<void>();

  isOpenTwo = false;

  toggleDropdownTwo(): void {
    this.isOpenTwo = !this.isOpenTwo;
  }

  closeDropdownTwo(): void {
    this.isOpenTwo = false;
  }

  handleToggle(): void {
    this.onToggle.emit();
  }

  chatList = [
    {
      name: 'Kaiya George',
      role: 'Project Manager',
      image: '/images/user/user-18.jpg',
      time: '15 mins',
      status: 'success-500',
    },
    {
      name: 'Lindsey Curtis',
      role: 'Designer',
      image: '/images/user/user-17.jpg',
      time: '30 mins',
      status: 'success-500',
    },
    {
      name: 'Zain Geidt',
      role: 'Content Writer',
      image: '/images/user/user-19.jpg',
      time: '45 mins',
      status: 'success-500',
    },
    {
      name: 'Carla George',
      role: 'Front-end Developer',
      image: '/images/user/user-05.jpg',
      time: '2 days',
      status: 'warning-500',
    },
    {
      name: 'Abram Schleifer',
      role: 'Digital Marketer',
      image: '/images/user/user-20.jpg',
      time: '1 hour',
      status: 'success-500',
    },
    {
      name: 'Lincoln Donin',
      role: 'Project ManagerProduct Designer',
      image: '/images/user/user-34.jpg',
      time: '3 days',
      status: 'success-500',
    },
    {
      name: 'Erin Geidthem',
      role: 'Copyrighter',
      image: '/images/user/user-35.jpg',
      time: '5 days',
      status: 'success-500',
    },
    {
      name: 'Alena Baptista',
      role: 'SEO Expert',
      image: '/images/user/user-36.jpg',
      time: '2 hours',
      status: 'error-500',
    },
    {
      name: 'Wilium vamos',
      role: 'Content Writer',
      image: '/images/user/user-37.jpg',
      time: '5 days',
      status: 'success-500',
    },
  ];
}
