import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiEndpoints } from '../constants/api-endpoints';
import { RoleWithPermissions, PermissionKey } from '../modals/roles';
import { User } from '../modals/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private currentRole: RoleWithPermissions | null = null;

  private roleSubject = new BehaviorSubject<RoleWithPermissions | null>(null);
  role$ = this.roleSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');

    if (storedUser && storedUser !== 'undefined' && storedRole && storedRole !== 'undefined') {
      try {
        this.currentUser = JSON.parse(storedUser);
        const role = JSON.parse(storedRole);
        this.currentRole = role;
        this.roleSubject.next(role);
      } catch (e) {
        console.error("Error parsing stored user/role:", e);
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      }
    }
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

  setUser(user: User, role: RoleWithPermissions): void {
    this.currentUser = user;
    this.currentRole = role;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', JSON.stringify(role));
    this.roleSubject.next(role);
  }

  hasPermission(permission: PermissionKey): boolean {
    const role = this.getRole();
    return !!(role && role[permission]);
  }

  getRole(): RoleWithPermissions | null {
    return this.roleSubject.getValue();
  }

  getRoleObservable(): Observable<RoleWithPermissions | null> {
    return this.role$;
  }

  getUserIdJwt(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload["userId"] ||
        payload["sub"] ||
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

      return userId ? Number(userId) : null;
    } catch (error) {
      console.error("Error parsing JWT token:", error);
      return null;
    }
  }

  getRoleJwt(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
  }
  getPermissions(): string[] {
  return this.currentRole
    ? Object.entries(this.currentRole)
        .filter(([key, value]) => value === true && key !== 'roleId' && key !== 'roleName')
        .map(([key]) => key)
    : [];
}


  isLoggedIn(): boolean {
    return this.hasToken();
  }

  hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    this.roleSubject.next(null);
    this.isLoggedInSubject.next(false);

    this.currentUser = null;
    this.currentRole = null;

    this.router.navigate(['/login']);
  }
}
