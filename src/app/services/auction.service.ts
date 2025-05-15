import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auction } from '../modals/auctions';
import { ApiEndpoints } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AuctionService {

  constructor(private http: HttpClient) {}

  getAllAuctions(): Observable<Auction[]> {
    return this.http.get<Auction[]>(`${ApiEndpoints.AUCTION}`);
  }
  updateAuction(id: number, auctionData: any): Observable<any> {
    return this.http.put((`${ApiEndpoints.AUCTION}/${id}`), auctionData);
  }
  
  deleteAuction(id: number) {
    return this.http.delete(`${ApiEndpoints.AUCTION}/${id}`);
  }
  getAuctionById(id:number): Observable<Auction> {
    return this.http.get<Auction>(`${ApiEndpoints.AUCTION}/${id}`)
  }
}
