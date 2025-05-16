import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { Observable } from 'rxjs';
import { Asset, AssetGalleryDto } from '../modals/manage-asset';
=======
import { catchError, Observable, throwError } from 'rxjs';
import { Asset, Gallery } from '../modals/manage-asset';
>>>>>>> 95ece7aed413107f8dbf8351ac690b01732c6dcb
import { ApiEndpoints } from '../constants/api-endpoints';
import { DirectSaleAssetDto } from '../modals/add-asset';

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
<<<<<<< HEAD
  }

  getDirectAssets(categoryId: number): Observable<DirectSaleAssetDto[]> {
    return this.http.get<DirectSaleAssetDto[]>(
      `${ApiEndpoints.ASSETS}/directsaleasset?categoryId=${categoryId}`
    );
  }

  getAuctionAssets(categoryId: number): Observable<DirectSaleAssetDto[]> {
    return this.http.get<DirectSaleAssetDto[]>(
      `${ApiEndpoints.ASSETS}/auctionasset?categoryId=${categoryId}`
    );
  }
=======
  }

>>>>>>> 95ece7aed413107f8dbf8351ac690b01732c6dcb
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

  getAssetById(assetId: number): Observable<Asset> {
    const url = `${ApiEndpoints.ASSETS}/${assetId}`;
    return this.http.get<Asset>(url);
  }
 

<<<<<<< HEAD
  updateAssetWithGallery(formData: FormData): Observable<any> {
    return this.http.put(`${ApiEndpoints.ASSETS}/update-asset-all`, formData);
  }

  getAssetGallery(assetId: number): Observable<AssetGalleryDto[]> {
    const url = `${ApiEndpoints.ASSETGALLERY}/${assetId}`;
    return this.http.get<AssetGalleryDto[]>(url);
  }
=======
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

  getDirectAssets(categoryId: number): Observable<DirectSaleAssetDto[]> {
    return this.http.get<DirectSaleAssetDto[]>(
      `${ApiEndpoints.ASSETS}/directsaleasset?categoryId=${categoryId}`
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

>>>>>>> 95ece7aed413107f8dbf8351ac690b01732c6dcb
}
