import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate = async (route: ActivatedRouteSnapshot): Promise<boolean> => {
  console.log('RoleGuard Triggered');
  const expectedRoles = route.data['role'];

  const isValid = await this.auth.validateTokenWithBackend();
  if (!isValid) {
    this.router.navigate(['/login']);
    return false;
  }

  const userRole = this.auth.getRoleJwt(); // Decode from token (now that it's validated)
  // if (expectedRole && role !== expectedRole) {
  //   this.router.navigate(['/landing-page']);
  //   return false;
  // }
  if (expectedRoles) {
    if (Array.isArray(expectedRoles)) {
      if (!expectedRoles.includes(userRole)) {
        this.router.navigate(['/landing-page']);
        return false;
      }
    } else {
      if (userRole !== expectedRoles) {
        this.router.navigate(['/landing-page']);
        return false;
      }
    }
  }

  return true;
};

    
    // if (!expectedRole) {
      
    //   if (!userRole) {
    //     return true;
    //   } else {
      
    //     if (userRole === 'admin') {
    //       this.router.navigate(['/dashboard']);
    //     } else if (userRole === 'user') {
    //       this.router.navigate(['/reguserlandingpage']);
    //     }
    //     return false;
    //   }
    // }

  
    // if (userRole === expectedRole) {
    //   return true;
    // }

    // Unauthorized access
    // console.log('Redirecting to login');
    // this.router.navigate(['/login']);
}
