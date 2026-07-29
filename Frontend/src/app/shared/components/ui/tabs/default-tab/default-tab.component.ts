import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-default-tab',
  imports: [
    CommonModule,
  ],
  templateUrl: './default-tab.component.html',
  styles: ``
})
export class DefaultTabComponent {

  activeTab: string = 'overview';

  tabs = [
    {
      key: 'overview',
      title: 'Overview',
      content:
        'Overview ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.',
    },
    {
      key: 'notification',
      title: 'Notification',
      content:
        'Notification ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.',
    },
    {
      key: 'analytics',
      title: 'Analytics',
      content:
        'Analytics ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.',
    },
    {
      key: 'customers',
      title: 'Customers',
      content:
        'Customers ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.',
    },
  ];

  setActiveTab(key: string) {
    this.activeTab = key;
  }
}
