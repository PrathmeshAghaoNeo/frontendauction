import { Component, Input, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { SignalRService } from '../../services/signal-r.service';
import { ManageAssetService } from '../../services/asset.service';
import { ListService } from '../../services/list.service';
import { Notification } from '../../modals/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, NgbDropdownModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Input() showLandingButtons: boolean = false;
  // @Input() showDefaultButtons: boolean = true;
  @Input() showCustomButtons = false;

  isLoggedIn = false;
  currentRoute = '';
  userId: number = 0;
  wishlistAssetIds: number[] = [];
userProfileImageUrl: string = '';
  cartAssetIds: number[] = [];
  notifications: Notification[] = [];
  unreadCount : number= 0;

  constructor(
      private listService: ListService,
      public authService: AuthService, 
      private router: Router, 
      private winService: UserService, 
      private signalR: SignalRService,
      private userService: UserService,
      private assetService: ManageAssetService) 
      {
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
      this.loadNotifications(userId);
    }
    this.signalR.startConnection();
    this.signalR.winnerUpdates$.subscribe(data => {
      console.log(data);
    })
  }
  // userProfileImageUrl = 'assets/images/default-profile.jpg';
  get showDefaultButtons(): boolean {
    return !this.showCustomButtons;
  }
  navigatetoallthebidsbythatuser(){
    
  }
  loadWishlist(): void {
    if (!this.userId) return;
    this.listService.getWishlist(this.userId).subscribe({
      next: (data) => {
        this.wishlistAssetIds = data.map((item: any) => item.assetId);
        console.log('Wishlist Asset IDs:', this.wishlistAssetIds);
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
      },
    });
  }
   toCart() {
    this.router.navigate(['/bid-add-to-cart']);
  }
  navigateToUserProfile() {
  this.router.navigate(['/user-profile']); // Update route as needed
}
  toWatchlist() {
    this.router.navigate(['/bid-watchlist']);
  }
  loadCartItems(): void {
    if (!this.userId) return;
    this.listService.getCart(this.userId).subscribe({
      next: (data) => {
        this.cartAssetIds = data.map((item: any) => item.assetId);
        console.log('Cart Asset IDs:', this.cartAssetIds);
      },
      error: (err) => {
        console.error('Error loading cart items:', err);
      },
    });
  }
  // getUnseenUserWins(userId: number) {
  //   this.winService.getUnseenUserWins(userId).subscribe({
  //     next: (wins) => {
  //       this.unseenWinDetails = [];

  //       wins.forEach((win: any) => {
  //         this.assetService.getAssetById(win.assetId).subscribe({
  //           next: (asset) => {
  //             this.unseenWinDetails.push({
  //               win: win,
  //               assetName: asset.title
  //             });
  //             console.log(this.unseenWinDetails)
  //           },
  //           error: (err) => console.error('Error loading asset:', err)
  //         });
  //       });
  //     },
  //     error: (err) => console.error('Error loading notifications:', err)
  //   });
  // }


  // loadNotifications() {
  //   const wasOpen = this.showNotifications;
  //   this.showNotifications = !this.showNotifications;

  //   const userId = this.authService.getUserIdJwt();
  //   if (!userId) return;

  //   if (this.showNotifications) {
  //     if (this.unseenWinDetails.length > 0) {
  //       this.winService.MarkAsSeen(userId).subscribe({
  //         next: () => { },
  //         error: (err) => console.error('Mark as seen failed', err)
  //       });
  //     }
  //   } else if (wasOpen) {
  //     this.getUnseenUserWins(userId);
  //   }
  // }




  logout() {
    this.authService.logout();
  }

  onLoginPage(): boolean {
    return this.currentRoute === '/login';
  }



  //Notfication Code 
   loadNotifications(userId:number): void {
   
    if (!userId) return;

    this.userService.getNotificationByUserId(userId).subscribe({
      next: (data) => {
        this.notifications = data;
        console.log(this.notifications)
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
      console.log('Unread Count:', this.unreadCount);
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        
      },
    });
  }
}
