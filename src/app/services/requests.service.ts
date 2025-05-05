import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EditRequests } from '../modals/edit.requests';
import { AddRequest } from '../modals/add-requests';
import { ManageRequest } from '../modals/manage-requests';
import { ApiEndpoints } from '../constants/api-endpoints';


@Injectable({
  providedIn: 'root'
})
export class RequestServices {
  private apiUrl = `${ApiEndpoints.REQUEST}`; 

  constructor(private http: HttpClient) {}

  // Get all requests
  getAllRequests(): Observable<ManageRequest[]> {
    return this.http.get<ManageRequest[]>(this.apiUrl);
  }

  // Get single request by ID
  getRequestById(id: number): Observable<EditRequests> {
    return this.http.get<EditRequests>(`${this.apiUrl}/${id}`);
  }
/** Create a new request */
  createRequest(request: EditRequests): Observable<EditRequests> {
  return this.http.post<EditRequests>(this.apiUrl, request);
}
  // Update an existing request
  updateRequest(id: number, request: EditRequests): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }

  // Delete a request
  deleteRequest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}