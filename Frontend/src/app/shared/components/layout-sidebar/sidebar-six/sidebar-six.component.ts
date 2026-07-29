import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { ClickOutsideDirective } from '../../../directive/click-outside.directive';
import { SidebarService } from '../../../services/sidebar.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  id: string;
}

@Component({
  selector: 'app-sidebar-six',
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: './sidebar-six.component.html',
  styleUrl: './sidebar-six.component.css'
})
export class SidebarSixComponent {
  activeNav = 'dashboard';
  page = '';

  isExpanded$;
  isMobileOpen$;

  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '#',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: 'calendar',
      route: '#',
    },
    {
      id: 'profile',
      label: 'Profiles',
      icon: 'profile',
      route: '#',
    },
    {
      id: 'analytics',
      label: 'User Analytics',
      icon: 'analytics',
      route: '#',
    },
    {
      id: 'design',
      label: 'Design Engineering',
      icon: 'design',
      route: '#',
    },
    {
      id: 'marketing',
      label: 'Email',
      icon: 'marketing',
      route: '#',
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: 'inbox',
      route: '#',
    },
    {
      id: 'support',
      label: 'Customer Support',
      icon: 'support',
      route: '#',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      route: '#',
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: 'integrations',
      route: '#',
    },
    {
      id: 'components',
      label: 'Components',
      icon: 'components',
      route: '#',
    }
  ];

  constructor(private sidebarService: SidebarService, private router: Router) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.page = event.urlAfterRedirects.split('/').pop() || '';
    });

    this.page = this.router.url.split('/').pop() || '';
  }

  setActive(id: string) {
    this.activeNav = id;
  }

  closeMobileMenu() {
    this.sidebarService.setMobileOpen(false);
  }
}
