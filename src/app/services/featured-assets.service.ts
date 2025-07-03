import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../constants/api-endpoints';    // your constant file
import { Asset } from '../modals/manage-asset';

@Injectable({
  providedIn: 'root'
})
export class FeaturedAssetsService {
  constructor(private http: HttpClient) {}

  getFeaturedAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${ApiEndpoints.FEATUREDASSETS}`);
  }
}
