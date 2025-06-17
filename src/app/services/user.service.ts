import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Country, Role, Status, User, UserView,Notification, DepositLimits} from '../modals/user';
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


  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notification$ = this.notificationsSubject.asObservable();
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
    return this.http.post(`${ApiEndpoints.USER}/Add`, formData);
  }

  getUserById(id: number): Observable<UserView> {
    return this.http.get<UserView>(`${ApiEndpoints.USER}/${id}`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${ApiEndpoints.USER}/roles`);
  }
 
  getStatuses(): Observable<Status[]> {
    return this.http.get<Status[]>(`${ApiEndpoints.USER}/statuses`);
  }

  getAllUser(): Observable<UserView[]> {
    return this.http.get<UserView[]>(ApiEndpoints.USER);
  }

  updateUser(userId: number, formData: FormData): Observable<any> {
    return this.http
      .put<any>(`${ApiEndpoints.USER}/update/${userId}`, formData)
      .pipe(
        catchError(error => {
          console.error('API Error in updateUser:', error);
          return throwError(error);
        })
      );
  }

  getCountry(): Observable<Country[]> {
    return this.http.get<Country[]>(ApiEndpoints.COUNTRY);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${ApiEndpoints.USER}/delete/${userId}`);
  }
  getAllUserWins(userId:number): Observable<any> {
    return this.http.get<any>(`${ApiEndpoints.Win}/WinsLIst/${userId}`);
  }
  getUnseenUserWins(userId:number): Observable<any> {
    return this.http.get<any>(`${ApiEndpoints.Win}/NotifiationList/${userId}`);
  }
  MarkAsSeen(userId: number): Observable<{ message: string; affectedRows: number }> {
    return this.http.put<{ message: string; affectedRows: number }>(
      `${ApiEndpoints.Win}/mark-as-seen/${userId}`, 
      null
    );
  }
  getNotificationByUserId(userId:number): Observable<Notification[]>{
    return this.http.get<Notification[]>(`${ApiEndpoints.USER}/Notification/${userId}`);
  }
   getNotificationCount(): number {
    return this.notificationsSubject.getValue().filter(n => !n.isRead).length;
  }
  loadNotificationsForUser(userId: number): void {
  this.getNotificationByUserId(userId).subscribe({
    next: (notifications) => {
      this.notificationsSubject.next(notifications);
    },
    error: (err) => {
      console.error("Failed to fetch notifications:", err);
    }
  });
}
  clearNotificationByUserId(userId:number): Observable<any> {
    return this.http.delete<any>(`${ApiEndpoints.USER}/delete-all-notification/${userId}`);
  }
  markNottificationAsSeen(notificationId:string):Observable<any>{
    return this.http.put<any>(`${ApiEndpoints.USER}/mark-as-read/${notificationId}`, notificationId);
  }

  getUserDepositLimits(userId: number): Observable<DepositLimits> {
    return this.http.get<DepositLimits>(`${ApiEndpoints.USER}/deposit-limits?userId=${userId}`);
  }
}
