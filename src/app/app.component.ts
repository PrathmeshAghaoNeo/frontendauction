import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import {
  Router,
  NavigationEnd,
  RouterOutlet,
  RouterModule,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgIf } from '@angular/common';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { SidebarComponent } from './component/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { BackButtonComponent } from './component/back-button/back-button.component';
import { SignalRService } from './services/signal-r.service';
import { ChatBotComponent } from './component/chat-bot/chat-bot.component';
import { ElementRef, ViewChild } from '@angular/core';

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
  currentRoute: string = '';
  @ViewChild('liveToast') liveToast!: ElementRef;
  toastInstance: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private signalR: SignalRService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects.split('?')[0];
        console.log(this.currentRoute);
      });
  }

  readonly customHeaderRoutes: string[] = [
    '/reguserlandingpage',
    '/bid-watchlist',
    '/bid-add-to-cart',
    '/orders',
    '/user-profile',
    '/bid-history',
    '/direct-bid',
    '/finalCheckout',
    '/direct-sale-assets'
    // Add more routes as needed
  ];

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
  ]);

  readonly publicRoutesSet = new Set([
    '/login',
    '/',
    '/user-signup',
    '/landing-page',
    '/start-page',
  ]);

  readonly noBackButtonRoutes: Set<string> = new Set([
    '/login',
    '/start-page',
    '/landing-page',
    '/reguserlandingpage',
    '/',
  ]);

  // @Input() showCustomButtons: boolean = false;
  ngOnInit(): void {
    this.signalR.startConnection();

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

  get showSidebar(): boolean {
    return !this.isStartPage && !this.needSideBar;
  }

  get showHeaderAndFooter(): boolean {
    return (
      this.authService.hasToken() ||
      !this.publicRoutesSet.has(this.currentRoute)
    );
  }

  sCurrentRoute(routes: (string | RegExp)[]): boolean {
    return routes.some(route =>
      typeof route === 'string'
        ? this.currentRoute === route
        : route.test(this.currentRoute)
    );
  }

  get showBackButton(): boolean {
    return !this.noBackButtonRoutes.has(this.currentRoute);
  }
}
