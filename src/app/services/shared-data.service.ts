import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { Product } from '../cart/cart-item';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  private selectedProduct = new BehaviorSubject<Product | null>(null);
  selectedProduct$ = this.selectedProduct.asObservable();

  constructor() { }

  updateSelectedProduct(product: Product) {
    this.selectedProduct.next(product)
  }
}
