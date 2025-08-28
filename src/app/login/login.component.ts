import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PostDataService } from '../services/post-data.service';
import { catchError, of, Subject, takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Login } from './login.class';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterOutlet, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})

export class LoginComponent {
  userForm: FormGroup | any = '';
  private login: Login = new Login('', '');
  destroy$ = new Subject<void>();

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router, private postData: PostDataService) { }

  ngOnInit(): void {
    this.formLogin();
  }

  public formLogin(): void {
    this.userForm = this.formBuilder.group({
      email: [this.login.email, [Validators.required]],
      password: [this.login.password, [Validators.required]],
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete()
  }

  onSubmit() {
    const loginForm = this.userForm.value;
    this.postData.postLogin(loginForm).pipe(
      takeUntil(this.destroy$),
      tap((user) => {
        if (!user.success) {
          throw new Error(user.message);
        }
        else {
          this.authService.saveUser(user)
          this.router.navigate([this.authService.redirectUrl ? this.authService.redirectUrl : '/home'])
        }
      }),
      catchError((error) => {
        if (error.message === 'Incorrect password') alert('Incorrect password');
        if (error.message === 'User not found') alert('User not found');
        return of(null)
      })
    ).subscribe()
  }

}
