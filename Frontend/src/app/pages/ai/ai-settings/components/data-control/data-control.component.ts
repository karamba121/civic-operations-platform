import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../../../../shared/directive/click-outside.directive';

@Component({
  selector: 'app-ai-settings-data-control',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideDirective],
  templateUrl: './data-control.component.html'
})
export class DataControlComponent {
  @Input() activeTab: string = 'account';

  retentionOpen: boolean = false;
  retention: string = '90 Days';
  improveModels: boolean = false;
  location: boolean = false;

  setRetention(opt: string) {
    this.retention = opt;
    this.retentionOpen = false;
  }

  exportData() {
    alert('User data export request has been submitted. You will receive an email download link shortly.');
  }

  deleteAllChats() {
    if (confirm('Permanently delete all your chat histories across all workspaces? This action is absolute and cannot be undone.')) {
      alert('All chat histories deleted.');
    }
  }
}
