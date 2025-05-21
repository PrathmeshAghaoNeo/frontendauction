import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { SignalRService } from '../../services/signal-r.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, NgbDropdownModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  currentRoute = '';
  unseenWins: any[] = [];
  userId: number = 0;
  showNotifications = false;
  
  
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
  constructor(public authService: AuthService, private router: Router, private winService: UserService,private signalR: SignalRService) {
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
  ngOnInit(): void {
    const userId = this.authService.getUserIdJwt();
    if (userId) {
      this.getUnseenUserWins(userId);
    }
    this.signalR.startConnection();
    this.signalR.winnerUpdates$.subscribe(data => {
      console.log(data);
    })
  }
  getUnseenUserWins(userId: number) {
    this.winService.getUnseenUserWins(userId).subscribe({
      next: (data) => {this.unseenWins = data,console.log(data)},
      error: (err) => console.error('Error loading notifications:', err)
    });
  }
  
  loadNotifications() {
    this.showNotifications = !this.showNotifications;
  
    if (this.showNotifications && this.unseenWins.length > 0) {
      const userId = this.authService.getUserIdJwt();
      if (userId) {
        this.winService.MarkAsSeen(userId).subscribe({
          next: () => {
          },
          error: (err) => console.error('Mark as seen failed', err)
        });
      }
    }
  }
  logout() {
    this.authService.logout();
  }

  onLoginPage(): boolean {
    return this.currentRoute === '/login';
  }
}
