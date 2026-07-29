import { Component } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

interface PlanFeature {
  text: string;
}

@Component({
  selector: 'app-price-table-one',
  imports: [
    CommonModule
  ],
  templateUrl: './price-table-one.component.html',
  styles: ``
})
export class PriceTableOneComponent {

  isMonthly = true;
  isDarkMode = false;
  private themeSubscription: Subscription | undefined;

  starterPack: PlanFeature[] = [
    { text: '5 website' },
    { text: '500 MB Storage' },
    { text: 'Unlimited Sub-Domain' },
    { text: '3 Custom Domain' },
    { text: 'Free SSL Certificate' },
    { text: 'Unlimited Traffic' },
  ];

  mediumPack: PlanFeature[] = [
    { text: '10 website' },
    { text: '1 GB Storage' },
    { text: 'Unlimited Sub-Domain' },
    { text: '5 Custom Domain' },
    { text: 'Free SSL Certificate' },
    { text: 'Unlimited Traffic' },
  ];

  largePack: PlanFeature[] = [
    { text: '15 website' },
    { text: '10 GB Storage' },
    { text: 'Unlimited Sub-Domain' },
    { text: '10 Custom Domain' },
    { text: 'Free SSL Certificate' },
    { text: 'Unlimited Traffic' },
  ];

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  togglePricing(isMonthly: boolean): void {
    this.isMonthly = isMonthly;
  }
}
