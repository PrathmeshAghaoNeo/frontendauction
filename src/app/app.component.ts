import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgIf } from '@angular/common';
import { HeaderComponent } from "./component/header/header.component";
import { FooterComponent } from "./component/footer/footer.component";
import { SidebarComponent } from "./component/sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { BackButtonComponent } from './component/back-button/back-button.component';
import { SignalRService } from './services/signal-r.service';
import { ChatBotComponent } from './component/chat-bot/chat-bot.component';

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
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentRoute: string = '';
  
  constructor(private router: Router,private authService: AuthService, private signalRService:SignalRService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects.split('?')[0];
      console.log(this.currentRoute)
    });
  }
  
  ngOnInit(): void {
  }

 
  get isStartPage(): boolean {
    return this.currentRoute === '/';
  }

  isCurrentRoute(routes: string[]): boolean {
    return routes.includes(this.currentRoute);
  }

  get needSideBar(): boolean {
  const exactRoutes = [
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
  ];

  const dynamicPatterns = [
    '/direct-sale-assets/',
    '/auction-assets/',
    '/direct-sale-assetpage/',
    '/asset-details/'

  ];

  if (exactRoutes.includes(this.currentRoute)) {
    return true;
  }

  return dynamicPatterns.some(pattern => this.currentRoute.startsWith(pattern));
}


  get showSidebar(): boolean {
    return !this.isStartPage && !this.needSideBar;
  }

  get showHeaderAndFooter(): boolean {
    return !this.isCurrentRoute(['/login','/']);
  }
  get showBackButton(): boolean {
    return !this.isCurrentRoute(['/login', '/start-page','/landing-page', '/reguserlandingpage','/']);
  }
}
