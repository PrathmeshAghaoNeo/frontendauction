import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../constants/api-endpoints';
import { AssetCategory } from '../modals/assetcategories';

@Injectable({
  providedIn: 'root'
})
export class AssetCategoriesService {

  constructor(private http: HttpClient) {}

  getAll(): Observable<AssetCategory[]> {
    return this.http.get<AssetCategory[]>(`${ApiEndpoints.ASSETCATEGORIES}`);
  }

  getById(id: number): Observable<AssetCategory> {
    return this.http.get<AssetCategory>(`${ApiEndpoints.ASSETCATEGORIES}/${id}`);
  }

  create(category: AssetCategory): Observable<AssetCategory> {
    return this.http.post<AssetCategory>(`${ApiEndpoints.ASSETCATEGORIES}/create`, category);
  }

  update(id: number, category: AssetCategory): Observable<AssetCategory> {
    return this.http.put<AssetCategory>(`${ApiEndpoints.ASSETCATEGORIES}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${ApiEndpoints.ASSETCATEGORIES}/${id}`);
  }
}
