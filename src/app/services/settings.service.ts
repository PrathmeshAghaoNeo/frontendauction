import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import {
  AuctionSettings,
  FinanceSettings,
  DirectSaleSettings,
  StaticPagesSettings,
  FooterLinksSettings,
  AllSettings,
  UpdateFinanceSettingsCommand
} from '../modals/settings';
import { ApiEndpoints } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {

  constructor(private http: HttpClient) {}

  // Individual GET methods
  getAuctionSettings(): Observable<AuctionSettings> {
    return this.http.get<AuctionSettings>(`${ApiEndpoints.AUCTIONSETTINGS}`);
  }

  getFinanceSettings(): Observable<FinanceSettings> {
    return this.http.get<FinanceSettings>(`${ApiEndpoints.FINANCESETTINGS}/GetAll`);
  }

  getDirectSaleSettings(): Observable<DirectSaleSettings> {
    return this.http.get<DirectSaleSettings>(`${ApiEndpoints.DIRECTSALESETTINGS}`);
  }

  getStaticPagesSettings(): Observable<StaticPagesSettings> {
    return this.http.get<StaticPagesSettings>(`${ApiEndpoints.STATICPAGESETTINGS}`);
  }

  getFooterLinksSettings(): Observable<FooterLinksSettings> {
    return this.http.get<FooterLinksSettings>(`${ApiEndpoints.FOOTERLINKSETTINGS}`);
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
    return this.http.put(`${ApiEndpoints.AUCTIONSETTINGS}/${settings.id}`, settings);
  }
  
  updateFinanceSettings(settings: { financeSettings: FinanceSettings }): Observable<FinanceSettings> {
    return this.http.put<FinanceSettings>(`${ApiEndpoints.FINANCESETTINGS}/Update`, settings);
  }
  
  updateDirectSaleSettings(settings: DirectSaleSettings): Observable<any> {
    return this.http.put(`${ApiEndpoints.DIRECTSALESETTINGS}/${settings.id}`, settings);
  }
  
  updateStaticPagesSettings(settings:{settingsDto:StaticPagesSettings} ): Observable<StaticPagesSettings> {
    return this.http.put<StaticPagesSettings>(`${ApiEndpoints.STATICPAGESETTINGS}/Update`, settings);
  }
  
  updateFooterLinksSettings(settings: {footerLinksSettings:FooterLinksSettings}): Observable<FooterLinksSettings> {
    return this.http.put<FooterLinksSettings>(`${ApiEndpoints.FOOTERLINKSETTINGS}/Update`, settings);
  }
  
}
