import { Component, NgModule } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../sign-up/user.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { ReservationTables } from './reservation-tables.class';
import { OrderData } from './order-data-class';
import { GetDataService } from '../services/get-data.service';
import { catchError, Subject, takeUntil, tap, throwError } from 'rxjs';
import { PostDataService } from '../services/post-data.service';
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})

export class AccountComponent {
  userData: User = new User('', '', 0, null, '');
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  reservationTables: ReservationTables[] = [];
  orderData: OrderData[] = [];

  destroy$ = new Subject<void>();

  constructor(public authService: AuthService, private router: Router, private http: HttpClient, private getDataService: GetDataService, private postData: PostDataService) { }

  ngOnInit() {
    this.getData();
    this.getReservation();
    this.getOrder();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getData() {
    const userDataString = localStorage.getItem('userData');
    console.log(userDataString)
    if (userDataString) {
      const data = JSON.parse(userDataString)
      this.userData = data.userData;
    }
    else console.error('Data is not get');
    console.log(this.userData)
  };

  getReservation() {
    const userEmail = this.userData.email;
    const params = new HttpParams().set('email', userEmail);
    this.getDataService.getReservationTable(params).pipe(
      takeUntil(this.destroy$),
      tap((response) => {
        this.reservationTables = response;
        console.log('Reservation is: ', this.reservationTables)
      }),
      catchError((error) => throwError(() => error))
    ).subscribe()
  }

  getOrder() {
    const userEmail = this.userData.email;
    console.log(userEmail)
    const params = new HttpParams().set('email', userEmail);
    this.getDataService.getOrderData(params).pipe(
      takeUntil(this.destroy$),
      tap((respone) => {
        this.orderData = respone;
        console.log(respone);
        console.log(this.orderData)
      }),
      catchError((error) => throwError(() => error))
    ).subscribe();
  }

  signOut() {
    this.authService.isLoggedIn = false;
    localStorage.removeItem('userData')
    this.router.navigate(['/home']);
  }

  checkPasswordsMatch(): boolean {
    return this.newPassword === this.confirmPassword
  };
  removePassword() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
  cancel() {
    this.removePassword();
  }

  saveData() {
    const savePassword = {
      email: this.userData.email,
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }
    this.postData.changePassword(savePassword).pipe(
      takeUntil(this.destroy$),
      tap((res) => {
        if (res.success) {
          alert('Password changed successfully');
          this.removePassword();
        }
        if (res.status === 401) {
          alert('Current password is incorrect')
        }
      }),
      catchError((error) => {
        console.error('Password change error:', error);
        if (error.status === 401) {
          alert('Current password is incorrect');
        }
        return throwError(() => error)
      })
    ).subscribe()
  }
}
