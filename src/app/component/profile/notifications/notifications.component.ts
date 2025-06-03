import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Notification } from '../../../modals/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  notifications: Notification[] = [];
  loading: boolean = true;
  userId : number| null = null;


  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}
   ngOnInit(): void {
    this.loadNotifications();
    this.userId = this.authService.getUserIdJwt();
  }

   loadNotifications(): void {
    const userId = this.authService.getUserIdJwt();
    if (!userId) return;

    this.userService.getNotificationByUserId(userId).subscribe({
      next: (data) => {
        this.notifications = data;
        console.log(this.notifications)
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        this.loading = false;
      },
    });
  }

  clearNotifications(): void {
  if (!this.userId) return;

  this.userService.clearNotificationByUserId(this.userId).subscribe({
    next: () => {
      // Retain only push notifications
      this.notifications = this.notifications.filter(n => n.userId === null);
      console.log('Normal notifications cleared successfully.');
    },
    error: (err) => {
      console.error('Failed to clear notifications:', err);
    }
  });
}

  bidNow(assetId: any): void {
  const encodedUserId = btoa(assetId.toString());
    this.router.navigate(['/asset-details'], { queryParams: { id: encodedUserId } });
  }
onBidClick(event: Event, notification: Notification): void {
  event.stopPropagation(); 
  this.markAsRead(notification.id);
  this.bidNow(notification.assetId);
}
markAsRead(notificationId: string): void {
  this.userService.markNottificationAsSeen(notificationId).subscribe({
    next: () => {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
    },
    error: (err) => {
      console.error('Failed to mark notification as seen:', err);
    },
  });
}
hasPushNotifications(): boolean {
  return this.notifications.some(n => n.userId === null);
}

hasNormalNotifications(): boolean {
  return this.notifications.some(n => n.userId !== null);
}

getPushNotifications(): Notification[] {
  return this.notifications.filter(n => n.userId === null);
}

getNormalNotifications(): Notification[] {
  return this.notifications.filter(n => n.userId !== null);
}
onNotificationClick(notification: Notification): void {
  if (notification.assetId) {
    this.markAsRead(notification.id);
    this.bidNow(notification.assetId);
  }
}

}
