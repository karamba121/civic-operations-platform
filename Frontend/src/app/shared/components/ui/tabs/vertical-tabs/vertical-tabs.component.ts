import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-vertical-tabs',
  imports: [CommonModule],
  templateUrl: './vertical-tabs.component.html',
  styles: ``
})
export class VerticalTabsComponent {

  activeTab: string = 'overview';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

}
