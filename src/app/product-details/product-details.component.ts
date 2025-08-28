import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { SharedDataService } from '../services/shared-data.service';
import { BehaviorSubject, combineLatest, filter, map, Observable, of, take } from 'rxjs';
import { Addition, Product } from '../cart/cart-item';
import { GetDataService } from '../services/get-data.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AddToCartService } from '../services/add-to-cart.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent {

  @Input() isClicked!: boolean;
  @Output() closeClicked = new EventEmitter<void>(false)

  selectedProduct$: Observable<Product>;
  selectedAdditions$: Observable<Addition[]>;
  quantityProduct$ = new BehaviorSubject(1);
  additionsWithQualtity$ = new BehaviorSubject<Addition[]>([]);
  allPrice$: Observable<number> = of(0);
  postData = false;

  constructor(public sharedService: SharedDataService, public getData: GetDataService, public authService: AuthService, public router: Router, public cartService: AddToCartService) {
    this.selectedProduct$ = sharedService.selectedProduct$.pipe(filter((product): product is Product => product !== null));
    this.selectedAdditions$ = combineLatest([this.selectedProduct$, getData.additions$]).pipe(
      map(([selectedProduct, additions]) => {
        return additions.filter(addition => addition.products.some(p => p.title === selectedProduct?.title))
      }))
  }

  ngOnInit() {
    this.selectedAdditions$.subscribe(additions => {
      const additionsWithQualtity = additions.map(add => ({
        ...add,
        quantityAddition: 0
      }));
      this.additionsWithQualtity$.next(additionsWithQualtity);
    }
    );
    this.totalPrice()
  }

  addProduct() {
    this.quantityProduct$.next(this.quantityProduct$.value + 1);
  };

  removeProduct(): any {
    if (this.quantityProduct$.value > 1) this.quantityProduct$.next(this.quantityProduct$.value - 1);
    else this.closeClicked.emit()
  };

  addAddition(addition: Addition) {
    const updateAddition = this.additionsWithQualtity$.value.map(add => {
      if (add.addition_id === addition.addition_id) {
        return { ...add, quantityAddition: add.quantityAddition + 1 }
      }
      return add
    })
    this.additionsWithQualtity$.next(updateAddition.filter((a): a is Addition => a !== undefined));
  }


  removeAdditions(addition: Addition) {
    const updateAddition = this.additionsWithQualtity$.value.map(add => {
      if (add.addition_id === addition.addition_id) {
        return { ...add, quantityAddition: add.quantityAddition - 1 }
      }
      return add
    })
    this.additionsWithQualtity$.next(updateAddition.filter((a): a is Addition => a !== undefined));
  }

  getQuantity(add: Addition): number {
    return this.additionsWithQualtity$.value.find(addition => addition.addition_id === add.addition_id)?.quantityAddition || 0;
  }

  totalPrice() {
    this.allPrice$ = combineLatest
      ([this.selectedProduct$, this.quantityProduct$, this.additionsWithQualtity$]).pipe(
        map(([product, quantity, addition]) => {
          let productPrice = +product!.price * quantity;
          let additionPrice = addition.reduce((sum, a) => sum + (a.addition_price * a.quantityAddition), 0);
          return (productPrice + additionPrice)
        })
      )
  }

  addToCart() {
    if (this.authService.isLoggedIn) {
      combineLatest([this.selectedProduct$, this.quantityProduct$, this.additionsWithQualtity$, this.allPrice$]).pipe(take(1))
        .subscribe(([product, quantityProduct, additions, allPrice]) => {
          let addition = additions.filter((addition) => addition.quantityAddition >= 1)
          this.cartService.addToCart({
            product: product,
            quantityProduct: quantityProduct,
            addition: addition,
            allPrice: allPrice
          })
        })
      this.postData = true;
    }
    else {
      this.authService.redirectUrl = this.router.url;
      this.router.navigate(['sign_up']);

    }
  }
}