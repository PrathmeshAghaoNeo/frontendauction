import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import {
  AuctionSettings,
  FinanceSettings,
  DirectSaleSettings,
  StaticPagesSettings,
  FooterLinksSettings,
  AllSettings
} from '../modals/settings';
import { ApiEndpoints } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {

  constructor(private http: HttpClient) {}

  // Individual GET methods
  getAuctionSettings(): Observable<AuctionSettings> {
    return this.http.get<AuctionSettings>(`${ApiEndpoints.AUCTIONSETTINGS}/AuctionSettings`);
  }

  getFinanceSettings(): Observable<FinanceSettings> {
    return this.http.get<FinanceSettings>(`${ApiEndpoints.FINANCESETTINGS}/FinanceSettings/GetAll`);
  }

  getDirectSaleSettings(): Observable<DirectSaleSettings> {
    return this.http.get<DirectSaleSettings>(`${ApiEndpoints.DIRECTSALESETTINGS}/DirectSaleSettings`);
  }

  getStaticPagesSettings(): Observable<StaticPagesSettings> {
    return this.http.get<StaticPagesSettings>(`${ApiEndpoints.STATICPAGESETTINGS}/StaticPagesSettings`);
  }

  getFooterLinksSettings(): Observable<FooterLinksSettings> {
    return this.http.get<FooterLinksSettings>(`${ApiEndpoints.FOOTERLINKSETTINGS}/FooterLinksSettings/Get`);
  }

  // Combined GET method
  getAllSettings(): Observable<AllSettings> {
    return forkJoin({
      auctionSettings: this.getAuctionSettings(),
      financeSettings: this.getFinanceSettings(),
      directSaleSettings: this.getDirectSaleSettings(),
      staticPages: this.getStaticPagesSettings(),
      footerLinks: this.getFooterLinksSettings()
    });
  }

  // Individual UPDATE methods
  updateAuctionSettings(settings: AuctionSettings): Observable<any> {
    return this.http.put(`${ApiEndpoints.AUCTIONSETTINGS}/AuctionSettings`, settings);
  }

  updateFinanceSettings(settings: FinanceSettings): Observable<any> {
    return this.http.put(`${ApiEndpoints.FINANCESETTINGS}/FinanceSettings`, settings);
  }

  updateDirectSaleSettings(settings: DirectSaleSettings): Observable<any> {
    return this.http.put(`${ApiEndpoints.DIRECTSALESETTINGS}/DirectSaleSettings`, settings);
  }

  updateStaticPagesSettings(settings: StaticPagesSettings): Observable<any> {
    return this.http.put(`${ApiEndpoints.STATICPAGESETTINGS}/StaticPagesSettings`, settings);
  }

  updateFooterLinksSettings(settings: FooterLinksSettings): Observable<any> {
    return this.http.put(`${ApiEndpoints.FOOTERLINKSETTINGS}/FooterLinksSettings`, settings);
  }
}
