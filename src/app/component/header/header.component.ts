import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, NgbDropdownModule, CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Input() showLandingButtons: boolean = false;
  // @Input() showDefaultButtons: boolean = true;
  @Input() showCustomButtons = false;
  @Input() showLangButton = false;

  isLoggedIn = false;
  currentLang: string = 'en';

  previousRoute = '';
  currentRoute = '';
  userId: number = 0;
  wishlistAssetIds: number[] = [];
  userProfileImageUrl: string = '';
  cartAssetIds: number[] = [];
  notifications: Notification[] = [];
  unreadCount: number = 0;
  userRole: string | null = null;
  constructor(
    private listService: ListService,
    public authService: AuthService,
    private router: Router,
    private languageService: LanguageService,
    private winService: UserService,
    private signalR: SignalRService,
    private userService: UserService,
    private translate: TranslateService,
    private assetService: ManageAssetService) {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = !!isLoggedIn;
    });

    this.currentRoute = this.router.url;
 let initialized = false;

  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: NavigationEnd) => {
    if (initialized) {
      this.previousRoute = this.currentRoute;
    }
    this.currentRoute = (event as NavigationEnd).urlAfterRedirects;
    initialized = true;
  });

  }
  @Output() toggleSidebar = new EventEmitter<void>();
  ngOnInit(): void {
    this.startTypingEffect();
    const userId = this.authService.getUserIdJwt();
    if (userId) {
      this.loadNotifications(userId);
    }
    this.signalR.startConnection();
    this.signalR.winnerUpdates$.subscribe(data => {
      console.log(data);
    })
    const user = this.authService.getRoleJwt();
    this.userRole = user ?? null;
    console.log('User role:', this.userRole);

  }
  // userProfileImageUrl = 'assets/images/default-profile.jpg';
  get showDefaultButtons(): boolean {
    return !this.showCustomButtons;
  }
  navigatetoallthebidsbythatuser() {
    if (this.currentRoute === '/bid-history') {
      const fallback = this.homeRoute;
      const target = this.previousRoute || fallback;
      console.log('Navigating back to:', target);
      this.router.navigate([target]);
    }else{
      this.router.navigate(['/bid-history'])
    }
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
  startTypingEffect() {
  const phrases = [
    " AUCTION MANAGEMENT PLATFORM",
    " BID SMART, WIN BIG",
    " DISCOVER. BID. WIN.",
    " YOUR TRUSTED AUCTION HUB"
  ];

  let currentPhraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const element = document.querySelector('.typing-title') as HTMLElement;

  const type = () => {
    const currentPhrase = phrases[currentPhraseIndex];
    const updatedText = isDeleting
      ? currentPhrase.substring(0, charIndex--)
      : currentPhrase.substring(0, charIndex++);

    if (element) {
      element.textContent = updatedText;
    }

    let delay = 100;

    if (!isDeleting && charIndex === currentPhrase.length + 1) {
      delay = 1200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
      delay = 500;
    }

    setTimeout(type, delay);
  };

  type();
}


toCart() {

  if (this.currentRoute === '/bid-add-to-cart') {
    const fallback = this.homeRoute;
    const target = this.previousRoute || fallback;
    console.log('Navigating back to:', target);
    this.router.navigate([target]);
  } else {
    this.router.navigate(['/bid-add-to-cart']);
  }
}


navigateToUserProfile() {
  if(this.currentRoute === '/user-profile') {
    const fallback = this.homeRoute;
    const target = this.previousRoute || fallback;
    console.log('Navigating back to:', target);
    this.router.navigate([target]);
  }else{
    this.router.navigate(['/user-profile']); 
  }
}


toWatchlist() {
  if(this.currentRoute === '/bid-watchlist') {
    const fallback = this.homeRoute;
    const target = this.previousRoute || fallback;
    console.log('Navigating back to:', target);
    this.router.navigate([target]);
  }else{
    this.router.navigate(['/bid-watchlist']);
  }
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
  loadNotifications(userId: number): void {

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

  switchLang(lang: string) {
    this.translate.use(lang);
     this.languageService.setLanguage(lang);
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.currentLang = lang;
  }
  toggleLang() {
    if (this.currentLang === 'en') {
      this.switchLang('ar');
    } else {
      this.switchLang('en');
    }
  }


  get homeRoute(): string {
    if (!this.isLoggedIn) return '/landing-page';
    if (this.userRole === 'Admin') return '/dashboard';
    return '/reguserlandingpage';
  }
}
