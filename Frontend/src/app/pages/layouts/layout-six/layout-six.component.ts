import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarSixComponent } from '../../../shared/components/layout-sidebar/sidebar-six/sidebar-six.component';
import { HeaderTwoComponent } from '../../../shared/layout/header-two/header-two.component';
import { SidebarService } from '../../../shared/services/sidebar.service';

@Component({
  selector: 'app-layout-six',
  imports: [CommonModule, RouterModule, SidebarSixComponent, HeaderTwoComponent],
  templateUrl: './layout-six.component.html',
  styleUrl: './layout-six.component.css'
})
export class LayoutSixComponent {
  isMobileOpen$;

  constructor(private sidebarService: SidebarService) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  closeMobileMenu() {
    this.sidebarService.setMobileOpen(false);
  }
}
