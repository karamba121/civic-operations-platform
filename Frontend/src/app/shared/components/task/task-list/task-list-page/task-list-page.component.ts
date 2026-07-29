import { Component } from '@angular/core';
import { Task } from '../types/Task';

import { TaskHeaderComponent } from '../../task-header/task-header.component';
import { TaskLaneComponent } from '../task-lane/task-lane.component';

@Component({
  selector: 'app-task-list-page',
  imports: [
    TaskHeaderComponent,
    TaskLaneComponent
],
  templateUrl: './task-list-page.component.html',
  styles: ``
})
export class TaskListPageComponent {

  initialTasks: Task[] = [
    {
      id: "1",
      title: "Finish user onboarding",
      isChecked: false,
      dueDate: "Tomorrow",
      commentCount: 1,
      category: "Marketing",
      userAvatar: "/images/user/user-01.jpg",
      status: "todo",
      toggleChecked: () => {}, // This will be replaced
    },
    {
      id: "2",
      title: "Solve the Dribble prioritization issue with the team",
      isChecked: false,
      dueDate: "Tomorrow",
      commentCount: 2,
      category: "Marketing",
      userAvatar: "/images/user/user-02.jpg",
      status: "todo",
      tag: { text: 'Marketing', color: 'brand' },
      toggleChecked: () => {}, // This will be replaced
    },
    {
      id: "3",
      title: "Finish user onboarding",
      isChecked: true,
      dueDate: "Feb 12, 2024",
      commentCount: 1,
      category: "Marketing",
      userAvatar: "/images/user/user-03.jpg",
      status: "todo",
      tag: { text: 'Dev', color: 'gray' },
      toggleChecked: () => {}, // This will be replaced
    },
    // in-progress
    {
      id: "4",
      title: "Work in Progress (WIP) Dashboard",
      isChecked: false,
      dueDate: "Jan 8, 2027",
      commentCount: 2,
      category: "Template",
      userAvatar: "/images/user/user-04.jpg",
      status: "in-progress",
      toggleChecked: () => {}, // This will be replaced
    },
    {
      id: "5",
      title: "Product Update - Q4 2024",
      isChecked: false,
      dueDate: "Jan 8, 2027",
      commentCount: 2,
      userAvatar: "/images/user/user-05.jpg",
      status: "in-progress",
      tag: { text: 'Template', color: 'success' },
      toggleChecked: () => {}, // This will be replaced
    },
    {
      id: "6",
      title: "Kanban Flow Manager",
      isChecked: true,
      dueDate: "Jan 8, 2027",
      commentCount: 2,
      userAvatar: "/images/user/user-06.jpg",
      status: "in-progress",
      toggleChecked: () => {}, // This will be replaced
    },
    {
      id: "7",
      title: "Make internal feedback",
      isChecked: false,
      dueDate: "Jan 8, 2027",
      commentCount: 2,
      userAvatar: "/images/user/user-07.jpg",
      status: "in-progress",
      toggleChecked: () => {}, // This will be replaced
    },
    {
      id: "8",
      title: "Do some projects on React Native with Flutter",
      isChecked: false,
      dueDate: "Feb 12, 2027",
      commentCount: 1,
      category: "Marketing",
      userAvatar: "/images/user/user-08.jpg",
      status: "completed",
      toggleChecked: () => {}, // This will be replaced
    },
    {
      id: "9",
      title: "Design marketing assets",
      isChecked: false,
      dueDate: "Feb 12, 2027",
      commentCount: 1,
      category: "Marketing",
      userAvatar: "/images/user/user-09.jpg",
      status: "completed",
      tag: { text: 'Development', color: 'orange' },
      toggleChecked: () => {}, // This will be replaced
    },
    {
      id: "10",
      title: "Kanban Flow Manager",
      isChecked: false,
      dueDate: "Feb 12, 2027",
      commentCount: 1,
      category: "Marketing",
      userAvatar: "/images/user/user-10.jpg",
      status: "completed",
      tag: { text: 'Marketing', color: 'brand' },
      toggleChecked: () => {}, // This will be replaced
    },
    {
      id: "11",
      title: "Change license and remove products",
      isChecked: false,
      dueDate: "Feb 12, 2027",
      commentCount: 1,
      category: "Marketing",
      userAvatar: "/images/user/user-11.jpg",
      status: "completed",
      tag: { text: 'Template', color: 'success' },
      toggleChecked: () => {}, // This will be replaced
    },
  ];

  lanes = ['todo', 'in-progress', 'completed'];
  tasks: Task[] = this.initialTasks.map(task => ({
    ...task,
    toggleChecked: () => this.toggleChecked(task.id),
  }));
  dragging: string | null = null;

  handleDragStart(event: DragEvent, taskId: string) {
    this.dragging = taskId;
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  handleDrop(event: DragEvent, status: string) {
    event.preventDefault();
    if (this.dragging === null) return;

    const updatedTasks = this.tasks.map(task =>
      task.id === this.dragging ? { ...task, status } : task
    );

    // Sort tasks within the same status
    const statusTasks = updatedTasks.filter(task => task.status === status);
    const otherTasks = updatedTasks.filter(task => task.status !== status);

    const dropY = event.clientY;
    const droppedIndex = statusTasks.findIndex(task => {
      const taskElement = document.getElementById(`task-${task.id}`);
      if (!taskElement) return false;
      const rect = taskElement.getBoundingClientRect();
      const taskMiddleY = rect.top + rect.height / 2;
      return dropY < taskMiddleY;
    });

    if (droppedIndex !== -1) {
      const draggedTask = statusTasks.find(task => task.id === this.dragging);
      if (draggedTask) {
        statusTasks.splice(statusTasks.indexOf(draggedTask), 1);
        statusTasks.splice(droppedIndex, 0, draggedTask);
      }
    }

    this.tasks = [...otherTasks, ...statusTasks];
    this.dragging = null;
  }

  toggleChecked(taskId: string) {
    this.tasks = this.tasks.map(task =>
      task.id === taskId ? { ...task, isChecked: !task.isChecked } : task
    );
  }

  getTasksByLane(lane: string) {
    return this.tasks.filter(task => task.status === lane);
  }
}
