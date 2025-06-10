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

  // getMonthlyAuctionRevenue(): Observable<any> {
  //   return this.http.get(`${this.baseUrl}/monthly-auction-revenue`);
  // }

  // getMonthlyDirectSaleRevenue(): Observable<any> {
  //   return this.http.get(`${this.baseUrl}/monthly-directsale-revenue`);
  // }

  getMonthlyAuctionRevenue(viewByMode: 'Monthly' | 'Yearly'): Observable<any> {
  return this.http.get(`${this.baseUrl}/auction-revenue`, {
    params: { viewByMode }
  });
}

  getMonthlyDirectSaleRevenue(viewByMode: 'Monthly' | 'Yearly'): Observable<any> {
  return this.http.get(`${this.baseUrl}/directsale-revenue`, {
    params: { viewByMode }
  });
}


  getHighBiddingCustomers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/high-bidding-customers`);
  }

  getDirectSaleAssets(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-directsale-assets`);
  }

  getAccountStatement(userId?: number): Observable<any> {
    let url = 'https://localhost:62627/api/Reports/account-statement';
    if (userId) {
      url += `?userId=${userId}`;
    }
    return this.http.get<any>(url);
  }

  getRefundRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-refund-request`);
  }

  getLatestDepositRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-latest-deposit`);
  }

  getAuctionsReport(reportType: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/report-auction?reportType=${encodeURIComponent(
        reportType
      )}`
    );
  }
}
