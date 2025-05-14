import { Component, OnInit } from '@angular/core';
import { SignalRService } from '../../services/signal-r.service';
import { BidService } from '../../services/bid.service';
import { BidDto, bidStats } from '../../modals/bid-stats';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signalr-test',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './signalr-test.component.html',
  styleUrl: './signalr-test.component.css'
})
export class SignalrTestComponent implements OnInit {
assetId: number = 96;
auctionId: number =99;
userId: number = 1;
placeBid: BidDto = {
  auctionId: this.auctionId,
  assetId: this.assetId,
  userId: this.userId,
  bidAmount: 0,
}
bidData: bidStats = {
  highestBid : 0,
  bidCount : 0
}

constructor (private signalR : SignalRService, private bidService : BidService) {}
  ngOnInit(): void {
    this.signalR.startConnection();
    this.signalR.bidUpdates$.subscribe(data => {
      console.log(data);
      if (data.assetId === this.assetId) {
        this.loadBid();
      }
    })
    this.loadBid();
  }
  loadBid() {
    this.bidService.getBidStatsById(this.assetId).subscribe({
      next:(data) => {
        this.bidData = data;
        console.log(this.bidData);
      },
      error:(err) => {
        console.log("error loading Data", err)
      }
    })
  }
  onPlaceBid() {
    this.bidService.placeBid(this.placeBid).subscribe({
      next: (response) => {
        console.log('Bid placed with ID:', response.bidId);
        alert(`Your bid was placed successfully! Bid ID: ${response.bidId}`);
        
      },
      error: (error) => {
        // Handle errors (e.g., validation, network issues)
        console.error('Failed to place bid:', error);
        alert('Failed to place bid. Please try again or check your input.');
      }
    })
  }
}
