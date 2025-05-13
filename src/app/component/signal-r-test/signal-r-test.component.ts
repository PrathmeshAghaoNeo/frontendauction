import { Component, OnInit } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-signal-r-test',
  standalone: true,
  imports: [],
  templateUrl: './signal-r-test.component.html',
  styleUrl: './signal-r-test.component.css'
})
export class SignalRTestComponent implements OnInit {
  private hubConnection!: signalR.HubConnection;

  ngOnInit(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:62627/bidhub') // your hub URL
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('Connection error: ', err));

    this.hubConnection.on('ReceiveNewBid', (data) => {
      console.log('New bid received:', data);
      // You can also bind to view here
    });
  }
}
