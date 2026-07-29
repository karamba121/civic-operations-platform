import { Component } from '@angular/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-add-integration-modal',
  imports: [
    ModalComponent,
    ButtonComponent,
  ],
  templateUrl: './add-integration-modal.component.html',
  styles: ``
})
export class AddIntegrationModalComponent {
  isOpen: boolean = false;

  closeModal() {
    this.isOpen = false;
  }

  openModal() {
    this.isOpen = true;
  }
}
