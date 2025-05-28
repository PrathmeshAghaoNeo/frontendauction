import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AutoBidDto, BidDto, bidStats } from '../modals/bid-stats';
import { ApiEndpoints } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class BidService {
  constructor(private http: HttpClient) {}

  getBidStatsById(assetId: number): Observable<bidStats> {
    return this.http.get<bidStats>(`${ApiEndpoints.Bid}/Assetstats/${assetId}`);
  }
  placeBid(bidData: BidDto): Observable<{ bidId: number }> {
    return this.http.post<{ bidId: number }>(
      `${ApiEndpoints.Bid}/place`,
      bidData
    );
  }

  getAutoBid(
    userId: number| null,
    auctionId: number,
    assetId: number
  ): Observable<AutoBidDto> {
    const url = `${ApiEndpoints.Bid}/GetAutoData/${userId}/${auctionId}/${assetId}`;
    return this.http.get<AutoBidDto>(url);
  }

  placeAutoBid(autoBidData: {
    userId: number |null;
    auctionId: number;
    assetId: number;
    maxBidAmount: number;
  }): Observable<{ bidId: number; message: string }> {
    return this.http.post<{ bidId: number; message: string }>(
      `${ApiEndpoints.Bid}/auto`,
      autoBidData
    );
  }

 removeAutoBid(payload: {
  userId: number|null;
  auctionId: number;
  assetId: number;
}): Observable<string> {
  return this.http.delete<string>(`${ApiEndpoints.Bid}/remove`, {
    body: payload
  });
}

}
