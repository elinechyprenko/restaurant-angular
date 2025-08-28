import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, NgModule, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationStateService } from '../services/reservation-state.service';
import { PostDataService } from '../services/post-data.service';
import { ReservationTable } from '../reservation/reservation-item';
import { map, Observable, of, startWith, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-find-table',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  providers: [],
  templateUrl: './find-table.component.html',
  styleUrl: './find-table.component.scss'
})

export class FindTableComponent {
  formGroup: FormGroup | any = '';

  destroy$ = new Subject<void>();
  peopleOptions$: Observable<Array<{ value: number, label: string }>>;
  minDate$: Observable<string>;
  maxDate$: Observable<string>;
  hours$: Observable<string[]>;
  isFormValid$!: Observable<boolean>;

  @Output() tableFound = new EventEmitter<ReservationTable>()

  constructor(public reservationState: ReservationStateService, private postService: PostDataService, private fb: FormBuilder) {
    this.peopleOptions$ = this.initializePeopleOptions();
    this.hours$ = this.generateHours()
    const currentDate = new Date();
    this.minDate$ = of(this.formatDate(currentDate));

    const maxDate = new Date();
    maxDate.setDate(currentDate.getDate() + 21);
    this.maxDate$ = of(this.formatDate(maxDate));
  }

  ngOnInit(): void {
    this.formBuilder();
    this.isFormValid$ = this.isFormValid();
  };

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete()
  }

  public formBuilder(): void {
    this.formGroup = this.fb.group({
      people: [1, Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required]
    }
    )
  }

  initializePeopleOptions(): Observable<Array<{ value: number, label: string }>> {
    return of(Array.from({ length: 20 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1} ${i > 1 ? 'people' : 'person'}`
    })))
  };

  private generateHours(): Observable<string[]> {
    return of(Array.from({ length: 8 }, (_, i) => {
      const hour = 19 + Math.floor(i / 2);
      const minute = i % 2 === 0 ? '00' : '30';
      return `${hour}:${minute}`;
    }));
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isFormValid(): Observable<boolean> {
    return this.formGroup.statusChanges.pipe(
      startWith(this.formGroup.status),
      map(status => status === 'VALID')
    );

  };

  findTable() {
    const formValue = this.formGroup.value;
    const dataToSend = {
      people: formValue.people,
      date: formValue.date,
      time: formValue.time
    };
    console.log(dataToSend)
    this.postService.postTable(dataToSend).pipe(
      takeUntil(this.destroy$),
      tap({
        next: (res) => {
          if (res.status === 'available' || res.status === 'created') {
            this.tableFound.emit({ table_id: res.table_id, date: this.formGroup.value.date, time: this.formGroup.value.time, people: this.formGroup.value.people });
          }
          else if (res.status === 'busy') alert('The table is busy at the selected date and time. Please choose another time or date.')
        },
        error: (err) => {
          console.log('Error', err);
        }
      })
    ).subscribe()
  };
}
