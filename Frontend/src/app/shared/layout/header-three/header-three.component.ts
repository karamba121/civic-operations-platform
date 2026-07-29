import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeToggleButtonComponent } from '../../components/common/theme-toggle/theme-toggle-button.component';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-header-three',
  imports: [CommonModule, RouterModule, ThemeToggleButtonComponent],
  templateUrl: './header-three.component.html'
})
export class HeaderThreeComponent {
  menuToggle = false;
  isExpanded$;
  isMobileOpen$;

  constructor(private sidebarService: SidebarService) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  toggleDesktopSidebar() {
    this.sidebarService.toggleExpanded();
  }

  toggleMobileSidebar() {
    this.sidebarService.toggleMobileOpen();
  }

  toggleMenu() {
    this.menuToggle = !this.menuToggle;
  }
}
