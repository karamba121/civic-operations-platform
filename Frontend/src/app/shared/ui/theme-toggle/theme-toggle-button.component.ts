import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle-button',
  imports: [AsyncPipe],
  templateUrl: './theme-toggle-button.component.html',
})
export class ThemeToggleButtonComponent {
  private readonly themeService = inject(ThemeService);
  readonly isDarkMode$ = this.themeService.isDarkMode$;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
