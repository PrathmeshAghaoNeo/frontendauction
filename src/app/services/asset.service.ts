import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Asset } from '../modals/manage-asset';
import { ApiEndpoints } from '../constants/api-endpoints';
 
@Injectable({
  providedIn: 'root'
})
export class ManageAssetService {


  private baseUrl = 'https://localhost:7159/api/Assets';
 

  constructor(private http: HttpClient) { }
  

  addAssetWithGallery(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/CreateWithGallery`, formData);
  }

  // Fetch all assets
  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.baseUrl}/GetAll`); 
  }
 
  // Search assets based on search text
  searchAssets(searchText: string): Observable<Asset[]> {
    const searchUrl = `${ApiEndpoints.ASSETS}/Search%20Asset?search=${encodeURIComponent(searchText)}`;
    return this.http.get<Asset[]>(searchUrl);
  }
 
   // Delete asset by ID
   deleteAsset(assetId: number): Observable<void> {
    const deleteUrl = `${this.baseUrl}/${assetId}`;  
    return this.http.delete<void>(deleteUrl);
  }
 
  getAssetById(assetId: number): Observable<Asset> {
    const url = `${this.baseUrl}/${assetId}`;
    return this.http.get<Asset>(url);
  }
 
  updateAssetWithGallery(formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-asset-all`, formData);
  }
}