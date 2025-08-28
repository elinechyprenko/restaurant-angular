import { Component, Input } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { AccountComponent } from './account/account.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, AccountComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'restaurant';
  constructor(public router: Router, public authService: AuthService) { }

  ngOnInit() {
  }

  navbarChanges() {
    const allowedUrls = ['/menu', '/reservation', '/contact_us', '/sign_up', '/login', '/cart', '/account', '/order'];
    allowedUrls.includes(this.router.url);
    if (allowedUrls.includes(this.router.url) || this.router.url.startsWith('/order?') || this.router.url.startsWith('/reservation?')) {
      return true
    }
    else return false;
  }
}

