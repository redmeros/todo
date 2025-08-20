import { Injectable, Provider } from "@angular/core";
import { Task, TaskDate } from "@mktbsh/todotxt";
import { NgbDateAdapter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";



@Injectable()
export class CustomDateAdapter extends NgbDateAdapter<TaskDate> {

    override fromModel(value: TaskDate | null): NgbDateStruct | null {
        if (!value) return null;
        return {
            day: value.getDate(),
            month: value.getMonth(),
            year: value.getFullYear()
        }
    }
    override toModel(date: NgbDateStruct | null): TaskDate | null {
        if (!date) return null;
        const d = new Date(date.year, date.month - 1, date.day - 1);
        return d as TaskDate        
    }
    
}

export function AddTaskDateDateAdapter() : Provider {
    return [
        {
            provide: NgbDateAdapter,
            useClass: CustomDateAdapter
        }
    ]
}