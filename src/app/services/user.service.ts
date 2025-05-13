import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Country, Role, Status, User, UserView } from '../modals/user';
import { ApiEndpoints } from '../constants/api-endpoints';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
    private authService: AuthService 
  ) { }

  /**
   * Get current user profile using the ID from JWT token
   */
  getCurrentUser(): Observable<UserView> {
    const userId = this.authService.getUserIdJwt();
    if (!userId) {
      throw new Error('User ID not found in token');
    }
    return this.getUserById(userId);
  }

  /**
   * Update current user profile
   */
  updateCurrentUser(formData: FormData): Observable<any> {
    const userId = this.authService.getUserIdJwt();
    if (!userId) {
      return throwError('User ID not found in token');
    }
    return this.updateUser(userId, formData);
  }

  addUser(formData: FormData): Observable<any> {
    return this.http.post(`${ApiEndpoints.USER}/Add`, formData, this.getAuthHeaders());
  }

  getUserById(id: number): Observable<UserView> {
    return this.http.get<UserView>(`${ApiEndpoints.USER}/${id}`, this.getAuthHeaders());
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${ApiEndpoints.USER}/roles`, this.getAuthHeaders());
  }
 
  getStatuses(): Observable<Status[]> {
    return this.http.get<Status[]>(`${ApiEndpoints.USER}/statuses`, this.getAuthHeaders());
  }

  getAllUser(): Observable<UserView[]> {
    return this.http.get<UserView[]>(ApiEndpoints.USER, this.getAuthHeaders());
  }

  updateUser(userId: number, formData: FormData): Observable<any> {
    return this.http
      .put<any>(`${ApiEndpoints.USER}/update/${userId}`, formData, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.error('API Error in updateUser:', error);
          return throwError(error);
        })
      );
  }

  getCountry(): Observable<Country[]> {
    return this.http.get<Country[]>(ApiEndpoints.COUNTRY, this.getAuthHeaders());
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${ApiEndpoints.USER}/delete/${userId}`, this.getAuthHeaders());
  }

  /**
   * Helper method to get authentication headers
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }
}