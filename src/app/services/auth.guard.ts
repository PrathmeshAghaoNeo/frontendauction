import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    console.log('RoleGuard Triggered');
    const expectedRole = route.data['role'];
    const userRole = this.auth.getRole();
    const path = route.routeConfig?.path;

    if (!expectedRole) {
      
      if (!userRole) {
        return true;
      } else {
      
        if (userRole === 'admin') {
          this.router.navigate(['/dashboard']);
        } else if (userRole === 'user') {
          this.router.navigate(['/reguserlandingpage']);
        }
        return false;
      }
    }

  
    if (userRole === expectedRole) {
      return true;
    }

    // Unauthorized access
    console.log('Redirecting to login');
    this.router.navigate(['/login']);
    return false;
  }
}
