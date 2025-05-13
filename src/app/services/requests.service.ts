import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { EditRequests } from '../modals/edit.requests';
import { AddRequest } from '../modals/add-requests';
import { ManageRequest } from '../modals/manage-requests';
import { ApiEndpoints } from '../constants/api-endpoints';
import { UserView } from '../modals/user';
import { Asset } from '../modals/manage-asset';

@Injectable({
  providedIn: 'root'
})
export class RequestServices {
  private requestsRefreshSubject = new BehaviorSubject<boolean>(false);
  public requestsRefresh$ = this.requestsRefreshSubject.asObservable();
  
  // Track ongoing operations
  private pendingOperations = 0;
  private operationsSubject = new BehaviorSubject<boolean>(false);
  public operations$ = this.operationsSubject.asObservable();
  
  constructor(private http: HttpClient) {}


  // Get all requests - now sorted by date (newest first)
  getAllRequests(): Observable<ManageRequest[]> {
    this.incrementOperations();
    return this.http.get<ManageRequest[]>(`${ApiEndpoints.REQUEST}`)
      .pipe(
        map(requests => {
          // Sort by date descending (newest first)
          return [...requests].sort((a, b) => {
            const dateA = new Date(a.requestDateTime).getTime();
            const dateB = new Date(b.requestDateTime).getTime();
            return dateB - dateA; // Descending order
          });
        }),
        finalize(() => this.decrementOperations())
      );

  }
  
  // Get single request by ID
  getRequestById(id: number): Observable<EditRequests> {
    this.incrementOperations();
    return this.http.get<EditRequests>(`${ApiEndpoints.REQUEST}/${id}`)
      .pipe(
        finalize(() => this.decrementOperations())
      );
  }

  // Fetch a template with generated RequestNumber
  getNewTemplate(): Observable<AddRequest> {
    this.incrementOperations();
    return this.http.get<AddRequest>(`${ApiEndpoints.REQUEST}/template`)
      .pipe(
        finalize(() => this.decrementOperations())
      );
  }

  // Create a new request
  createRequest(requestData: AddRequest): Observable<any> {
    console.log('Creating request:', requestData);
    this.incrementOperations();
    
    return this.http.post(`${ApiEndpoints.REQUEST}/AddRequest`, requestData)
      .pipe(
        tap(() => {
          console.log('Request created successfully');
        }),
        catchError(error => {
          console.error('Error creating request:', error);
          return throwError(() => error);
        }),
        finalize(() => {
          this.decrementOperations();
          this.refreshRequests();
        })
      );
  }

  // Delete request
  deleteRequest(id: number): Observable<any> {
    console.log('Deleting request ID:', id);
    this.incrementOperations();
    
    // FIXED: Changed from ApiEndpoints.ASSETS to ApiEndpoints.REQUEST
    return this.http.delete(`${ApiEndpoints.REQUEST}/${id}`)
      .pipe(
        tap(response => {
          console.log('Request deleted successfully:', response);
        }),
        catchError(error => {
          console.error('Error deleting request:', error);
          
          // Check if this is actually a success response
          // Sometimes DELETE returns 204 No Content which some HTTP clients might treat as an error
          if (error.status === 200 || error.status === 204) {
            console.log('Detected successful deletion despite error wrapper');
            return of({ success: true, id });
          }
          
          return throwError(() => error);
        }),
        finalize(() => {
          this.decrementOperations();
          // We don't call refreshRequests here as the component will handle UI updates
        })
      );
  }

  // Signal components that data has changed
  refreshRequests(): void {
    this.requestsRefreshSubject.next(true);
    setTimeout(() => {
      this.requestsRefreshSubject.next(false);
    }, 300);
  }

  // Delete request by generated RequestNumber
  deleteByNumber(requestNumber: string): Observable<any> {
    console.log('Deleting request by number:', requestNumber);
    this.incrementOperations();
    
    // FIXED: Changed from ApiEndpoints.ASSETS to ApiEndpoints.REQUEST
    return this.http.delete(`${ApiEndpoints.REQUEST}/by-number/${requestNumber}`)
      .pipe(
        tap(() => {
          console.log('Request deleted by number successfully');
        }),
        catchError(error => {
          console.error('Error deleting request by number:', error);
          return throwError(() => error);
        }),
        finalize(() => {
          this.decrementOperations();
          this.refreshRequests();
        })
      );
  }

  // Update existing request
  updateRequest(id: number, request: EditRequests): Observable<any> {
    console.log('Updating request ID:', id);
    this.incrementOperations();
    
    // FIXED: Changed from ApiEndpoints.ASSETS to ApiEndpoints.REQUEST
    return this.http.put(`${ApiEndpoints.REQUEST}/${id}`, request)
      .pipe(
        tap(() => {
          console.log('Request updated successfully');
        }),
        catchError(error => {
          console.error('Error updating request:', error);
          return throwError(() => error);
        }),
        finalize(() => {
          this.decrementOperations();
          this.refreshRequests();
        })
      );
  }
  
  // Helper methods to track operations
  private incrementOperations(): void {
    this.pendingOperations++;
    this.operationsSubject.next(true);
  }
  
  private decrementOperations(): void {
    this.pendingOperations--;
    if (this.pendingOperations <= 0) {
      this.pendingOperations = 0;
      this.operationsSubject.next(false);
    }
  }
}