import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { TaskHeaderComponent } from '../../../shared/components/task/task-header/task-header.component';
import { KanbanBoardComponent } from '../../../shared/components/task/kanban/kanban-board/kanban-board.component';

@Component({
  selector: 'app-task-kanban',
  imports: [
    TaskHeaderComponent,
    PageBreadcrumbComponent,
    KanbanBoardComponent,
  ],
  templateUrl: './task-kanban.component.html',
  styles: ``
})
export class TaskKanbanComponent {

}
