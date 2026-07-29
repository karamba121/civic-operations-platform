import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../../../../shared/directive/click-outside.directive';

@Component({
  selector: 'app-ai-settings-file-and-media',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideDirective],
  templateUrl: './file-and-media.component.html'
})
export class FileAndMediaComponent {
  @Input() activeTab: string = 'account';

  maxFileSize: number = 20;
  compressionQuality: number = 60;
  exportFormat: string = 'PNG';
  exportOpen: boolean = false;

  setExportFormat(fmt: string) {
    this.exportFormat = fmt;
    this.exportOpen = false;
  }
}
