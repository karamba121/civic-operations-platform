
import { Component } from '@angular/core';
import { Task } from '../types/types';
import { BoardColumnComponent } from '../board-column/board-column.component';
import { DndDropEvent, DndModule } from 'ngx-drag-drop';

@Component({
  selector: 'app-kanban-board',
  imports: [
    BoardColumnComponent,
    DndModule
],
  templateUrl: './kanban-board.component.html',
  styles: ``
})
export class KanbanBoardComponent {

  initialTasks: Task[] = [
    {
      id: "1",
      title: "Finish user onboarding",
      dueDate: "Tomorrow",
      comments: 1,
      assignee: "/images/user/user-01.jpg",
      status: "todo",
      category: { name: "Development", color: "orange" },
    },
    {
      id: "2",
      title: "Solve the dribble prioritization issue with the team",
      dueDate: "Jan 08, 2027",
      comments: 1,
      assignee: "/images/user/user-01.jpg",
      status: "todo",
      category: { name: "Marketing", color: "brand" },
    },
    {
      id: "3",
      title: "Change license and remove products",
      dueDate: "Jan 8, 2027",
      assignee: "/images/user/user-07.jpg",
      status: "todo",
      category: { name: "Dev", color: "default" },
    },
    {
      id: "4",
      title: "Work in progress(WIP) Dashboard",
      dueDate: "Today",
      comments: 1,
      assignee: "/images/user/user-09.jpg",
      status: "inProgress",
      category: { name: "Development", color: "default" },
    },
    {
      id: "5",
      title: "Kanban  manager",
      dueDate: "Jan 08, 2027",
      comments: 8,
      assignee: "/images/user/user-10.jpg",
      status: "inProgress",
      category: { name: "Template", color: "success" },
      links: 2,
    },
    {
      id: "6",
      title: "Product Update - Q4 (2024)",
      projectDesc:
        "Dedicated from a category of users that will perform actions.",
      projectImg: "/images/task/task.png",
      dueDate: "Today",
      comments: 1,
      assignee: "/images/user/user-09.jpg",
      status: "inProgress",
      category: { name: "Development", color: "default" },
    },
    {
      id: "7",
      title:
        "Make figma bot send comment when ticket is auto-moved back to inbox",
      dueDate: "Mar 08, 2027",
      comments: 1,
      assignee: "/images/user/user-12.jpg",
      status: "inProgress",
      category: { name: "Dev", color: "default" },
    },
    {
      id: "8",
      title: "Manage internal feedback",
      dueDate: "Tomorrow",
      comments: 1,
      assignee: "/images/user/user-13.jpg",
      status: "completed",
      category: { name: "Dev", color: "default" },
    },
    {
      id: "9",
      title: "Do some projects on React Native with Flutter",
      dueDate: "Jan 8, 2027",
      comments: 1,
      assignee: "/images/user/user-14.jpg",
      status: "completed",
      category: { name: "Development", color: "orange" },
    },
    {
      id: "10",
      title: "Design marketing assets",
      dueDate: "Jan 08, 2027",
      comments: 2,
      assignee: "/images/user/user-10.jpg",
      status: "completed",
      category: { name: "Marketing", color: "brand" },
      links: 1,
    },
    {
      id: "11",
      title: "Kanban flow manager",
      dueDate: "Jan 08, 2027",
      comments: 8,
      assignee: "/images/user/user-10.jpg",
      status: "completed",
      category: { name: "Template", color: "success" },
      links: 2,
    },
    // Add more initial tasks here...
  ];

  tasks: Task[] = [...this.initialTasks];

  get todoTasks() {
    return this.tasks.filter(task => task.status === 'todo');
  }
  get inProgressTasks() {
    return this.tasks.filter(task => task.status === 'inProgress');
  }
  get completedTasks() {
    return this.tasks.filter(task => task.status === 'completed');
  }

  handleTaskDrop({ event, status }: { event: DndDropEvent, status: string }) {
    const draggedTask = event.data as Task;
    this.tasks = this.tasks.map(task =>
      task.id === draggedTask.id ? { ...task, status } : task
    );
  }

}
