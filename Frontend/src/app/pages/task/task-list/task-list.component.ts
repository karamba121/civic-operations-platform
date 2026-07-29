import { Component } from '@angular/core';
import { TaskListPageComponent } from '../../../shared/components/task/task-list/task-list-page/task-list-page.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-task-list',
  imports: [
    TaskListPageComponent,
    PageBreadcrumbComponent,
  ],
  templateUrl: './task-list.component.html',
  styles: ``
})
export class TaskListComponent {

}
