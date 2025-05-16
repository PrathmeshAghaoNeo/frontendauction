import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../constants/enviroments';

@Injectable({
  providedIn: 'root'
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
  
  bidUpdates$ = this.bidSubject.asObservable();

  constructor() { }
  startConnection(): void {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl( `${environment.baseurl}bidhub`)
      .withAutomaticReconnect()
      .build(); 

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('SignalR error:', err));

      this.hubConnection.on('ReceiveNewBid', (bidData: any) => {
      
        this.bidSubject.next({
          bidCount: bidData.bidCount,
          auctionId: bidData.auctionId,    
          assetId: bidData.assetId,        
          userId: bidData.userId,
          bidAmount: bidData.bidAmount,
          bidTime: bidData.bidTime
        });
      });
      
      // this.hubConnection.on('ReceiveNewBid', (data) => {
      //   console.log('New bid received:', data);
      //   // You can also bind to view here
      // });
  }
}
