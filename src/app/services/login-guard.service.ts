import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

   canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      const role = this.auth.getRoleJwt();
      if (role === 'admin') {
        this.router.navigate(['/dashboard']);
      } else if (role === 'user') {
        this.router.navigate(['/reguserlandingpage']);
      } else {
        this.router.navigate(['/landing-page']);
      }
      return false;
    }
    return true;
  }
}
