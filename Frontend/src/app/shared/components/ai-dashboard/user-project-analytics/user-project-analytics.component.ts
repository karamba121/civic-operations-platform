import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';

@Component({
  selector: 'app-user-project-analytics',
  imports: [
    CommonModule,
    DropdownComponent,
    DropdownItemComponent,
  ],
  templateUrl: './user-project-analytics.component.html',
  styleUrl: './user-project-analytics.component.css',
})
export class UserProjectAnalyticsComponent {

  openDropdown: string | null = null;


  readonly userAnalyticsItems = [
    { label: 'Free Users', value: '15,682', helperLead: '95%', helperTail: 'of total user', icon: 'users', accent: 'text-brand-400', positive: false },
    { label: 'Paid Users', value: '305', helperLead: '5%', helperTail: 'of total user', icon: 'paidUsers', accent: 'text-orange-400', positive: false },
    { label: 'This Month', value: '4,925', helperLead: '+5,238', helperTail: 'from last month', icon: 'calendar', accent: 'text-success-500', positive: true },
    { label: 'This Year', value: '12,489', helperLead: '+12,495', helperTail: 'from last year', icon: 'target', accent: 'text-pink-400', positive: true },
  ] as const;

  readonly projectAnalyticsItems = [
    { label: 'Today', value: '120', helperLead: 'Project created', helperTail: '', icon: 'flash', accent: 'text-violet-400', positive: false },
    { label: 'Yesterday', value: '392', helperLead: 'Project created', helperTail: '', icon: 'clock', accent: 'text-sky-400', positive: false },
    { label: 'This Month', value: '3,835', helperLead: '+2,093', helperTail: 'from last month', icon: 'calendar', accent: 'text-success-500', positive: true },
    { label: 'This Year', value: '12,958', helperLead: '+8,532', helperTail: 'from last year', icon: 'target', accent: 'text-pink-400', positive: true },
  ] as const;

  
  toggleDropdown(key: string) {
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  closeDropdown() {
    this.openDropdown = null;
  }
}
