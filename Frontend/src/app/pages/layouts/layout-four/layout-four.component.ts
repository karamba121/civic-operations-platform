import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarFourComponent } from '../../../shared/components/layout-sidebar/sidebar-four/sidebar-four.component';
import { HeaderThreeComponent } from '../../../shared/layout/header-three/header-three.component';
import { SidebarService } from '../../../shared/services/sidebar.service';

@Component({
  selector: 'app-layout-four',
  imports: [CommonModule, RouterModule, SidebarFourComponent, HeaderThreeComponent],
  templateUrl: './layout-four.component.html',
  styleUrl: './layout-four.component.css'
})
export class LayoutFourComponent {
  isMobileOpen$;

  constructor(private sidebarService: SidebarService) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  closeMobileMenu() {
    this.sidebarService.setMobileOpen(false);
  }
}
