import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiEndpoints } from '../constants/api-endpoints';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private router: Router,private http:HttpClient) {
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
  
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
  getRoleJwt(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
  
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
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
  // login(email: string, password: string): boolean {
  //   if (email === 'admin@gmail.com' && password === 'admin123') {
  //     this.setRole('admin');
  //     return true;
  //   }
  //   if (email === 'pratik@gmail.com' && password === 'user123') {
  //     this.setRole('user');
  //     return true;
  //   }
  //   return false;
  // }

  // private setRole(role: 'admin' | 'user') {
  //   localStorage.setItem('role', role);
  //   this.roleSubject.next(role);
  // }

  // getRole(): 'admin' | 'user' | null {
  //   return this.roleSubject.value;
  // }

  // isLoggedIn(): boolean {
  //   return this.getRole() !== null;
  // }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }
}
