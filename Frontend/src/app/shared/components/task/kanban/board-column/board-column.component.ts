import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../types/types';
import { CommonModule } from '@angular/common';
import { KanbanTaskItemComponent } from '../kanban-task-item/kanban-task-item.component';
import { DndDropEvent, DndModule } from 'ngx-drag-drop';

@Component({
  selector: 'app-board-column',
  imports: [
    CommonModule,
    KanbanTaskItemComponent,
    DndModule,
  ],
  templateUrl: './board-column.component.html',
  styles: ``
})
export class BoardColumnComponent {

  @Input() title: string = '';
  @Input() tasks: Task[] = [];
  @Input() status: string = '';
  @Output() taskDropped = new EventEmitter<{ event: DndDropEvent, status: string }>();

  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onDropdownItemClick(action: string) {
    this.isOpen = false;
    // Implement action handling as needed
  }

  getStatusStyles(): string {
    switch (this.status) {
      case 'todo':
        return 'bg-gray-100 text-gray-700 dark:bg-white/[0.03] dark:text-white/80';
      case 'inProgress':
        return 'text-warning-700 bg-warning-50 dark:bg-warning-500/15 dark:text-orange-400';
      case 'completed':
        return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500';
      default:
        return '';
    }
  }


  onDrop(event: DndDropEvent) {
    this.taskDropped.emit({ event, status: this.status });
  }

}
