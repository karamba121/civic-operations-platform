import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActorContextService } from '../../../core/context/actor-context.service';
import { ThemeToggleButtonComponent } from '../../ui/theme-toggle/theme-toggle-button.component';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-header',
  imports: [AsyncPipe, NgClass, ThemeToggleButtonComponent],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  readonly sidebarService = inject(SidebarService);
  readonly actorContext = inject(ActorContextService);
  readonly isMobileOpen$ = this.sidebarService.isMobileOpen$;

  handleToggle(): void {
    if (window.innerWidth >= 1280) {
      this.sidebarService.toggleExpanded();
    } else {
      this.sidebarService.toggleMobileOpen();
    }
  }
}
