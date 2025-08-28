import { Injectable } from '@angular/core';
import { Addition, CartItem, Product } from '../cart/cart-item';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AddToCartService {

  cartItemSubject$ = new BehaviorSubject<CartItem[]>(this.loadFromStorage());
  totalPrice$: Observable<number> = this.cartItemSubject$.pipe(map((value) => value.reduce(((sum, price) => sum + price.allPrice), 0)))

  constructor() { }

  addToCart(item: CartItem) {
    const currentDish = this.cartItemSubject$.value;
    const existingDishIndex = currentDish.findIndex((cartItem) => cartItem.product.title === item.product.title);
    let updatedDish: CartItem[];

    if (existingDishIndex >= 0) {
      updatedDish = [...currentDish];
      const existingDish = updatedDish[existingDishIndex];
      const mergedAdditions = this.mergeAdditions(item.addition, existingDish.addition);
      const price = this.allPrice(item.product.price * (existingDish.quantityProduct + item.quantityProduct), mergedAdditions);

      updatedDish[existingDishIndex] = {
        ...existingDish,
        quantityProduct: existingDish.quantityProduct + item.quantityProduct,
        addition: mergedAdditions,
        allPrice: price
      }
    }
    else {
      updatedDish = [...currentDish, item]
    }
    this.cartItemSubject$.next(updatedDish)
    this.saveToStorage(updatedDish);
  }


  private mergeAdditions(newAdditions: Addition[], oldAdditions: Addition[]): Addition[] {
    const data = new Map<number, Addition>();
    for (const add of oldAdditions) {
      data.set(add.addition_id, { ...add });
    }
    for (const add of newAdditions) {
      if (data.has(add.addition_id)) {
        const existing = data.get(add.addition_id)!;
        data.set(add.addition_id, {
          ...existing,
          quantityAddition: existing.quantityAddition + add.quantityAddition
        });
      } else {
        data.set(add.addition_id, { ...add });
      }
    }
    return Array.from(data.values());
  }

  private allPrice(productPrice: number, additions: Addition[]): number {
    const additionPrice = additions.reduce((sum, add) => sum + (add.addition_price * add.quantityAddition), 0);
    const allPrice = productPrice + additionPrice
    return allPrice;
  }

  saveToStorage(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items))
  }

  loadFromStorage(): CartItem[] {
    let data = localStorage.getItem('cart');
    return data ? JSON.parse(data) : []
  }

  clearLocalStorage() {
    this.cartItemSubject$.next([])
    localStorage.removeItem('cart');
  }

  addQuantityProduct(selectedProduct: Product) {
    const currentProducts = this.cartItemSubject$.value;
    const updatedProduct = currentProducts.map(item => {
      if (item.product.title === selectedProduct.title) {
        const newQuantity = item.quantityProduct + 1;
        const additionsPrice = item.addition.reduce((sum, a) => sum + (a.addition_price * a.quantityAddition), 0);
        const price = (item.product.price * newQuantity) + additionsPrice;
        return {
          ...item,
          quantityProduct: newQuantity,
          allPrice: price,
        }
      }
      return item;
    })
    this.cartItemSubject$.next(updatedProduct);
    this.saveToStorage(updatedProduct)
  }

  removeQuantityProduct(selectedProduct: Product) {
    let currentProducts = this.cartItemSubject$.value;
    let updatedProduct = currentProducts.map(item => {
      if (item.product.title === selectedProduct.title) {
        const newQuantity = item.quantityProduct - 1;
        const additionsPrice = item.addition.reduce((sum, a) => sum + (a.addition_price * a.quantityAddition), 0);
        const price = (item.product.price * newQuantity) + additionsPrice;
        if (newQuantity < 1) return null
        return {
          ...item,
          quantityProduct: newQuantity,
          allPrice: price,
        }
      }
      return item;
    })
      .filter((item): item is CartItem => item !== null);
    this.cartItemSubject$.next(updatedProduct);
    this.saveToStorage(updatedProduct)
  }

  removeProduct(selectedProduct: Product) {
    const currentProducts = this.cartItemSubject$.value;
    const updatedProducts = currentProducts.filter(item => item.product.title !== selectedProduct.title);
    this.cartItemSubject$.next(updatedProducts);
    this.saveToStorage(updatedProducts);
  }


  addQuantityAdditions(selectedAddition: Addition) {
    let currentProduct = this.cartItemSubject$.value;
    let updatedCart = currentProduct.map(cartItem => {
      const updatedAdditions = cartItem.addition.map((add) => {
        if (add.addition_title === selectedAddition.addition_title) {
          return {
            ...add,
            quantityAddition: add.quantityAddition + 1
          }
        }
        return add
      })
      const additionPrice = updatedAdditions.reduce((sum, a) => sum + (a.addition_price * a.quantityAddition), 0);
      const price = (cartItem.product.price * cartItem.quantityProduct) + additionPrice;
      return {
        ...cartItem,
        addition: updatedAdditions,
        allPrice: price
      };
    }
    )
    this.cartItemSubject$.next(updatedCart);
    this.saveToStorage(updatedCart)
  }

  removeQuantityAdditions(selectedAddition: Addition) {
    let currentProduct = this.cartItemSubject$.value;
    let updatedCart = currentProduct.map(cartItem => {
      const updatedAdditions = cartItem.addition.map((add) => {
        if (add.addition_title === selectedAddition.addition_title) {
          return {
            ...add,
            quantityAddition: add.quantityAddition - 1
          }
        }
        return add
      })
      const additionPrice = updatedAdditions.reduce((sum, a) => sum + (a.addition_price * a.quantityAddition), 0);
      const price = (cartItem.product.price * cartItem.quantityProduct) + additionPrice;
      return {
        ...cartItem,
        addition: updatedAdditions,
        allPrice: price
      };
    }
    )
    this.cartItemSubject$.next(updatedCart);
    this.saveToStorage(updatedCart)
  }
}

