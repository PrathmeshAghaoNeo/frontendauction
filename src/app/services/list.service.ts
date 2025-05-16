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

  // Cart methods
  addToCart(payload: CartRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Cart/add`, payload);
  }

  getCart(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/Cart/get?userId=${userId}`);
  }

  removeFromCart(userId: number, assetId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Cart/remove?userId=${userId}&assetId=${assetId}`);
  }

  // Wishlist methods
  addToWishlist(payload: CartRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Wishlist/add`, payload);
  }

  getWishlist(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/Wishlist/${userId}`);
  }

  removeFromWishlist(userId: number, assetId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Wishlist/remove?userId=${userId}&assetId=${assetId}`);
  }

  refreshComponent(): void {
  const currentUrl = this.router.url;
  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    this.router.navigate([currentUrl]);
  });
}

}
