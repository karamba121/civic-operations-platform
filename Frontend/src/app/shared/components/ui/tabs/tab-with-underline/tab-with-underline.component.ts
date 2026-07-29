import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tab-with-underline',
  imports: [
    CommonModule,
  ],
  templateUrl: './tab-with-underline.component.html',
  styles: ``
})
export class TabWithUnderlineComponent {

  tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'notification', label: 'Notification' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'customers', label: 'Customers' },
  ];

  activeTab: string = 'overview';
}
