import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('auto');
  private resolvedDarkSubject = new BehaviorSubject<boolean>(false);
  theme$ = this.themeSubject.asObservable();
  isDarkMode$ = this.resolvedDarkSubject.asObservable();

  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'auto';
    this.setTheme(savedTheme);

    this.mediaQuery.addEventListener('change', () => {
      if (this.themeSubject.value === 'auto') {
        this.applyTheme('auto');
      }
    });
  }

  toggleTheme() {
    const nextTheme: Theme = this.resolvedDarkSubject.value ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: Theme) {
    if (theme !== 'light' && theme !== 'dark' && theme !== 'auto') {
      theme = 'auto';
    }
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme) {
    let isDark = false;
    if (theme === 'dark') {
      isDark = true;
    } else if (theme === 'light') {
      isDark = false;
    } else {
      isDark = this.mediaQuery.matches;
    }

    const root = document.documentElement;
    this.resolvedDarkSubject.next(isDark);
    root.classList.toggle('dark', isDark);
    root.dataset['theme'] = isDark ? 'dark' : 'light';
    root.style.colorScheme = isDark ? 'dark' : 'light';

    if (document.body) {
      document.body.dataset['theme'] = isDark ? 'dark' : 'light';
      document.body.style.colorScheme = isDark ? 'dark' : 'light';
    }
  }
}
