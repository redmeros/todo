import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '@mktbsh/todotxt';
import { NgbActiveModal, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { StringGroup } from "../string-group/string-group";

@Component({
  selector: 'app-task-modal',
  imports: [NgbInputDatepicker, FormsModule, StringGroup],
  templateUrl: './task-modal.html',
  styleUrl: './task-modal.scss'
})
export class TaskModal implements OnInit {
  
  @Input() originalTask! : Task;

  cloned!: Task;

  modal = inject(NgbActiveModal);

  okClicked() {
    this.modal.close(this.cloned);
  }

  ngOnInit(): void {
    console.log(this.originalTask);
    this.cloned = structuredClone(this.originalTask)
  }
}
