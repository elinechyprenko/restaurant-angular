import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { emailValidator } from '../services/custom-validators';
import { RESERVATION_ERROR, RESERVATION_MESSAGE } from '../sign-up/form-data';
import { CommonModule, NgClass } from '@angular/common';
import { PostDataService } from '../services/post-data.service';
import { ReservationStateService } from '../services/reservation-state.service';
import { Observable, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgClass],
  providers: [],
  templateUrl: './reservation-details.component.html',
  styleUrl: './reservation-details.component.scss'
})
export class ReservationDetailsComponent {

  @Input() table_id: number = 0;
  @Input() date: string = ''
  @Input() time: string = '';
  @Input() people: number = 0;
  @Output() bookingDetails = new EventEmitter<{ table_id: number, email: string, fullName: string, phone: string, date: string, time: string, people: number }>()

  userForm: FormGroup | any = '';
  formError = RESERVATION_ERROR;
  validationMessage = RESERVATION_MESSAGE;
  destroy$ = new Subject<void>();

  get email(): AbstractControl { return this.userForm.get('email')!; }
  get fullName(): AbstractControl { return this.userForm.get('fullName')!; }
  get phone(): AbstractControl { return this.userForm.get('phone')!; }


  constructor(private formBuilder: FormBuilder, public postData: PostDataService, public reservationState: ReservationStateService) { }

  ngOnInit() {
    this.buildForm();
    this.setupFormListeners()
  }

  public buildForm(): void {
    this.userForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      email: ['', [Validators.required], [emailValidator]],
      phone: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(12)]],
      occasion: [''],
      request: ['']
    })
    this.userForm?.valueChanges?.subscribe(() => this.onValueChanges())
  }

  private setupFormListeners(): void {
    this.userForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.onValueChanges())
  }

  public onValueChanges(): void {
    const form: any = this.userForm;
    for (const field in this.formError) {
      this.formError[field] = '';
      const control = form.get(field);
      if (control && (control.dirty || control.touched) && control.invalid) {
        const validMessage = this.validationMessage[field];
        for (const key in control.errors) {
          for (const key in control.errors) {
            this.formError[field] = validMessage[key];
            break;
          }
        }
      }
    }
  };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;
    const formData = {
      ...this.userForm.value,
      table_id: this.table_id,
      date: this.date,
      time: this.time,
      people: this.people
    };

    this.booking(formData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.bookingDetails.emit({
          table_id: this.table_id,
          email: this.userForm.value.email,
          fullName: this.userForm.value.fullName,
          phone: this.userForm.value.phone,
          date: this.date,
          time: this.time,
          people: this.people
        });
        this.reservationState.confirmReservation(formData).subscribe();
      },
      error: (err) => console.error('Booking error:', err)
    });
  }

  private booking(formData: any): Observable<any> {
    return this.postData.postReservation(formData).pipe(
      tap(res => {
        if (res.status === 'available' || res.status === 'created') {
          formData.table_id = res.table_id;
        }
      })
    );
  }
}
