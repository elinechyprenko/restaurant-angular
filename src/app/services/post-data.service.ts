import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

const apiUrl = environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class PostDataService {

  constructor(private http: HttpClient) { }

  postUser(data: Object): Observable<any> {
    return this.http.post(`${apiUrl}/user`, data);
  }

  postReservation(data: Object): Observable<any> {
    return this.http.post(`${apiUrl}/booking`, data);
  }
  postTable(data: Object): Observable<any> {
    return this.http.post(`${apiUrl}/tables`, data);
  }
  postOrder(orderData: Object): Observable<any> {
    return this.http.post(`${apiUrl}/order`, orderData);
  }
  postDining(data: Object): Observable<any> {
    return this.http.post(`${apiUrl}/dining`, data);
  };
  postLogin(data: Object): Observable<any> {
    console.log(data)
    return this.http.post(`${apiUrl}/login`, data);
  }
  checkReservation(email: Object): Observable<any> {
    return this.http.post(`${apiUrl}/checkReservation`, { email })
  }
  changePassword(password: Object): Observable<any> {
    return this.http.post(`${apiUrl}/change-password`, password)
  }
}
