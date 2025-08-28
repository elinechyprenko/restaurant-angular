import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, AfterViewChecked, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AddToCartService } from '../services/add-to-cart.service';
import { CartItem } from '../cart/cart-item';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StripeService } from '../services/stripe.service';
import { PostDataService } from '../services/post-data.service';
import { catchError, from, map, Observable, Subject, switchMap, take, takeUntil, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule],
  providers: [],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit, AfterViewInit, AfterViewChecked {

  cartItem$: Observable<CartItem[]>;
  selectedMethod: string = '';
  totalBlock = false;
  selectedPaymentOption: string = '';

  subtotal$: Observable<number>;
  totalPrice$!: Observable<number>
  deliveryPrice: number = 10;
  packingPrice: number = 2;

  orderFinish = false;
  minDate: string = '';
  maxDate: string = '';

  siteForm: FormGroup | any = '';
  deliveryForm: FormGroup | any = '';
  takeawayForm: FormGroup | any = '';

  destroy$ = new Subject<void>()

  constructor(private fb: FormBuilder, public route: ActivatedRoute, private cartService: AddToCartService, private stripeService: StripeService, private postData: PostDataService) {
    this.subtotal$ = cartService.totalPrice$;
    this.cartItem$ = cartService.cartItemSubject$.asObservable();

    const currentDate = new Date();
    this.minDate = this.formatDate(currentDate);
    currentDate.setDate(currentDate.getDate() + 21);
    this.maxDate = this.formatDate(currentDate);
  }

  ngOnInit() {
    this.getMethod();
    this.formBuild();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngAfterViewInit() {
    this.stripeService.initializeStripe();
  }

  ngAfterViewChecked() {
    if ((this.selectedPaymentOption === '50%' || this.selectedPaymentOption === '100%') && this.stripeService.isStripeInitialized() && !this.stripeService.cardElement) {
      this.stripeService.createCardElement();
      this.stripeService.mountCardElement('card-element');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getMethod() {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$),
      tap((params) => this.selectedMethod = params['method'])
    ).subscribe();
  }

  public formBuild(): void {
    this.siteForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
    });
    this.deliveryForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      address: ['', Validators.required],
      postcode: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required]
    });
    this.takeawayForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      date: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

  totalPrice() {
    this.selectedPaymentOption = '100%';
    this.totalBlock = true;
    if (this.selectedMethod === 'on-site-ordering' || this.selectedMethod === 'takeaway') this.totalPrice$ = this.subtotal$;
  }

  halfPrice() {
    this.selectedPaymentOption = '50%';
    this.totalBlock = true;
    if (this.selectedMethod === 'on-site-ordering') this.totalPrice$ = this.subtotal$.pipe(map((value) => value / 2))
    if (this.selectedMethod === 'takeaway') this.totalPrice$ = this.subtotal$.pipe(map((value) => (value / 2) + this.packingPrice))
  }

  cash() {
    this.selectedPaymentOption = 'cash'
    if (this.selectedMethod === 'delivery') this.totalPrice$ = this.subtotal$.pipe(map((value) => value + this.deliveryPrice));
    if (this.selectedMethod === 'takeaway') this.totalPrice$ = this.subtotal$.pipe(map((value) => value + this.packingPrice));
  }

  submitOrder() {
    let formData: any;
    if (this.selectedMethod === 'on-site-ordering') formData = this.siteForm.value;
    else if (this.selectedMethod === 'delivery') formData = this.deliveryForm.value;
    else if (this.selectedMethod === 'takeaway') formData = this.takeawayForm.value;

    this.cartItem$.pipe(
      take(1),
      switchMap(cartItem => {
        const transformedCartItem = cartItem.map(item => ({
          product_title: item.product.title,
          price: item.product.price,
          quantityProduct: item.quantityProduct,
          addition: item.addition.map(i => i.addition_title),
          quantityAddition: item.addition.map(i => i.quantityAddition),
          additionPrice: item.addition.map(i => i.addition_price)
        }))
        return this.totalPrice$.pipe(
          take(1),
          map(totalPrice => ({
            order_method: this.selectedMethod,
            ...formData,
            cartItems: transformedCartItem,
            selectedPayment: this.selectedPaymentOption,
            total_price: totalPrice
          }))
        )
      }),
      switchMap(orderData => {
        console.log(orderData)
        if (this.selectedPaymentOption === 'cash') {
          return this.postData.postOrder(orderData).pipe(
            tap(() => {
              this.orderFinish = true;
              this.cartService.clearLocalStorage()
            }),
            catchError((error) => {
              console.log('Error', error);
              return throwError(() => error)
            })
          )
        }
        else {
          return this.processStripePayment(orderData);
        }
      })
    ).subscribe()
  }

  async processStripePayment(orderData: any) {
    try {
      const paymentIntentResponse: any = await this.stripeService.createPaymentIntent(orderData.total_price);
      const clientSecret = paymentIntentResponse.clientSecret;
      const result = await this.stripeService.confirmPayment(clientSecret, orderData);
      if (result && result.error) {
        console.error('Payment failed', result.error);
      } else if (result && result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        this.postData.postOrder(orderData).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.orderFinish = true;
            this.cartService.clearLocalStorage();
          },
          error: (error) => console.log('Error', error)
        }

        );
      } else {
        console.error('Payment confirmation failed or was incomplete.');
      }
    } catch (error) {
      console.error('Error processing payment', error);
    }
  }
}
