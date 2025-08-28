import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { birthdayValidator, emailValidator, passwordMatchValidator, passwordValidator } from '../services/custom-validators';
import { FORM_ERROR, VALIDATION_MESSAGE } from './form-data';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { GetDataService } from '../services/get-data.service';
import { PostDataService } from '../services/post-data.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { concatMap, Subject, takeUntil, tap, throwError } from 'rxjs';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterOutlet, RouterLink],
  providers: [],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

  userForm: FormGroup | any = '';
  formError = FORM_ERROR;
  validationMessage = VALIDATION_MESSAGE;
  userData: any = '';

  destroy$ = new Subject<void>()

  get email(): AbstractControl | null { return this.userForm.get('email') };
  get fullName(): AbstractControl | null { return this.userForm.get('fullname') };
  get phone(): AbstractControl | null { return this.userForm.get('phone') };
  get birthday(): AbstractControl | null { return this.userForm.get('birthday') };
  get password(): AbstractControl | null { return this.userForm.get('password') };
  get confirmPassword(): AbstractControl | null { return this.userForm.get('confirmPassword') };


  constructor(private formBuilder: FormBuilder, private http: HttpClient, private getData: GetDataService,
    private postData: PostDataService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.buildForm();
    this.setupFormListeners()
  };

  public buildForm(): void {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required], [emailValidator]],
      fullName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(12)]],
      birthday: ['', [Validators.required], [birthdayValidator]],
      password: ['', [Validators.required], [passwordValidator]],
      confirmPassword: ['', [Validators.required], [passwordMatchValidator('password')]]
    })
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

  onDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  };

  onSubmit() {
    this.userData = this.userForm.value;
    this.getData.checkEmailExists(this.userData.email).pipe(
      takeUntil(this.destroy$),
      concatMap((res) => {
        if (res) {
          console.log('email is already been!')
          this.email?.setErrors({ 'emailExist': true })
          return throwError(() => new Error('Email already exists'));
        }
        return this.getData.checkPhoneExists(this.userData.phone)
      }),
      concatMap((phoneExist) => {
        if (phoneExist) {
          console.log('phone is already been!');
          this.phone?.setErrors({ 'phoneExist': true });
          return throwError(() => new Error('Phone already exists'));
        }
        return this.postData.postUser(this.userData).pipe(
          tap((res) => {
            console.log(res)
            this.authService.saveUser(res);

            const redirectUrl = this.authService.redirectUrl || '/home';
            this.router.navigate([redirectUrl]);
          })
        )
      })
    ).subscribe({
      next: () => console.log('Registration completed'),
      error: (err) => console.log('Register error', err)
    })
  }
}
