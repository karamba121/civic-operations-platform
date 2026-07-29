import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../form/label/label.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
  selector: 'app-add-api-key-modal',
  imports: [
    ModalComponent,
    LabelComponent,
    ButtonComponent,
    FormsModule
  ],
  templateUrl: './add-api-key-modal.component.html',
  styles: ``
})
export class AddApiKeyModalComponent {
  @Output() save = new EventEmitter<string>();
  isOpen = false;
  apiKeyName = '';

  openModal() {
    this.isOpen = true;
    this.apiKeyName = ''; // Reset on open
  }

  closeModal() {
    this.isOpen = false;
  }

  handleSave() {
    if (this.apiKeyName.trim()) {
      this.save.emit(this.apiKeyName);
      this.closeModal();
    }
  }
}
