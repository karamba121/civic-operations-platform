import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  imports: [AsyncPipe, NgClass, RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent {
  readonly sidebarService = inject(SidebarService);
  readonly isExpanded$ = this.sidebarService.isExpanded$;
  readonly isMobileOpen$ = this.sidebarService.isMobileOpen$;
  readonly isHovered$ = this.sidebarService.isHovered$;

  closeOnMobile(): void {
    if (window.innerWidth < 1280) {
      this.sidebarService.setMobileOpen(false);
    }
  }
}
