import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarFiveComponent } from '../../../shared/components/layout-sidebar/sidebar-five/sidebar-five.component';
import { HeaderThreeComponent } from '../../../shared/layout/header-three/header-three.component';
import { SidebarService } from '../../../shared/services/sidebar.service';

@Component({
  selector: 'app-layout-five',
  imports: [CommonModule, RouterModule, SidebarFiveComponent, HeaderThreeComponent],
  templateUrl: './layout-five.component.html',
  styleUrl: './layout-five.component.css',
})
export class LayoutFiveComponent {
  isMobileOpen$;

  constructor(private sidebarService: SidebarService) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  closeMobileMenu() {
    this.sidebarService.setMobileOpen(false);
  }
}
