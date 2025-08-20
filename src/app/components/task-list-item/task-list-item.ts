import { Component, Input, input } from '@angular/core';
import { Task } from '@mktbsh/todotxt';

@Component({
  selector: 'app-task-list-item',
  imports: [],
  templateUrl: './task-list-item.html',
  styleUrl: './task-list-item.scss'
})
export class TaskListItem {
  @Input({required: true}) task!: Task;

  constructor() {
    
  }
}
