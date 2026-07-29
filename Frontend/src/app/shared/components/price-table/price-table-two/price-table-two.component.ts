import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-price-table-two',
  imports: [
    CommonModule,
  ],
  templateUrl: './price-table-two.component.html',
  styles: ``
})
export class PriceTableTwoComponent {

  personalPack = [
    { name: '5 website', included: true },
    { name: '500 MB Storage', included: true },
    { name: 'Unlimited Sub-Domain', included: true },
    { name: '3 Custom Domain', included: true },
    { name: 'Free SSL Certificate', included: false },
    { name: 'Unlimited Traffic', included: false },
  ];

  professionalPack = [
    { name: '10 website', included: true },
    { name: '1GB Storage', included: true },
    { name: 'Unlimited Sub-Domain', included: true },
    { name: '5 Custom Domain', included: true },
    { name: 'Free SSL Certificate', included: true },
    { name: 'Unlimited Traffic', included: false },
  ];

  enterprisePack = [
    { name: '15 website', included: true },
    { name: '10GB Storage', included: true },
    { name: 'Unlimited Sub-Domain', included: true },
    { name: '10 Custom Domain', included: true },
    { name: 'Free SSL Certificate', included: true },
    { name: 'Unlimited Traffic', included: true },
  ];
}
