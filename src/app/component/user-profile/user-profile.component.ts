import { CommonModule } from '@angular/common';
import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Notification } from '../../modals/user';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone:true,
  imports:[CommonModule,RouterOutlet,RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  showDepositMenu = false;
  notifications: Notification[] = [];
  unreadCount: number = 0;

  constructor(private router: Router,private authService: AuthService, private route: ActivatedRoute,private userService: UserService) {}
  ngOnInit(): void {
     const userId = this.authService.getUserIdJwt();
     if (userId) {
      this.loadNotifications(userId);
    }
  }

  toggleDepositMenu() {
    this.showDepositMenu = !this.showDepositMenu;
  }

  navigateTo(path: string) {
    this.router.navigate([path], { relativeTo: this.route });
  }
  loadNotifications(userId: number): void {
  if (!userId) return;

  this.userService.notification$.subscribe(notifications => {
    this.unreadCount = notifications.filter(n => !n.isRead).length;
    console.log("Unread notifications:", this.unreadCount);
  });
}


  routerToMain() {
  this.router.navigate(['/'])
  }
}
