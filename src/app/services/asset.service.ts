import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Asset, Gallery, ReplaceAssetWinnerDto, TopBidderDto } from '../modals/manage-asset';
import { ApiEndpoints } from '../constants/api-endpoints';
import { DirectSaleAssetDto, Seller } from '../modals/add-asset';

@Injectable({
  providedIn: 'root',
})
export class ManageAssetService {
  constructor(private http: HttpClient) {}
  
  addAssetWithGallery(formData: FormData): Observable<any> {
    return this.http.post<any>(
      `${ApiEndpoints.ASSETS}/CreateWithGallery`,
      formData
    );
  }
  // Fetch all assets
  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${ApiEndpoints.ASSETS}/GetAll`);
  }
  getSellers(): Observable<Seller[]> {
    return this.http.get<Seller[]>(`${ApiEndpoints.ASSETS}/getSellers`);
  }

  // Search assets based on search text
  searchAssets(searchText: string): Observable<Asset[]> {
    const searchUrl = `${
      ApiEndpoints.ASSETS
    }/Search%20Asset?search=${encodeURIComponent(searchText)}`;
    return this.http.get<Asset[]>(searchUrl);
  }

  // Delete asset by ID
  deleteAsset(assetId: number): Observable<void> {
    const deleteUrl = `${ApiEndpoints.ASSETS}/${assetId}`;
    return this.http.delete<void>(deleteUrl);
  }
  getAssetById(assetId: number, langCode: string | null): Observable<Asset> {
    const lang = langCode ?? 'en'; 
    const url = `${ApiEndpoints.ASSETS}/${assetId}?Lang=${lang}`;
    console.log(url)
    return this.http.get<Asset>(url);
  }

  getTopBidders(assetId: number, auctionId: number): Observable<TopBidderDto[]> {
  const url = `${ApiEndpoints.ASSETS}/GetBidders?auctionId=${auctionId}&assetId=${assetId}`;
  return this.http.get<TopBidderDto[]>(url).pipe(
    catchError((error) => {
      console.error('Error fetching top bidders:', error);
      return throwError(() => error);
    })
  );
  }

  replaceWinner(dto: ReplaceAssetWinnerDto): Observable<{ winnerId: number }> {
    return this.http.post<{ winnerId: number }>(`${ApiEndpoints.ASSETS}/replace-winner`, dto);
  }

 

  deleteAssetGallery(galleryId: string): Observable<void> {
  const url = `${ApiEndpoints.ASSETGALLERY}/delete/${galleryId}`;
  return this.http.delete<void>(url);
  }


  deleteAssetDocument(documentId: string): Observable<void> {
    const url = `${ApiEndpoints.ASSESTDOCUMENT}/delete/${documentId}`;
    return this.http.delete<void>(url);
  }
  

  updateAssetWithGallery(formData: FormData): Observable<any> {
    return this.http.put(`${ApiEndpoints.ASSETS}/update-asset-all`, formData);
  }

  getDirectAssets(categoryId: number,langCode:string |null): Observable<DirectSaleAssetDto[]> {
    const lang = langCode ?? 'en'; 
    return this.http.get<DirectSaleAssetDto[]>(
      `${ApiEndpoints.ASSETS}/directsaleasset?categoryId=${categoryId}&lang=${lang}`
    );
  }
   getAssetGallery(assetId: number): Observable<Gallery[]> {
    const url = `${ApiEndpoints.ASSETGALLERY}/${assetId}`;
    return this.http.get<Gallery[]>(url);
  }

  getAuctionAssets(categoryId: number): Observable<DirectSaleAssetDto[]> {
    return this.http.get<DirectSaleAssetDto[]>(
      `${ApiEndpoints.ASSETS}/auctionasset?categoryId=${categoryId}`
    );
  }

}