import { Component } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, NgbDropdownModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isLoggedIn = false;
  currentRoute = '';

  // constructor(public authService: AuthService, private router: Router) {
  //   this.authService.role$.subscribe(role => {
  //     this.isLoggedIn = !!role;
  //   });
  //   this.currentRoute = this.router.url;
  //   this.router.events.pipe(
  //     filter(event => event instanceof NavigationEnd)
  //   ).subscribe((event: NavigationEnd) => {
  //     this.currentRoute = event.urlAfterRedirects
  //   });
  // }
  constructor(public authService: AuthService, private router: Router) {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = !!isLoggedIn;
    });
  
    this.currentRoute = this.router.url;
  
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = (event as NavigationEnd).urlAfterRedirects;
    });
  }

  logout() {
    this.authService.logout();
  }

  onLoginPage(): boolean {
    return this.currentRoute === '/login';
  }
}
