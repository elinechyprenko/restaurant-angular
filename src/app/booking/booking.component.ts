import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReservationStateService } from '../services/reservation-state.service';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AddToCartService } from '../services/add-to-cart.service';
import { Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  providers: [],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent {

  @Input() table_id: number = 0;
  @Input() email: string = '';
  @Input() fullName: string = '';
  @Input() phone: string = '';
  @Input() date: string = ''
  @Input() time: string = '';
  @Input() people: number = 0;
  @Output() onCancel = new EventEmitter<void>();
  backtoCart = false;

  destroy$ = new Subject<void>()

  constructor(public reservationService: ReservationStateService, public authService: AuthService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.checkMethod();
  }

  cancelReservation(): void {
    this.reservationService.deleteReservation(this.table_id).pipe(
      tap({
        next: () => this.onCancel.emit(),
        error: (err) => console.error('Error cancelling reservation:', err)
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private checkMethod(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.backtoCart = !!(
        params['fromCart'] &&
        params['method'] === 'on-site-ordering'
      );
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}