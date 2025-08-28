import { Component } from '@angular/core';
import { AddToCartService } from '../services/add-to-cart.service';
import { CommonModule } from '@angular/common';
import { GetDataService } from '../services/get-data.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Addition, CartItem, Product } from './cart-item';
import { AuthService } from '../services/auth.service';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { PostDataService } from '../services/post-data.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink],
  providers: [],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})

export class CartComponent {
  cartItem$: Observable<CartItem[]>;
  totalPrice$: Observable<number>
  selectedOrderMethod: string = 'takeaway';
  reservationMade: boolean = false;
  destroy$ = new Subject<void>()

  constructor(private cartService: AddToCartService, private getData: GetDataService, private http: HttpClient, private router: Router, private postData: PostDataService) {
    this.cartItem$ = this.cartService.cartItemSubject$.asObservable();
    this.totalPrice$ = cartService.totalPrice$;
  }

  ngOnInit() { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addProduct(selectedProduct: Product) {
    this.cartService.addQuantityProduct(selectedProduct);
  };

  removeProduct(selectedProduct: Product) {
    this.cartService.removeQuantityProduct(selectedProduct)
  }

  addAddition(selectedAddition: Addition) {
    this.cartService.addQuantityAdditions(selectedAddition);
  }

  removeAdditions(selectedAddition: Addition) {
    this.cartService.removeQuantityAdditions(selectedAddition);
  };


  close(selectedProduct: Product) {
    this.cartService.removeProduct(selectedProduct)
  }

  onOrderMethodChange(event: any) {
    this.selectedOrderMethod = event.target.value;
  }

  proceedToCheckout() {
    if (this.selectedOrderMethod === 'on-site-ordering') this.checkReservation();
    else this.router.navigate(['/order'], { queryParams: { method: this.selectedOrderMethod } });
  }

  checkReservation() {
    console.log('work')
    const userInfo = localStorage.getItem('userData');
    if (userInfo) {
      const parseEmail = JSON.parse(userInfo);
      const email = parseEmail.userData.email;
      console.log(email)
      this.postData.checkReservation(email).pipe(
        takeUntil(this.destroy$),
        tap((response) => {
          console.log('Work')
          if (response.reservationExists) this.router.navigate(['/order'], { queryParams: { method: 'on-site-ordering' } });
          else this.router.navigate(['/reservation'], { queryParams: { fromCart: true, method: 'on-site-ordering' } });
        })
      ).subscribe()
    }
    this.router.navigate(['/order'], { queryParams: { method: 'on-site-ordering' } });
  }
}