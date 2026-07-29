import { Component } from '@angular/core';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
  selector: 'app-integration-settings-modal',
  imports: [
    InputFieldComponent,
    LabelComponent,
    ModalComponent,
  ],
  templateUrl: './integration-settings-modal.component.html',
  styles: ``
})
export class IntegrationSettingsModalComponent {

  isOpen = false;
  closeModal() {
    this.isOpen = false;
  } 
  openModal() {
    this.isOpen = true;
  }
}
