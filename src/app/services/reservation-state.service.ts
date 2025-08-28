import { Injectable } from '@angular/core';
import { reservationItem } from '../reservation-details/reservation.item';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { ReservationDetails } from '../reservation/reservation-item';

@Injectable({
  providedIn: 'root'
})
export class ReservationStateService {
  reservation = false;
  reservationData: string | null = localStorage.getItem('dataReservation');
  reservationItem: reservationItem[] = [];
  reservartionData$ = new BehaviorSubject<ReservationDetails | null>(null)

  constructor(private http: HttpClient) {
    this.loadInitialState();
  }

  loadInitialState(): void {
    const localData = localStorage.getItem('dataReservation');
    if (localData) {
      try {
        this.reservartionData$.next(JSON.parse(localData));
      }
      catch {
        this.clearReservation();
      }
    }
  }

  confirmReservation(data: ReservationDetails) {
    return of(data).pipe(
      tap(reservation => {
        localStorage.setItem('dataReservation', JSON.stringify(data));
        this.reservartionData$.next(reservation);
      }),
      map(() => undefined)
    )
  }

  get reservation$(): Observable<ReservationDetails | null> {
    return this.reservartionData$.asObservable()
  }

  deleteReservation(table_id: number): Observable<any> {
    return this.http.delete(`http://localhost:3000/booking/${table_id}`).pipe(
      tap(() => {
        localStorage.removeItem('dataReservation');
        this.reservartionData$.next(null);
      })
    )
  }

  clearReservation() {
    localStorage.removeItem('dataReservation');
    this.reservartionData$.next(null);
  }

}
