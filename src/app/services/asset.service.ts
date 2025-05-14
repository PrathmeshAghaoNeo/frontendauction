import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Asset } from '../modals/manage-asset';
import { ApiEndpoints } from '../constants/api-endpoints';
import { DirectSaleAssetDto } from '../modals/add-asset';
 
@Injectable({
  providedIn: 'root'
})
export class ManageAssetService {
  
  constructor(private http: HttpClient) { }
 


  addAssetWithGallery(formData: FormData): Observable<any> {
    return this.http.post<any>(`${ApiEndpoints.ASSETS}/CreateWithGallery`, formData);
  }
  // Fetch all assets
  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${ApiEndpoints.ASSETS}/GetAll`); 
  }

  getDirectAssets(categoryId: number): Observable<DirectSaleAssetDto[]> {
  return this.http.get<DirectSaleAssetDto[]>(`${ApiEndpoints.ASSETS}/directsaleasset?categoryId=${categoryId}`);
}

 
  // Search assets based on search text
  searchAssets(searchText: string): Observable<Asset[]> {
    const searchUrl = `${ApiEndpoints.ASSETS}/Search%20Asset?search=${encodeURIComponent(searchText)}`;
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

  updateAssetWithGallery(formData: FormData): Observable<any> {
    return this.http.put(`${ApiEndpoints.ASSETS}/update-asset-all`, formData);
  }
 
}