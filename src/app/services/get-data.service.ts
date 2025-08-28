import { HttpClient, HttpHandler, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Addition, CategoryWithProduct } from '../cart/cart-item';
import { environment } from '../../environments/environment.development';

const apiUrl = environment.apiUrl;


@Injectable({
  providedIn: 'root'
})
export class GetDataService {

  categoryWithProducts$: Observable<CategoryWithProduct[]>;
  image$: Observable<any[]>;
  additions$: Observable<Addition[]>;

  constructor(private http: HttpClient) {
    this.categoryWithProducts$ = this.http.get<CategoryWithProduct[]>(`${apiUrl}/products`).pipe(catchError(() => of([])));
    this.image$ = this.http.get<any[]>(`${apiUrl}/images`)
    this.additions$ = this.http.get<Addition[]>(`${apiUrl}/additions`).pipe(
      map(additions => additions.map(addition => ({
        ...addition,
        quantityAddition: 0
      }))),
      catchError(() => of([]))
    )
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${apiUrl}/user/email?email=${email}`);
  }
  checkPhoneExists(phone: string): Observable<boolean> {
    return this.http.get<boolean>(`${apiUrl}/user/phone?phone=${phone}`)
  }
  getOrderData(params: HttpParams): Observable<any> {
    return this.http.get(`${apiUrl}/get-order-data`, { params });
  }
  getReservationTable(params: HttpParams): Observable<any> {
    return this.http.get(`${apiUrl}/get-reservation-tables`, { params });
  }

}
