import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarTwoComponent } from '../../../shared/components/layout-sidebar/sidebar-two/sidebar-two.component';
import { AppHeaderComponent } from '../../../shared/layout/app-header/app-header.component';
import { SidebarService } from '../../../shared/services/sidebar.service';

@Component({
  selector: 'app-layout-two',
  imports: [CommonModule, RouterModule, SidebarTwoComponent, AppHeaderComponent],
  templateUrl: './layout-two.component.html',
  styleUrl: './layout-two.component.css'
})
export class LayoutTwoComponent {
  isMobileOpen$;

  constructor(private sidebarService: SidebarService) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  closeMobileMenu() {
    this.sidebarService.setMobileOpen(false);
  }
}
