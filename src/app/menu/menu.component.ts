import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { GetDataService } from '../services/get-data.service';
import { RouterModule } from '@angular/router';
import { Addition, CategoryWithProduct, Product } from '../cart/cart-item';
import { catchError, map, Observable, of, reduce } from 'rxjs';
import { SharedDataService } from '../services/shared-data.service';
import { ProductDetailsComponent } from "../product-details/product-details.component";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ProductDetailsComponent, RouterModule],
  providers: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})

export class MenuComponent implements OnInit {
  private getData = inject(GetDataService);
  private sharedService = inject(SharedDataService)

  categoryWithProducts$: Observable<CategoryWithProduct[]>;
  image$: Observable<any>;
  additions$: Observable<Addition[]>;
  selectedAdditions$: Observable<Addition[]> = of([]);
  isClicked = signal(false);

  constructor() {
    this.categoryWithProducts$ = this.getData.categoryWithProducts$;
    this.image$ = this.getData.image$;
    this.additions$ = this.getData.additions$.pipe(
      map(addition => { return { ...addition, quantityAddition: 0 } }),
      catchError(() => of([]))
    );

  }

  ngOnInit(): void {
  };

  open(product: Product): void {
    this.sharedService.updateSelectedProduct(product);
    this.isClicked.set(true);
  }

  close() {
    this.isClicked.set(false)
  }

}
