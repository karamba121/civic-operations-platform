import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { ClickOutsideDirective } from '../../../directive/click-outside.directive';
import { SidebarService } from '../../../services/sidebar.service';

interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  badge?: string;
  toggleKey?: string;
  children?: MenuItem[];
  activePages?: string[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar-two',
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: './sidebar-two.component.html',
  styleUrl: './sidebar-two.component.css'
})
export class SidebarTwoComponent {
  selected = 'Dashboard';
  subSelected = '';
  page = '';

  isExpanded$;
  isMobileOpen$;

  menuGroups: MenuGroup[] = [
    {
      title: 'General',
      items: [
        {
          label: 'Dashboard',
          icon: 'dashboard',
          toggleKey: 'Dashboard',
          activePages: ['inventoryManagement', 'productDevelopment', 'finance', 'humanResources', 'supplyChain'],
          children: [
            { label: 'Inventory Management', route: '#', activePages: ['inventoryManagement'] },
            { label: 'Product Development', route: '#', activePages: ['productDevelopment'] },
            { label: 'Finance', route: '#', activePages: ['finance'] },
            { label: 'Human Resources', route: '#', activePages: ['humanResources'] },
            { label: 'Supply Chain', route: '#', activePages: ['supplyChain'] },
          ]
        },
        {
          label: 'Public Profiles',
          icon: 'profile',
          route: '#',
          activePages: ['profile']
        },
        {
          label: 'Settings',
          icon: 'settings',
          route: '#',
          activePages: ['settings']
        },
        {
          label: 'Notifications',
          icon: 'notifications',
          route: '#',
          activePages: ['notifications']
        },
        {
          label: 'User Analytics',
          icon: 'analytics',
          route: '#',
          activePages: ['analytics']
        }
      ]
    },
    {
      title: 'Projects',
      items: [
        {
          label: 'Design Engineering',
          icon: 'design',
          route: '#',
          activePages: ['designEngineering']
        },
        {
          label: 'Sales & Marketing',
          icon: 'marketing',
          route: '#',
          activePages: ['marketing']
        },
        {
          label: 'SaaS',
          icon: 'saas',
          route: '#',
          activePages: ['saas']
        },
        {
          label: 'Customer Support',
          icon: 'support',
          route: '#',
          activePages: ['customerSupport']
        }
      ]
    },
    {
      title: 'API Reference',
      items: [
        {
          label: 'File Conventions',
          route: '#',
          activePages: ['fileConventions']
        },
        {
          label: 'Version Control',
          route: '#',
          activePages: ['versionControl']
        },
        {
          label: 'File Organization',
          route: '#',
          activePages: ['fileOrganization']
        },
        {
          label: 'Backup Procedures',
          route: '#',
          activePages: ['backupProcedures']
        }
      ]
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

  onToggleItem(event: Event, key?: string): void {
    if (key) {
      event.preventDefault();
      this.toggleSelected(key);
    }
  }

  toggleSelected(menu: string) {
    this.selected = this.selected === menu ? '' : menu;
  }

  toggleSubSelected(submenu: string) {
    this.subSelected = this.subSelected === submenu ? '' : submenu;
  }

  closeMobileMenu() {
    this.sidebarService.setMobileOpen(false);
  }

  isActive(pageName: string) {
    return this.page === pageName;
  }

  isGroupActive(activePages?: string[]) {
    if (!activePages) return false;
    return activePages.some(page => this.isActive(page));
  }
}
