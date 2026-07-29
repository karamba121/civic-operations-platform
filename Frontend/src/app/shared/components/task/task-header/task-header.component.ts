import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../services/modal.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { TextAreaComponent } from '../../form/input/text-area.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-header',
  imports: [
    CommonModule,
    ButtonComponent,
    LabelComponent,
    InputFieldComponent,
    TextAreaComponent,
    ModalComponent,
    FormsModule,
  ],
  templateUrl: './task-header.component.html',
  styles: ``
})
export class TaskHeaderComponent {

  selectedTaskGroup = 'All';
  message = '';

  taskGroups = [
    { name: 'All Tasks', key: 'All', count: 14 },
    { name: 'To do', key: 'Todo', count: 3 },
    { name: 'In Progress', key: 'InProgress', count: 4 },
    { name: 'Completed', key: 'Completed', count: 4 },
  ];

  constructor(public modal: ModalService) {}

  isOpen = false;
  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }

  setSelectedTaskGroup(key: string) {
    this.selectedTaskGroup = key;
  }

  handleMessageChange(val: string) {
    this.message = val;
  }

  handleCreateTask() {
    // Handle create task logic here
    this.closeModal();
  }
}
