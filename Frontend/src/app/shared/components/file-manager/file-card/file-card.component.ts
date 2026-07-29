import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

@Component({
  selector: 'app-file-card',
  imports: [
    CommonModule,
    SafeHtmlPipe
  ],
  templateUrl: './file-card.component.html',
  styles: ``
})
export class FileCardComponent {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() usage: string = '';
  @Input() fileCount: number = 0;
  @Input() storageUsed: string = '';
  @Input() iconStyle: string = '';
}
