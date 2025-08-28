import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { emailValidator } from '../services/custom-validators';
import { DINING_ERROR, DINING_MESSAGE } from '../sign-up/form-data';
import { PostDataService } from '../services/post-data.service';
import { catchError, of, Subject, takeUntil, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-group-dining',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ReactiveFormsModule],
  providers: [],
  templateUrl: './group-dining.component.html',
  styleUrl: './group-dining.component.scss'
})

export class GroupDiningComponent {
  diningForm: FormGroup | any = '';
  minDate: string = '';
  formError = DINING_ERROR
  validationMessage = DINING_MESSAGE;
  get email(): AbstractControl | null { return this.diningForm.get('email') };
  get fullName(): AbstractControl | null { return this.diningForm.get('fullname') };
  get phone(): AbstractControl | null { return this.diningForm.get('phone') };
  get date(): AbstractControl | null { return this.diningForm.get('date') };
  get startTime(): AbstractControl | null { return this.diningForm.get('startTime') };
  get endTime(): AbstractControl | null { return this.diningForm.get('endTime') };
  get people(): AbstractControl | null { return this.diningForm.get('people') };

  destroy$ = new Subject<void>();
  postData = false;

  constructor(public authService: AuthService, private fb: FormBuilder, private postService: PostDataService) {
    const currentDate = new Date();
    this.minDate = this.formatDate(currentDate);
  }

  ngOnInit() {
    this.formBuilder()
    this.setupFormListeners();
  }

  formBuilder() {
    this.diningForm = this.fb.group({
      email: ['', [Validators.required], [emailValidator]],
      fullName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(12)]],
      date: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      people: ['', [Validators.required, Validators.min(15)]],
      natureEvent: [''],
      info: ['']
    })

  }
  private setupFormListeners(): void {
    this.diningForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.onValueChanges())
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public onValueChanges(): void {
    const form: any = this.diningForm;
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(form: FormGroup) {
    const formData = form.value;
    this.postService.postDining(formData).pipe(
      tap(() => this.postData = true),
      catchError((error) => {
        console.error('Error submitting the form:', error);
        alert('Something went wrong. Please try again later.');
        return of(null);
      })
    ).subscribe();
  }
}
