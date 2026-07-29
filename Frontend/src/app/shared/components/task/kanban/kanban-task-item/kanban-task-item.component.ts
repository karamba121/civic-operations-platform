import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../types/types';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DndModule } from 'ngx-drag-drop';


@Component({
  selector: 'app-kanban-task-item',
  imports: [
    CommonModule,
    DragDropModule,
    DndModule
  ],
  templateUrl: './kanban-task-item.component.html',
  styles: ``
})
export class KanbanTaskItemComponent {

  @Input() task: Task = {} as Task;
  @Input() index: number = 0;

  getCategoryStyles(color: string): string {
    switch (color) {
      case 'error':
        return 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400';
      case 'success':
        return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400';
      case 'brand':
        return 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400';
      case 'orange':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400';
      case 'purple':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400';
    }
  }

  onDragStart(event: DragEvent) {
    console.log('Task drag started:', this.task);
  }

  onDragEnd(event: DragEvent) {
    console.log('Task drag ended');
  }

}
