import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly baseUrl = ApiEndpoints.REPORTS;

  constructor(private http: HttpClient) {}

  getMonthlyAuctionRevenue(): Observable<any> {
    return this.http.get(`${this.baseUrl}/monthly-auction-revenue`);
  }

  getMonthlyDirectSaleRevenue(): Observable<any> {
    return this.http.get(`${this.baseUrl}/monthly-directsale-revenue`);
  }

  getHighBiddingCustomers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/high-bidding-customers`);
  }

  getDirectSaleAssets(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-directsale-assets`);
  }

  getAccountStatement(): Observable<any> {
    return this.http.get(`${this.baseUrl}/account-statement`);
  }

  getRefundRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-refund-request`);
  }

  getLatestDepositRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-latest-deposit`);
  }

  getAuctionsReport(reportType: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/report-auction?reportType=${encodeURIComponent(reportType)}`);
  }
}
