import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { concatMap, filter, first, map, mergeMap, Subject, takeUntil, tap } from 'rxjs';
import { AppState } from '../../services/appstate';
import { SourceFileProvider } from '../../services/txtfileprovider';

import { createEmptyTask, parseTodoTxt, stringifyTodoTxt, Task } from "@mktbsh/todotxt";

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskModal } from '../../components/task-modal/task-modal';

@Component({
  selector: 'app-mainview',
  imports: [FormsModule],
  templateUrl: './mainview.html',
  styleUrl: './mainview.scss'
})
export class Mainview implements OnDestroy, OnInit {

  private app: AppState;
  private _unsubscribe: Subject<void> = new Subject();

  private _working = 0;
  public working = signal(0);


  private addWorking(): void {
    this._working += 1;
    this.working.update(o => o + 1)
    console.log(`adding working: ${this._working}`);
  }
  private removeWorking(): void {
    setTimeout(() => {
      this._working -= 1;
      console.log(`removing working: ${this._working}`);
      this.working.update(o => o - 1);
    }, 1000);
  }

  availableSourceFileProviders: Array<SourceFileProvider> = [];

  private _currentProviderKey: string | null = null;
  get currentProviderKey(): string | null {
    return this._currentProviderKey;
  }
  set currentProviderKey(value: string) {
    this._currentProviderKey = value;
    const currentProvider = this.availableSourceFileProviders.find(o => o.key == this._currentProviderKey);
    this.app.setSourceFileProvider(currentProvider);
  }

  private modalService: NgbModal;
  private changeDetector: ChangeDetectorRef;

  constructor() {
    this.app = inject(AppState);
    this.modalService = inject(NgbModal);
    this.changeDetector = inject(ChangeDetectorRef);
  }

  ngOnInit(): void {
    this
      .app
      .availableProviders
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(o => {
        this.availableSourceFileProviders = o;
      });

    this.app.sourceFileProvider
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(o => {
        this._currentProviderKey = o.key;
        if (o.key !== null) {
          this.open();
        }
      })
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  public open() {
    this.addWorking();
    this.app
      .sourceFileProvider
      .pipe(
        first(),
        tap(o => console.log(o.name)),
        concatMap(x => x.provide()),
        filter(o => o != null),
        map(o => {
          return parseTodoTxt(o);
        }),
        takeUntil(this._unsubscribe)
      ).subscribe({
        next: x => { this.tasks.update(() => { return x; }) },
        error: () => this.removeWorking(),
        complete: () => this.removeWorking()
      });
  }

  public save() {
    const tasks = this.tasks();
    this.addWorking();
    const tasksString = stringifyTodoTxt(tasks);
    this.app.sourceFileProvider.pipe(
      first(),
      mergeMap(o => {
        return o.save(tasksString);
      }),
      takeUntil(this._unsubscribe)
    ).subscribe(o => {
      this.removeWorking();
    });
  }

  public tasks = signal<Task[]>([]);

  itemClicked(event: any, item: Task) {
    console.log('Event: ', event);
    console.log('Item:', item);
    item.completed = !item.completed;
    this.reorderTasks();
  }

  reorderTasks() {
    this.tasks.update(tasks => {
      const sorted = tasks.sort(this.compareTask)
      return sorted;
    })
  }

  compareTask(a: Task, b: Task): number {
    if (a.completed < b.completed) {
      return -1;
    }
    if (a.completed > b.completed) {
      return 1;
    }

    if (a.creationDate && b.creationDate) {
      if (a.creationDate < b.creationDate) {
        return -1;
      }
      if (a.creationDate > b.creationDate) {
        return 1;
      }
    }

    return a.text.localeCompare(b.text);
  }

  newTaskClick() {
    const newTask = createEmptyTask();
    const modalRef = this.modalService.open(TaskModal);
    modalRef.componentInstance.originalTask = newTask;
    modalRef.closed.pipe(
      takeUntil(this._unsubscribe)
    ).subscribe(o => {
      const task = o as Task;
      if (!task) {
        console.log("wrong response");
        return;
      }
      Promise.resolve(null).then(() => {
        this.tasks.update(tasks => [...tasks, task]);
        this.reorderTasks();
      })
    })
  }

  editTaskClick(event: any, item: Task) {
    event.stopPropagation();
    // tutaj pokazanie modala z edycja
    const modalRef = this.modalService.open(TaskModal)
    modalRef.componentInstance.originalTask = item;
    modalRef.closed
      .pipe(
        takeUntil(this._unsubscribe)
      )
      .subscribe(o => {
        const task = o as Task;
        if (!task) {
          console.log('wrong response ')
          return;
        }
        // this.originalTask.text = "changed";
        Promise.resolve(null).then(() => {
          Object.assign(item, task)
          this.changeDetector.detectChanges();
        });
      });
  }
}
