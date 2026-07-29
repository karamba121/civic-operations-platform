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
}

interface MenuGroup {
  id: string;
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar-five',
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: './sidebar-five.component.html',
  styleUrl: './sidebar-five.component.css'
})
export class SidebarFiveComponent {
  selected = 'FrameworkGuides';
  openSections: string[] = ['GetStarted', 'Components'];
  page = '';
  versionOpen = false;
  activeVersion = 'v2.0.8-alpha';
  versions = ['v1.0.1', 'v2.0.8-alpha', 'V3.0.9-beta1'];

  isExpanded$;
  isMobileOpen$;

  menuGroups: MenuGroup[] = [
    {
      id: 'GetStarted',
      title: 'Get Started',
      items: [
        { label: 'Introduction', route: '#', activePages: ['introduction'] },
        { label: 'Quick Start', route: '#', activePages: ['quick-start'] },
        { label: 'Framework guides', route: '#', activePages: ['framework-guides'] },
        { label: 'Usage', route: '#', activePages: ['usage'] },
        { label: 'Javascript', route: '#', activePages: ['javascript'] },
        { label: 'Accessibility', route: '#', activePages: ['accessibility'] },
        { label: 'Upgrade Guide', route: '#', activePages: ['upgrade-guide'] },
        { label: 'License', route: '#', activePages: ['license'] },
      ]
    },
    {
      id: 'Components',
      title: 'Components',
      items: [
        { label: 'Accordion', route: '#', activePages: ['accordion'] },
        { label: 'Alert', route: '#', activePages: ['alert'] },
        { label: 'Avatar', route: '#', activePages: ['avatar'] },
        { label: 'Badge', route: '#', activePages: ['badge'] },
        { label: 'Button', route: '#', activePages: ['button'] },
        { label: 'Card', route: '#', activePages: ['card'] },
        { label: 'Carousel', route: '#', activePages: ['carousel'] },
        { label: 'Chat Bubble', route: '#', activePages: ['chat-bubble'] },
        { label: 'Collapse', route: '#', activePages: ['collapse'] },
        { label: 'Indicator', route: '#', activePages: ['indicator'] },
        { label: 'List Group', route: '#', activePages: ['list-group'] },
        { label: 'Loading', route: '#', activePages: ['loading'] },
        { label: 'Progress', route: '#', activePages: ['progress'] },
        { label: 'Radial progress', route: '#', activePages: ['radial-progress'] },
        { label: 'Skeleton', route: '#', activePages: ['skeleton'] },
        { label: 'Stack', route: '#', activePages: ['stack'] },
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
      this.updateActiveSections();
    });
    
    this.page = this.router.url.split('/').pop() || '';
    this.updateActiveSections();
  }

  toggleSection(section: string) {
    if (this.openSections.includes(section)) {
      this.openSections = this.openSections.filter(s => s !== section);
    } else {
      this.openSections.push(section);
    }
  }

  isSectionOpen(section: string) {
    return this.openSections.includes(section);
  }

  updateActiveSections() {
    for (const group of this.menuGroups) {
      if (group.items.some(item => item.activePages?.includes(this.page))) {
        if (!this.openSections.includes(group.id)) {
          this.openSections.push(group.id);
        }
        break;
      }
    }
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
}
