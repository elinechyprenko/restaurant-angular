import { BehaviorSubject } from "rxjs"

export interface CartItem {
    product: Product,
    quantityProduct: number
    addition: Addition[]
    allPrice: number,
};
export interface Addition {
    addition_id: number,
    products: Product[],
    addition_title: string,
    addition_price: number,
    quantityAddition: number,
}
export interface Product {
    id: number,
    description: string,
    image: string
    info: string,
    price: number,
    title: string,
    quantityProduct: number
}
export interface CategoryWithProduct {
    category_title: string,
    products: Product[],
    productCount: number
}

export interface AdditionWithQuantity {
    addition: Addition;
    quantity$: BehaviorSubject<number>;
}