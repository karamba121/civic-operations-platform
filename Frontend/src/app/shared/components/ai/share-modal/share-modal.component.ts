import { Component, EventEmitter, Input, Output } from '@angular/core';

import { TooltipDirective } from '../../../directive/tooltip.directive';

@Component({
  selector: 'app-share-modal',
  imports: [TooltipDirective],
  templateUrl: './share-modal.component.html',
  styles: ``
})
export class ShareModalComponent {
  @Input() isOpen: boolean = false;
  @Input() shareLink: string = 'https://tailadmin.com/chat/f3d82a91-7c4ea84c31e672bf';
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
