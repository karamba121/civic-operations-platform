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
  selector: 'app-sidebar-four',
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: './sidebar-four.component.html',
  styleUrl: './sidebar-four.component.css'
})
export class SidebarFourComponent {
  selected = 'InstallationGuide';
  openSection = 'GetStarted';
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
        { label: 'Quick Start', route: '#' },
        { label: 'Installation Guide', route: '#' },
        { label: 'Tutorials', route: '#' },
        { label: 'Configuration', route: '#' },
        { label: 'Best Practices', route: '#' },
        { label: 'FAQ', route: '#' },
      ]
    },
    {
      id: 'DeveloperFeatures',
      title: 'Developer Features',
      items: [
        { label: 'Plugins', route: '#' },
        { label: 'Custom Hooks', route: '#' },
        { label: 'State Management', route: '#' },
        { label: 'Performance Tips', route: '#' },
      ]
    },
    {
      id: 'SDKDocumentation',
      title: 'SDK Documentation',
      items: [
        { label: 'Getting Started', route: '#' },
        { label: 'Authentication', route: '#' },
        { label: 'Error Handling', route: '#' },
        { label: 'Rate Limits', route: '#' },
      ]
    },
    {
      id: 'APIReference',
      title: 'API Reference',
      items: [
        { label: 'REST API', route: '#' },
        { label: 'GraphQL', route: '#' },
        { label: 'Webhooks', route: '#' },
        { label: 'SDK Methods', route: '#' },
      ]
    },
    {
      id: 'IntegrationGuides',
      title: 'Integration Guides',
      items: [
        { label: 'OAuth Setup', route: '#' },
        { label: 'Third-party Services', route: '#' },
        { label: 'Database Integration', route: '#' },
      ]
    },
    {
      id: 'TutorialsSection',
      title: 'Tutorials',
      items: [
        { label: 'Building a Dashboard', route: '#' },
        { label: 'CRUD Operations', route: '#' },
        { label: 'Authentication Flow', route: '#' },
      ]
    },
    {
      id: 'ReleaseNotes',
      title: 'Release Notes',
      items: [
        { label: 'v2.0.0', route: '#' },
        { label: 'v1.5.0', route: '#' },
        { label: 'v1.0.0', route: '#' },
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
      this.updateActiveSection();
    });
    
    this.page = this.router.url.split('/').pop() || '';
    this.updateActiveSection();
  }

  toggleSection(section: string) {
    this.openSection = this.openSection === section ? '' : section;
  }

  updateActiveSection() {
    for (const group of this.menuGroups) {
      if (group.items.some(item => item.activePages?.includes(this.page))) {
        this.openSection = group.id;
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
