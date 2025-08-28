import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../sign-up/user.class';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  isLoggedIn: boolean = false;
  redirectUrl: string | null = null;
  currentUser: User | null = null;

  constructor(private router: Router) {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.isLoggedIn = true;
    }
  }

  saveUser(user: User) {
    localStorage.setItem('userData', JSON.stringify(user));
    this.isLoggedIn = true;
    this.currentUser = user;
  }
}
