import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { SignalRService } from '../../services/signal-r.service';
import { ManageAssetService } from '../../services/asset.service';
import { Asset } from '../../modals/manage-asset';

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
  userId: number = 0;
  showNotifications = false;
  unseenWinDetails: WinWithAsset[] = [];
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
  constructor(public authService: AuthService, private router: Router, private winService: UserService,private signalR: SignalRService,private assetService: ManageAssetService) {
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
      next: (wins) => {
        this.unseenWinDetails = [];
  
        wins.forEach((win: any) => {
          this.assetService.getAssetById(win.assetId).subscribe({
            next: (asset) => {
              this.unseenWinDetails.push({
                win: win,
                assetName: asset.title
              });
              console.log(this.unseenWinDetails)
            },
            error: (err) => console.error('Error loading asset:', err)
          });
        });
      },
      error: (err) => console.error('Error loading notifications:', err)
    });
  }
  
  
  loadNotifications() {
    const wasOpen = this.showNotifications;
    this.showNotifications = !this.showNotifications;
  
    const userId = this.authService.getUserIdJwt();
    if (!userId) return;
  
    if (this.showNotifications) {
      if (this.unseenWinDetails.length > 0) {
        this.winService.MarkAsSeen(userId).subscribe({
          next: () => {},
          error: (err) => console.error('Mark as seen failed', err)
        });
      }
    } else if (wasOpen) {
      this.getUnseenUserWins(userId);
    }
  }
  
 


  logout() {
    this.authService.logout();
  }

  onLoginPage(): boolean {
    return this.currentRoute === '/login';
  }
}
