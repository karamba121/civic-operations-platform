import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ClickOutsideDirective } from '../../../../../shared/directive/click-outside.directive';
import { Theme, ThemeService } from '../../../../../shared/services/theme.service';

@Component({
  selector: 'app-ai-settings-general',
  imports: [CommonModule, FormsModule, ClickOutsideDirective],
  templateUrl: './general.component.html'
})
export class GeneralComponent implements OnInit, OnDestroy {
  @Input() activeTab: string = 'account';

  theme: Theme = 'light';
  language: string = 'English';
  time: string = 'UTC';
  langOpen: boolean = false;
  timeOpen: boolean = false;

  activityUpdates: boolean = false;
  responses: boolean = true;
  productUpdates: boolean = false;

  private themeSub?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeSub = this.themeService.theme$.subscribe(t => {
      this.theme = t;
    });
  }

  ngOnDestroy() {
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
  }

  setTheme(newTheme: Theme) {
    this.themeService.setTheme(newTheme);
  }

  setLanguage(lang: string) {
    this.language = lang;
    this.langOpen = false;
  }

  setTimezone(tz: string) {
    this.time = tz;
    this.timeOpen = false;
  }
}
