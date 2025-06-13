import { AfterViewInit, Component, inject, Input, OnInit } from '@angular/core';
import {
  Router,
  NavigationEnd,
  RouterOutlet,
  RouterModule,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgIf } from '@angular/common';
import { Directionality } from '@angular/cdk/bidi';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { SidebarComponent } from './component/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { BackButtonComponent } from './component/back-button/back-button.component';
import { SignalRService } from './services/signal-r.service';
import { ChatBotComponent } from './component/chat-bot/chat-bot.component';
import { ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

declare var bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    NgIf,
    ChatBotComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  private translate = inject(TranslateService);
  currentRoute: string = '';
  @ViewChild('liveToast') liveToast!: ElementRef;
  toastInstance: any;
  
  // isExpanded = false;
  isRtl:boolean = false; 

  
  sidebarExpanded = false;
  

  readonly customHeaderRoutes: string[] = [
    '/reguserlandingpage',
    '/bid-watchlist',
    '/bid-add-to-cart',
    '/orders',
    '/user-profile',
    '/bid-history',
    '/direct-bid',
    '/finalCheckout',
    '/direct-sale-assets',
    '/asset-details',
    '/auction-assets',
    '/direct-sale-assetpage',

    // Add more routes as needed
  ];
  
  readonly LangRoute: string[] = [
    '/reguserlandingpage',
    '/bid-watchlist',
    '/bid-add-to-cart',
    '/orders',
    '/user-profile',
    '/bid-history',
    '/direct-bid',
    '/finalCheckout',
    '/direct-sale-assets',
    '/asset-details',
    '/landing-page',
    '/asset-details',
    '/direct-sale-assetpage',
    '/auction-assets',
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private signalR: SignalRService
  ) {

     this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      document.querySelector('.app-main')?.scrollTo(0, 0);
    }
    });


    this.authService.initializeAuth();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects.split('?')[0];
        console.log(this.currentRoute);
      });
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }
  // @Input() showCustomButtons: boolean = false;
  ngOnInit(): void {
    this.signalR.startConnection();
    this.authService.initializeAuth();
    // this.authService.initializeAuth();
    this.signalR.bidUpdates$.subscribe((data) => {
      console.log('Bid update received in AppComponent:', data);
      // Optional: use a shared event bus to broadcast
    });

    this.signalR.winnerUpdates$.subscribe((data) => {
      console.log('Winner update received:', data);
    });
    this.signalR.notificationUpdates$.subscribe((notification) => {
      console.log('Notification received:', notification);
      this.showToast(notification.message, ' New Update !!', 'info');
    });
  }

  ngAfterViewInit() {
    this.toastInstance = new bootstrap.Toast(this.liveToast.nativeElement);
  }

  //toaster message
  toggleSidebar(): void {
    this.sidebarExpanded = !this.sidebarExpanded;
  }
  showToast(
    message: string,
    header = 'Notification',
    type: 'success' | 'error' | 'info' = 'info'
  ) {
    const toastEl = this.liveToast.nativeElement;

    toastEl.querySelector('.toast-header strong').textContent = header;
    toastEl.querySelector('.toast-body').textContent = message;

    const headerEl = toastEl.querySelector('.toast-header');
    headerEl.classList.remove(
      'bg-success',
      'bg-danger',
      'bg-info',
      'text-white'
    );

    if (type === 'success') {
      headerEl.classList.add('bg-success', 'text-white');
    } else if (type === 'error') {
      headerEl.classList.add('bg-danger', 'text-white');
    } else {
      headerEl.classList.add('bg-info', 'text-white');
    }

    // Always re-instantiate the toast
    const toastInstance = new bootstrap.Toast(toastEl);
    toastInstance.show();
  }

  get isStartPage(): boolean {
    return this.currentRoute === '/';
  }

  isCurrentRoute(routes: string[]): boolean {
    return routes.includes(this.currentRoute);
  }

  readonly sideBarRoutePrefixes: string[] = [
    '/direct-sale-assets/',
    '/auction-assets/',
    '/direct-sale-assetpage/',
    '/asset-details/',
    '/order-details/',
    '/user-profile/',
    '/finalCheckout/',
  ];

  readonly sideBarExactRoutes: Set<string> = new Set([
    '/landing-page',
    '/reguserlandingpage',
    '/login',
    '/user-signup',
    '/user-profile',
    '/direct-bid',
    '/bid-watchlist',
    '/bid-add-to-cart',
    '/asset-details',
    '/orders',
    '/bid-history',
    '/payment-success',

  ]);

  get needSideBar(): boolean {
    return (
      this.sideBarExactRoutes.has(this.currentRoute) ||
      this.sideBarRoutePrefixes.some((prefix) =>
        this.currentRoute.startsWith(prefix)
      )
    );
  }
  get isLoggedIn(): boolean {
    return this.authService.hasToken(); // example check
  }
  get showCustomHeaderButtons(): boolean {
    return (
      this.isLoggedIn &&
      this.customHeaderRoutes.some((prefix) =>
        this.currentRoute.startsWith(prefix)
      )
    );
  }
  get showCustomLangButton(): boolean {
    return (
      this.LangRoute.some((prefix) =>
        this.currentRoute.startsWith(prefix)
      )
    );
  }

  get showSidebar(): boolean {
    return !this.isStartPage && !this.needSideBar;
  }

  get showHeaderAndFooter(): boolean {
    return !this.isCurrentRoute(['/login', '/']);
  }
  get showBackButton(): boolean {
    return !this.isCurrentRoute([
      '/login',
      '/start-page',
      '/landing-page',
      '/reguserlandingpage',
      '/',
    ]);
  }
}