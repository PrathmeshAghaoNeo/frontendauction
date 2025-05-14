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
      this.currentRoute = event.urlAfterRedirects;
    });
  }
  
  ngOnInit(): void {
    this.signalRService.startConnection();
    this.signalRService.bidUpdates$.subscribe(data => {
      console.log('Bid Update Received:', data);
    });
  }

 
  get isStartPage(): boolean {
    return this.currentRoute === '/';
  }

  isCurrentRoute(routes: string[]): boolean {
    return routes.includes(this.currentRoute);
  }

  get needSideBar(): boolean {
    return this.isCurrentRoute(['/landing-page', '/reguserlandingpage', '/login', '/user-signup', '/user-profile']);
  }

  get showSidebar(): boolean {
    return !this.isStartPage && !this.needSideBar;
  }

  get showHeaderAndFooter(): boolean {
    return !this.isStartPage;
  }
  get showBackButton(): boolean {
    return !this.isCurrentRoute(['/login', '/start-page','/landing-page', '/reguserlandingpage','/']);
  }
}
