import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../../shared/layout/app-header/app-header.component';
import { SidebarOneComponent } from '../../../shared/components/layout-sidebar/sidebar-one/sidebar-one.component';
import { SidebarService } from '../../../shared/services/sidebar.service';

@Component({
  selector: 'app-layout-one',
  imports: [CommonModule, RouterModule, AppHeaderComponent, SidebarOneComponent],
  templateUrl: './layout-one.component.html',
  styleUrl: './layout-one.component.css'
})
export class LayoutOneComponent {
  isMobileOpen$;

  constructor(private sidebarService: SidebarService) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  closeMobileMenu() {
    this.sidebarService.setMobileOpen(false);
  }
}
