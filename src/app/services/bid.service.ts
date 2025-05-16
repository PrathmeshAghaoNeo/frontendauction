import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BidDto, bidStats } from '../modals/bid-stats';
import { ApiEndpoints } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class BidService {

  constructor(private http: HttpClient) { }

  getBidStatsById(assetId: number):Observable<bidStats> {
    return this.http.get<bidStats>(`${ApiEndpoints.Bid}/Assetstats/${assetId}`)
  }
  placeBid(bidData : BidDto): Observable<{bidId: number}>{
    return this.http.post<{bidId: number}>(`${ApiEndpoints.Bid}/place`,bidData);
  }
}
