import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private roleSubject = new BehaviorSubject<'admin' | 'user' | null>(this.getRoleFromStorage());
  role$ = this.roleSubject.asObservable();

  constructor(private router: Router) {
    this.monitorRoleChange(); 
  }

  private getRoleFromStorage(): 'admin' | 'user' | null {
    return localStorage.getItem('role') as 'admin' | 'user' | null;
  }

  login(email: string, password: string): boolean {
    if (email === 'admin@gmail.com' && password === 'admin123') {
      this.setRole('admin');
      return true;
    }
    if (email === 'pratik@gmail.com' && password === 'user123') {
      this.setRole('user');
      return true;
    }
    return false;
  }

  private setRole(role: 'admin' | 'user') {
    localStorage.setItem('role', role);
    this.roleSubject.next(role);
  }

  getRole(): 'admin' | 'user' | null {
    return this.roleSubject.value;
  }

  isLoggedIn(): boolean {
    return this.getRole() !== null;
  }

  logout(): void {
    localStorage.removeItem('role');
    this.roleSubject.next(null);
    this.router.navigate(['/login']);
  }

  private monitorRoleChange() {
    window.addEventListener('storage', () => {
      const currentRole = this.getRoleFromStorage();
      this.roleSubject.next(currentRole);
      if (!currentRole) {
        this.router.navigate(['/login']);
      }
    });
  }
}
