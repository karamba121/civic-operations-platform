import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../types/Task';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../ui/dropdown/dropdown-item/dropdown-item.component';
import { TaskItemComponent } from '../task-item/task-item.component';

@Component({
  selector: 'app-task-lane',
  imports: [
    CommonModule,
    DropdownComponent,
    DropdownItemComponent,
    TaskItemComponent,
  ],
  templateUrl: './task-lane.component.html',
  styles: ``
})
export class TaskLaneComponent {

  @Input() lane!: string;
  @Input() tasks: Task[] = [];

  @Output() dragOver = new EventEmitter<DragEvent>();
  @Output() drop = new EventEmitter<DragEvent>();
  @Output() dragStart = new EventEmitter<{ event: DragEvent, taskId: string }>();

  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  onDragOver(event: DragEvent) {
    this.dragOver.emit(event);
  }

  onDrop(event: DragEvent) {
    this.drop.emit(event);
  }

  onTaskDragStart(event: DragEvent, taskId: string) {
    this.dragStart.emit({ event, taskId });
  }

  getLaneClass(): string {
    if (this.lane.toLowerCase() === 'todo') {
      return 'bg-gray-100 text-gray-700 dark:bg-white/[0.03] dark:text-white/80';
    } else if (this.lane.toLowerCase() === 'in-progress') {
      return 'text-warning-700 bg-warning-50 dark:bg-warning-500/15 dark:text-orange-400';
    } else if (this.lane.toLowerCase() === 'completed') {
      return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500';
    }
    return '';
  }
}
