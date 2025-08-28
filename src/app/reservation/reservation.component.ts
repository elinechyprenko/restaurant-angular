import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FindTableComponent } from "../find-table/find-table.component";
import { ReservationDetailsComponent } from "../reservation-details/reservation-details.component";
import { AuthService } from '../services/auth.service';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BookingComponent } from "../booking/booking.component";
import { ReservationStateService } from '../services/reservation-state.service';
import { AddToCartService } from '../services/add-to-cart.service';
import { ReservationDetails, ReservationTable } from './reservation-item';
import { Observable, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-reservation',
  standalone: true,
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss',
  imports: [CommonModule, FindTableComponent, ReservationDetailsComponent, RouterLink, RouterOutlet, BookingComponent],
  providers: []
})

export class ReservationComponent {
  currentStep: 'find-table' | 'your-details' | 'booking' | null = 'find-table';
  selectedTable: ReservationTable | null = null;
  booking: Observable<ReservationDetails | null>

  destroy$ = new Subject<void>();

  constructor(public authService: AuthService, public reservationState: ReservationStateService) {
    reservationState.reservation$.pipe(takeUntil(this.destroy$)).subscribe((reservation) => this.currentStep = reservation ? 'booking' : 'find-table');
    this.booking = reservationState.reservation$;
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTab(step: 'find-table' | 'your-details') {
    this.currentStep = step;
  }
  onFoundTable(event: ReservationTable) {
    this.selectedTable = event;
    this.currentStep = 'your-details'
  }
  reservationConfirmation(event: ReservationDetails) {
    this.reservationState.confirmReservation(event).subscribe();
  }

  onReservationCancelled() {
    this.currentStep = 'find-table';
  }
}
