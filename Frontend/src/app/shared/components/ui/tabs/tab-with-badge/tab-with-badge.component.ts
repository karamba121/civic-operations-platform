import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tab-with-badge',
  imports: [
    CommonModule,
  ],
  templateUrl: './tab-with-badge.component.html',
  styles: ``
})
export class TabWithBadgeComponent {

  activeTab: string = 'overview';

  tabData = [
    {
      id: 'overview',
      label: 'Overview',
      content:
        'Overview ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.',
      count: 8,
    },
    {
      id: 'notification',
      label: 'Notification',
      content:
        'Notification ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      content:
        'Analytics ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.',
      count: 4,
    },
    {
      id: 'customers',
      label: 'Customers',
      content:
        'Customers ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.',
      count: 12,
    },
  ];

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }
}
