import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DailySaleChartComponent } from '../chart/daily-sale-chart.component';
import { NewUserChartComponent } from '../chart/new-user-chart.component';
import { OnlineSaleChartComponent } from '../chart/online-sale-chart.component';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-product-performance-tab',
  imports: [
    CommonModule,
    DailySaleChartComponent,
    NewUserChartComponent,
    OnlineSaleChartComponent,
    DropdownComponent,
    DropdownItemComponent
  ],
  templateUrl: './product-performance-tab.component.html',
  styles: ``
})
export class ProductPerformanceTabComponent {

  isOpen = false;
  selected: 'daily' | 'online' | 'new' = 'daily';

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  selectTab(tab: 'daily' | 'online' | 'new') {
    this.selected = tab;
  }
}
