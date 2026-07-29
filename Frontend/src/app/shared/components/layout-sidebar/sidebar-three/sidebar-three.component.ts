import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { ClickOutsideDirective } from '../../../directive/click-outside.directive';
import { SidebarService } from '../../../services/sidebar.service';

interface MenuItem {
  label: string;
  route?: string;
  activePages?: string[];
  toggleKey?: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar-three',
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: './sidebar-three.component.html',
  styleUrl: './sidebar-three.component.css'
})
export class SidebarThreeComponent {
  selected = 'Accordion';
  page = '';
  versionOpen = false;
  activeVersion = 'v2.0.8-alpha';
  versions = ['v1.0.1', 'v2.0.8-alpha', 'V3.0.9-beta1'];

  isExpanded$;
  isMobileOpen$;

  menuGroups: MenuGroup[] = [
    {
      title: 'Get Started',
      items: [
        { label: 'Quick Start', route: '#', activePages: ['quick-start'] },
        { label: 'Installation Guide', route: '#', activePages: ['installation-guide'] },
        { label: 'Tutorials', route: '#', activePages: ['tutorials'] },
        { label: 'API Reference', route: '#', activePages: ['api-reference'] },
        { label: 'Best Practices', route: '#', activePages: ['best-practices'] },
        { label: 'FAQ', route: '#', activePages: ['faq'] },
      ]
    },
    {
      title: 'Components',
      items: [
        { label: 'Accordion', route: '#', activePages: ['accordion'] },
        { label: 'Alert', route: '#', activePages: ['alert'] },
        { label: 'Alert Dialog', route: '#', activePages: ['alert-dialog'] },
        { label: 'Aspect Ratio', route: '#', activePages: ['aspect-ratio'] },
        { label: 'Avatar', route: '#', activePages: ['avatar'] },
        { label: 'Badge', route: '#', activePages: ['badge'] },
        { label: 'Breadcrumbs', route: '#', activePages: ['breadcrumbs'] },
        { label: 'Button', route: '#', activePages: ['button'] },
        { label: 'Button Group', route: '#', activePages: ['button-group'] },
        { label: 'Card', route: '#', activePages: ['card'] },
        { label: 'Checkbox', route: '#', activePages: ['checkbox'] },
        { label: 'Circular Progress', route: '#', activePages: ['circular-progress'] },
        { label: 'Date Picker', route: '#', activePages: ['date-picker'] },
        { label: 'Dialog', route: '#', activePages: ['dialog'] },
      ]
    },
    {
      title: 'API Reference',
      items: [
        { label: 'File Conventions', route: '#', activePages: ['file-conventions'] },
        { label: 'Version Control', route: '#', activePages: ['version-control'] },
        { label: 'File Organization', route: '#', activePages: ['file-organization'] },
        { label: 'Backup Procedures', route: '#', activePages: ['backup-procedures'] },
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

  toggleVersion() {
    this.versionOpen = !this.versionOpen;
  }

  setVersion(v: string) {
    this.activeVersion = v;
    this.versionOpen = false;
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
