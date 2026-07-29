import { Component } from '@angular/core';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
  selector: 'app-integration-details-modal',
  imports: [
    ModalComponent,
  ],
  templateUrl: './integration-details-modal.component.html',
  styles: ``
})
export class IntegrationDetailsModalComponent {

  isOpen = false;

  closeModal() {
    this.isOpen = false;
  }

  openModal() {
    this.isOpen = true;
  }
}
