import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { SidebarService } from '../../services/sidebar.service';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar.component';
import { BackdropComponent } from '../backdrop/backdrop.component';


@Component({
  selector: 'app-alternative-layout',
  imports: [
    CommonModule,
    AppSidebarComponent,
    BackdropComponent,
    AppHeaderComponent,
    RouterModule,
  ],
  templateUrl: './alternative-layout.component.html',
  styles: ``,
  host: {
    class: 'min-h-screen xl:flex',
  },
})
export class AlternativeLayoutComponent {

  isExpanded$: Observable<boolean>;
  isHovered$: Observable<boolean>;
  isMobileOpen$: Observable<boolean>;

  currentPageTitle = 'Dashboard';

  private routeTitles: Record<string, string> = {
    '/text-generator': 'Text Generator',
    '/image-generator': 'Image Generator',
    '/code-generator': 'Code Generator',
    '/video-generator': 'Video Generator',
    // add more as needed
  };

  constructor(private sidebarService: SidebarService, private router: Router) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isHovered$ = this.sidebarService.isHovered$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;

    // Listen to route changes to update page title
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentPageTitle = this.getPageTitle(event.urlAfterRedirects);
      }
    });
  }

  private getPageTitle(pathname: string): string {
    return this.routeTitles[pathname] || 'Dashboard';
  }
}
