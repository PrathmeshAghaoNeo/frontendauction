import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Asset } from '../../modals/manage-asset';
import { ManageAssetService } from '../../services/asset.service';
import { SignalRService } from '../../services/signal-r.service';
import { BidService } from '../../services/bid.service';
import { AuctionService } from '../../services/auction.service';
import { BidDto, bidStats } from '../../modals/bid-stats';
import { Auction } from '../../modals/auctions';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-asset-details',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss']
})
export class AssetDetailComponent implements OnInit, OnDestroy {
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
  // assetId: number = 0;
   asset: Asset | null = null;
  // isLoading: boolean = true;
  timeLeft = {
    total: 0,
    days: 0,
    hours: 0,
    minutes: 0  
  };
  // countdownInterval: any;
  // highestBid: number = 5000;
  // totalBids: number = 9;
  // viewCount: number = 5044;

  constructor(private signalR: SignalRService, private bidService: BidService, private auctionService: AuctionService,
    private route: ActivatedRoute,
    private assetService: ManageAssetService
  ) { }

  ngOnInit(): void {
    // Get asset ID from route parameters
    // this.route.params.subscribe(params => {
    //   this.assetId = +params['id']; // Convert to number
    //   this.loadAssetDetails();
    // });

    //Added Logic
    this.loadAuctionDetails();
    this.signalR.startConnection();
    this.signalR.bidUpdates$.subscribe(data => {
      console.log(data);
      if (data.assetId === this.assetId) {
        this.loadBid();
      }
    })
    this.loadBid();
    this.loadAssetDetails();
   
  }


  loadAssetDetails(): void {
    this.assetService.getAssetById(this.assetId).subscribe({
      next: (asset) => {
        this.asset = asset;
        console.log(asset);
        
        if (!this.asset.assetNumber) {
          this.asset.assetNumber = '676776'; 
        }
        
        
      
      },
      error: (error) => {
        console.error('Error loading asset details:', error);
        
        this.asset = new Object() as Asset;
        this.asset.assetId = this.assetId;
        this.asset.assetNumber = '676776'; 
        this.asset.startingPrice = 5000;
        
        
      }
    });
  }

  
  //Added Logic (affan)
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
  loadBid() {
    this.bidService.getBidStatsById(this.assetId).subscribe({
      next: (data) => {
        this.bidData = data;
        this.placeBid.bidAmount = this.bidData.highestBid  + (this.asset?.minIncrement ?? 100);
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

  // timer Logic
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
      const totalTimeRemains = endTime - now;

      if (totalTimeRemains <= 0) {
        this.countdown = 'Auction ended';
        this.timeLeft = {total:0, days: 0, hours: 0, minutes: 0 };
        clearInterval(this.countdownInterval);
        return;
      }

      const auctionDays = Math.floor(totalTimeRemains / (1000 * 60 * 60 * 24));
      const auctionHours = Math.floor((totalTimeRemains / (1000 * 60 * 60)) % 24);
      const auctionMinutes = Math.floor((totalTimeRemains / (1000 * 60)) % 60);

      this.timeLeft = {
        total: totalTimeRemains,
        days: auctionDays,
        hours: auctionHours,
        minutes: auctionMinutes
      };

      this.countdown = `${auctionDays}d ${this.pad(auctionHours)}h ${this.pad(auctionMinutes)}m`;
    }, 1000);
  }
  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  //bid filed data logic 
  incrementBid() {
    if (this.asset?.minIncrement) {
      this.placeBid.bidAmount += this.asset.minIncrement;
    }
  }
  decrementBid() {
    if (this.asset?.minIncrement) {
      const nextValue = this.placeBid.bidAmount - this.asset.minIncrement;
      if (nextValue >= this.bidData?.highestBid) {
        this.placeBid.bidAmount = nextValue;
      }
    }
  }
}