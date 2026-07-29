import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClickOutsideDirective } from '../../../../../shared/directive/click-outside.directive';

@Component({
  selector: 'app-ai-settings-tab-menu',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './tab-menu.component.html'
})
export class TabMenuComponent {
  @Input() activeTab: string = 'account';
  @Output() activeTabChange = new EventEmitter<string>();

  @Input() isSidebarOpen: boolean = false;
  @Output() isSidebarOpenChange = new EventEmitter<boolean>();

  workspaceOpen = false;
  selectedWorkspace = 1;

  selectTab(tab: string) {
    this.activeTab = tab;
    this.activeTabChange.emit(tab);
    this.closeSidebar();
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    this.isSidebarOpenChange.emit(false);
  }
}
