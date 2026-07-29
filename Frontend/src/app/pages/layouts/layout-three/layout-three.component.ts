import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarThreeComponent } from '../../../shared/components/layout-sidebar/sidebar-three/sidebar-three.component';
import { HeaderThreeComponent } from '../../../shared/layout/header-three/header-three.component';
import { SidebarService } from '../../../shared/services/sidebar.service';

@Component({
  selector: 'app-layout-three',
  imports: [CommonModule, RouterModule, SidebarThreeComponent, HeaderThreeComponent],
  templateUrl: './layout-three.component.html',
  styleUrl: './layout-three.component.css'
})
export class LayoutThreeComponent {
  isMobileOpen$;

  constructor(private sidebarService: SidebarService) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  closeMobileMenu() {
    this.sidebarService.setMobileOpen(false);
  }
}
