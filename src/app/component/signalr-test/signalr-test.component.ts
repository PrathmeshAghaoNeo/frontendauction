import { Component, OnInit } from '@angular/core';
import { SignalRService } from '../../services/signal-r.service';
import { BidService } from '../../services/bid.service';
import { BidDto, bidStats } from '../../modals/bid-stats';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuctionService } from '../../services/auction.service';
import { Auction } from '../../modals/auctions';

@Component({
  selector: 'app-signalr-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signalr-test.component.html',
  styleUrl: './signalr-test.component.css'
})
export class SignalrTestComponent implements OnInit {
  assetId: number = 96;
  auctionId: number = 99;
  userId: number = 1;
  countdown: string = '';
  private countdownInterval: any;

  auction!: Auction;

  placeBid: BidDto = {
    auctionId: this.auctionId,
    assetId: this.assetId,
    userId: this.userId,
    bidAmount: 0,
  }
  bidData: bidStats = {
    highestBid: 0,
    bidCount: 0
  }

  constructor(private signalR: SignalRService, private bidService: BidService, private auctionService: AuctionService) { }
  ngOnInit(): void {

    this.loadAuctionDetails();
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
      next: (data) => {
        this.bidData = data;
        console.log(this.bidData);
      },
      error: (err) => {
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
        console.error('Failed to place bid:', error);
        alert('Failed to place bid. Please try again or check your input.');
      }
    })
  }
  loadAuctionDetails() {
    this.auctionService.getAuctionById(this.auctionId).subscribe({
      next: (response) => {
        this.auction = response;
        this.startCountdownTimer();
        console.log(response)
      },
      error: (err) => {
        console.error('Auction Details load', err);
      }
    })
  }
  pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
  startCountdownTimer() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    console.log('Now      :', new Date().toString());
    console.log('End Time :', new Date(this.auction.endDateTime).toString());
    console.log('Now (ms) :', new Date().getTime());
    console.log('End (ms) :', new Date(this.auction.endDateTime).getTime());

    const endTime = new Date(this.auction.endDateTime).getTime();
    console.log("endtime", endTime);
    this.countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        this.countdown = 'Auction ended';
        clearInterval(this.countdownInterval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);

      this.countdown = `${days}d ${this.pad(hours)}h ${this.pad(minutes)}m`;
    }, 1000);
  }
  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
