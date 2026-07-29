import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
  selector: 'app-integration-delete-modal',
  imports: [
    ModalComponent,
  ],
  templateUrl: './integration-delete-modal.component.html',
  styles: ``
})
export class IntegrationDeleteModalComponent {

  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
    this.close.emit();
  }
}
