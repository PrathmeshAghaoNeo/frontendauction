import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/enviroments';
import { Router } from '@angular/router';


export interface CartRequest {
  userId: number;
  assetId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient,private router:Router) {}

  checkoutCart(payload: { userId: number; assetIds: number[] }) {
  return this.http.post(`${this.baseUrl}/Orders/create-order`, payload); 
}

  getCheckoutOrders(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/Orders/user/${userId}`);
  }

  

  addToCart(payload: CartRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Cart/add`, payload);
  }

  getCart(userId: number): Observable<any> {

    return this.http.get(`${this.baseUrl}/Cart/${userId}`);
  }


  removeFromCart(payload: { userId: number; assetId: number }): Observable<any> {
    return this.http.request('DELETE', `${this.baseUrl}/Cart/remove`, {
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });

  }

  // Wishlist methods
  addToWishlist(payload: CartRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Wishlist/add`, payload);
  }

  getWishlist(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/Wishlist/${userId}`);
  }


  

 removeFromWishlist(payload: { userId: number; assetId: number }): Observable<any> {
  return this.http.request('DELETE', `${this.baseUrl}/Wishlist/remove`, {
    headers: { 'Content-Type': 'application/json' },
    body: payload
  });
}

  refreshComponent(): void {
  const currentUrl = this.router.url;
  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    this.router.navigate([currentUrl]);
  });
}

}
