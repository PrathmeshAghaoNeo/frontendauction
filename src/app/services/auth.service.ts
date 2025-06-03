import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiEndpoints } from '../constants/api-endpoints';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleWithPermissions } from '../modals/roles';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: any = null;
  private currentRole: RoleWithPermissions | null = null;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    this.monitorTokenChange(); 
  }
  
  sendOtp(email: string): Observable<any> {
    return this.http.post(`${ApiEndpoints.Auth}/generate-otp`, { email });
  }

  verifyOtp(email: string, code: string): Observable<any> {
    return this.http.post(`${ApiEndpoints.Auth}/verify-otp`, { email, code }).pipe(
      tap((res: any) => {
        if (res?.token) {
          localStorage.setItem('token', res.token);
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }
  
  hasToken(): boolean { 
    return !!localStorage.getItem('token');
  }
  setUser(user: any, role: RoleWithPermissions) {
    this.currentUser = user;
    this.currentRole = role;
  }

  getRoleJwt(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
  
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
  }
  
  getUserIdJwt(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check multiple possible claim names for user ID
      const userId = payload["userId"] || 
                    payload["sub"] || 
                    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      
      return userId ? Number(userId) : null;
    } catch (error) {
      console.error("Error parsing JWT token:", error);
      return null;
    }
  }
  
  private monitorTokenChange() {
    window.addEventListener('storage', () => {
      const token = this.hasToken();
      this.isLoggedInSubject.next(token);
      if (!token) {
        this.router.navigate(['/login']);
      }
    });
  }
  getRole(): RoleWithPermissions | null {
    return this.currentRole;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }
  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
    this.currentUser = null;
    this.currentRole = null;
  }
}