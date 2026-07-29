import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeToggleButtonComponent } from '../../components/common/theme-toggle/theme-toggle-button.component';
import { NotificationDropdownComponent } from '../../components/header/notification-dropdown/notification-dropdown.component';
import { UserDropdownComponent } from '../../components/header/user-dropdown/user-dropdown.component';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-header-two',
  standalone: true,
  imports: [CommonModule, RouterModule,ThemeToggleButtonComponent,NotificationDropdownComponent,UserDropdownComponent],
  templateUrl: './header-two.component.html'
})
export class HeaderTwoComponent {
  isMobileOpen$;
  isExpanded$;
  
  menuToggle = false;
  dropdownOpen = false;
  userDropdownOpen = false;

  constructor(private sidebarService: SidebarService) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isExpanded$ = this.sidebarService.isExpanded$;
  }

  toggleSidebar(): void {
    this.sidebarService.toggleExpanded();
  }

  toggleMobileMenu(): void {
    this.sidebarService.toggleMobileOpen();
  }

  toggleMenu(): void {
    this.menuToggle = !this.menuToggle;
  }
}
