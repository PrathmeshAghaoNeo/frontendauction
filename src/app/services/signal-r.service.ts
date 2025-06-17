import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../constants/enviroments';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  private bidSubject = new Subject<{
    bidCount: number;
    auctionId: number;
    assetId: number;
    userId: number;
    bidAmount: number;
    bidTime: string;
  }>();

  private winnerSubject = new Subject<any[]>();

  private notificationSubject = new Subject<{
    userId: string;
    title: string;
    message: string;
    expiresAt: string;
    assetId: string;
    auctionId: string;
  }>();

  bidUpdates$ = this.bidSubject.asObservable();
  winnerUpdates$ = this.winnerSubject.asObservable();
  notificationUpdates$ = this.notificationSubject.asObservable();

  constructor(private userService: UserService) {}

  startConnection(): void {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.baseurl}bidhub`, {
        accessTokenFactory: () => localStorage.getItem('token') || '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch((err) => console.error('SignalR error:', err));

    this.hubConnection.on('ReceiveNewBid', (bidData: any) => {
      this.bidSubject.next({
        bidCount: bidData.bidCount,
        auctionId: bidData.auctionId,
        assetId: bidData.assetId,
        userId: bidData.userId,
        bidAmount: bidData.bidAmount,
        bidTime: bidData.bidTime,
      });
    });

    this.hubConnection.on('WinnersList', (winners: any[]) => {
      console.log('Winners received:', winners);
      this.winnerSubject.next(winners);
    });

    this.hubConnection.on('ReceiveNotification', (notification: any) => {
      console.log('Notification received:', notification);

      this.notificationSubject.next({
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        expiresAt: notification.expiresAt,
        assetId: notification.assetId,
        auctionId: notification.auctionId,
      });

      const userId = localStorage.getItem('userId');
      if (userId) {
        this.userService.loadNotificationsForUser(+userId);
      }
    });
  }
}
