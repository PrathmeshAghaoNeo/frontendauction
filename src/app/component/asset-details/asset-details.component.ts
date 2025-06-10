import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Asset } from '../../modals/manage-asset';
import { ManageAssetService } from '../../services/asset.service';
import { CommonModule } from '@angular/common';
import { Auction } from '../../modals/auctions';
import { AutoBidDto, BidDto, bidStats } from '../../modals/bid-stats';
import { SignalRService } from '../../services/signal-r.service';
import { BidService } from '../../services/bid.service';
import { AuctionService } from '../../services/auction.service';
import { FormsModule, NgModel } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { ApiEndpoints } from '../../constants/api-endpoints';


declare var bootstrap: any;
@Component({
  selector: 'app-asset-details',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss']
})
export class AssetDetailComponent implements OnInit, OnDestroy {
  // assetId: number = 0;
  showRightPanel: boolean = false;
  TrailshowRightPanel: boolean = false;

   pendingAutoBidState: boolean = false;

pendingValue: boolean = false;
  modalMessage: string = '';
  
   autoBidToggle: boolean = false;
  setLimitAmount: number = 0;
  

    assetId: number = 110;
    auctionId: number = 99;
 
  User: number |null = null;
  asset: Asset | null = null;
  auction!: Auction;
  langCode: string |null = "en";

  countdown: string = '';
  private countdownInterval: any;
  isLoading: boolean = true;

  placeBid: BidDto = {
      auctionId: 0,
      assetId: this.assetId,
      userId: this.User,
      bidAmount: 0,
    }

    bidData: bidStats = {
      highestBid: 0,
      bidCount: 0
    }

 AutoBid: AutoBidDto = {
    assetId: this.assetId,
    userId: this.User,
    auctionId: this.auctionId,
    maxBidAmount: 0,
    isActive: false
}

  timeLeft = {
    total: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    sec:0
  };


  currentSlideIndex: number = 0;
  activeTab: string = 'details';
  auctionEnded = false;

  constructor(
    private signalR: SignalRService,private languageService:LanguageService, private bidService: BidService, private auctionService: AuctionService,private router: Router,
    private assetService: ManageAssetService,private route: ActivatedRoute,private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.User = this.authService.getUserIdJwt();
    console.log("UserId is ::",this.User)
    this.placeBid.userId = this.User;
    const paramsId = this.route.snapshot.queryParams['id'] ? +atob(this.route.snapshot.queryParams['id']) : null;
    console.log(paramsId)
    if(paramsId != null) {
      this.assetId = paramsId
    }
    console.log("xyz")
    this.signalR.bidUpdates$.subscribe(data => {
      console.log(data);
      if (data.assetId === this.assetId) {
        this.loadBid();
      }
    })
    this.signalR.winnerUpdates$.subscribe(data => {
      console.log(data);
    })
    this.languageService.lang$.subscribe(lang => {
    this.langCode = lang;
    // this.fetchCategories();
    console.log('Asset API URL:', `${ApiEndpoints.ASSETS}/${this.assetId}?Lang=${this.langCode}`);

    this.loadAssetDetails();
   });
    this.loadAutoBid();
    console.log("loadautobidData");
    
    console.log('showRightPanel on reload:', this.showRightPanel); 
  }


loadAutoBid() {
  this.bidService.getAutoBid(this.User, this.auctionId, this.assetId).subscribe({
    next: (data) => {
      // this.AutoBid = data;
      this.AutoBid = data;
      console.log("autodata", data.isActive);
      console.log('AutoBid data:', this.AutoBid.isActive);
      this.setLimitAmount = this.AutoBid.maxBidAmount;

      this.showRightPanel = data.isActive;
      
      console.log('AutoBid data:', this.AutoBid);

      console.log('data:', data); 
      console.log('TrailshowRightPanel on load:', this.showRightPanel); 
    },
    error: (error) => {
      console.error('Failed to load AutoBid data', error);
    }
  });
}



  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  loadAssetDetails(): void {
    this.isLoading = true;
    this.assetService.getAssetById(this.assetId,this.langCode).subscribe({
      next: (asset) => {
        this.asset = asset;
        this.auctionId = this.asset?.auctionIds[0];
        this.placeBid.auctionId = this.asset.auctionIds[0];
        console.log(this.asset);
        this.placeBid.assetId = this.asset.assetId
        this.loadAuctionDetails();
    this.loadBid();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading asset details:', error);
        this.isLoading = false;
      }
    });
  }

  
 

  // Tab functionality shown in the HTML
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

 
  // Methods for gallery slider
  nextSlide(): void {
    if (this.asset && this.asset.galleries && this.asset.galleries.length > 0) {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.asset.galleries.length;
    }
  }

  prevSlide(): void {
    if (this.asset && this.asset.galleries && this.asset.galleries.length > 0) {
      this.currentSlideIndex = (this.currentSlideIndex - 1 + this.asset.galleries.length) % this.asset.galleries.length;
    }
  }

  setCurrentSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  hasMultipleImages(): boolean {
    return !!this.asset && !!this.asset.galleries && this.asset.galleries.length > 1;
  }

  hasImages(): boolean {
    return !!this.asset && !!this.asset.galleries && this.asset.galleries.length > 0;
  }


  //affan logic here 
  incrementBid() {
    if (this.asset?.minIncrement) {
      this.placeBid.bidAmount += this.asset.minIncrement;
    }
  }
  decrementBid() {
    if (this.asset?.minIncrement) {
      const minAllowedBid =  this.bidData?.highestBid > 0 ? this.bidData.highestBid + + (this.asset.minIncrement ?? 0)  : (this.asset.startingPrice ?? 0) + (this.asset.minIncrement ?? 0);
      const nextValue = this.placeBid.bidAmount - this.asset.minIncrement;
      if (nextValue >= minAllowedBid) {
        this.placeBid.bidAmount = nextValue;
      } else {
        this.placeBid.bidAmount = minAllowedBid;
      }
    }
  }


  //counter logic here (Bidding)

  pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
  startCountdownTimer() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    console.log('Now      :', new Date().toString());
    console.log('End Time :', new Date(this.auction.endDateTime + 'z').toString());
    console.log('Now (ms) :', new Date().getTime());
    console.log('End (ms) :', new Date(this.auction.endDateTime + 'Z').getTime());
 
    const endTime = new Date(this.auction.endDateTime + 'Z').getTime();
    console.log("endtime", endTime);
    this.countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const totalTimeRemains = endTime - now;
 
      if (totalTimeRemains <= 0) {
        this.countdown = 'Auction ended';
        this.timeLeft = {total:0, days: 0, hours: 0, minutes: 0, sec:0};
        clearInterval(this.countdownInterval);
        return;
      }
 
      const auctionDays = Math.floor(totalTimeRemains / (1000 * 60 * 60 * 24));
      const auctionHours = Math.floor((totalTimeRemains / (1000 * 60 * 60)) % 24);
      const auctionMinutes = Math.floor((totalTimeRemains / (1000 * 60)) % 60);
      const auctionSeconds = Math.floor((totalTimeRemains/(1000)) % 60);
      this.timeLeft = {
        total: totalTimeRemains,
        days: auctionDays,
        hours: auctionHours,
        minutes: auctionMinutes,
        sec: auctionSeconds
      };
      if (this.timeLeft.total <= 0 && !this.auctionEnded) {
        this.auctionEnded = true;
        this.showAuctionEndedPopup();
      }
      this.countdown = `${auctionDays}d ${this.pad(auctionHours)}h ${this.pad(auctionMinutes)}m ${this.pad(auctionSeconds)}`;
    }, 1000);
  }
  onPlaceBid() {
    console.log(this.placeBid)
    this.bidService.placeBid(this.placeBid).subscribe({
      next: (response) => {
        console.log('Bid placed with ID:', response.bidId);
  
        Swal.fire({
          icon: 'success',
          title: 'Bid Placed!',
          text: `Your bid was placed successfully!`,
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Failed to place bid:', error);
  
        Swal.fire({
          icon: 'error',
          title: 'Bid Failed',
          text: error?.error?.message ||'Failed to place bid. Please try again or check your input.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }


    loadBid() {
    this.bidService.getBidStatsById(this.assetId).subscribe({
      next: (data) => {
        this.bidData = data;
       this.placeBid.bidAmount = (this.bidData.highestBid > 0 ? this.bidData.highestBid : this.asset?.startingPrice || 0) + (this.asset?.minIncrement ?? 100);
        console.log(this.bidData);
      },
      error: (err) => {
        console.log("error loading Data", err)
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

  showAuctionEndedPopup() {
    Swal.fire({
      icon: 'info',
      title: 'Auction Ended',
      text: 'This auction has ended. You can no longer place bids.',
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/landing-page']);
      }
    });
  }


    goBack(): void {
    window.history.back();
  }



  //for setting limit to max limit part 
   decrementLimit() {
    if (this.asset?.minIncrement) {
      const minAllowedBid =  this.AutoBid?.maxBidAmount > 0 ? this.AutoBid.maxBidAmount + + (this.asset.minIncrement ?? 0)  : (this.asset.startingPrice ?? 0) + (this.asset.minIncrement ?? 0);
      const nextValue = this.AutoBid.maxBidAmount - this.asset.minIncrement;
      if (nextValue >= minAllowedBid) {
        this.AutoBid.maxBidAmount = nextValue;
      } else {
        this.AutoBid.maxBidAmount = minAllowedBid;
      }
    }
  }

  incrementLimit() {
    if (this.asset?.minIncrement) {
      this.AutoBid.maxBidAmount += this.asset.minIncrement;
    }
  }

  get minValidLimit(): number {
  if (this.bidData.highestBid > 0) {
    return this.bidData.highestBid + (this.asset?.minIncrement ?? 0);
  } else {
    return (this.asset?.startingPrice ?? 0) + (this.asset?.minIncrement ?? 0);
  }
}

onSetLimit(): void {
  if (this.setLimitAmount >= this.minValidLimit) {
    const payload = {
      userId: this.User,
      auctionId: this.auctionId,
      assetId: this.assetId,
      maxBidAmount: this.setLimitAmount
    };

    this.bidService.placeAutoBid(payload).subscribe({
      next: (res) => {
        console.log(res);
        alert('Auto-bid placed successfully!');
      },
      error: (err) => {
        console.error(err);
        alert('Error placing auto-bid.');
      }
    });
  }
}


// toggleAutoBid(value: boolean) {
//   if (value) {
//     const confirmed = window.confirm('Are you sure you want to enable auto-bid?');
//     if (!confirmed) {
//       // User cancelled, so don't enable auto-bid
//       return;
//     }
//   }

//   this.AutoBid.isActive = value;
//   this.showRightPanel = value;

//   if (value === true) {
//     this.AutoBid.maxBidAmount = this.setLimitAmount;
//     const payload = {
//       userId: this.userId,
//       auctionId: this.auctionId,
//       assetId: this.assetId,
//       maxBidAmount: this.setLimitAmount,
//     };
//     console.log("payload", payload);
//     this.bidService.placeAutoBid(payload).subscribe({
//       next: (response) => {
//         console.log('AutoBid placed:', response);
//         Swal.fire({
//           icon: 'success',
//           title: 'Auto-Bid Set',
//           text: `Your auto-bid has been set successfully!`,
//           timer: 2000,
//           showConfirmButton: false
//         });
//       },
//       error: (err) => {
//         console.error('Failed to place AutoBid:', err);
//         Swal.fire({
//           icon: 'error',
//           title: 'Auto-Bid Failed',
//           text: 'Failed to set auto-bid. Please try again.',
//           timer: 2000,
//           showConfirmButton: false
//         });
//       }
//     });
//   } else {
//     const payload = {
//       userId: this.userId,
//       auctionId: this.auctionId,
//       assetId: this.assetId
//     };
//     this.bidService.removeAutoBid(payload).subscribe({
//       next: (response) => {
//         console.log('AutoBid removed:', response);
//       },
//       error: (err) => {
//         console.error('Failed to remove AutoBid:', err);
//       }
//     });
//   }
// }

openConfirmationModal(value: boolean) {
    this.pendingValue = value;
    this.modalMessage = value
      ? 'Are you sure you want to enable auto-bid?'
      : 'Are you sure you want to disable auto-bid?';

    const modalElement = document.getElementById('autoBidConfirmModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement,{backdrop:false});
      modal.show();
    }
  }

  confirmAutoBid() {
    const value = this.pendingValue;
    this.AutoBid.isActive = value;
    this.showRightPanel = value;

    const modal = bootstrap.Modal.getInstance(document.getElementById('autoBidConfirmModal'));
    modal?.hide();

    if (value) {
      this.AutoBid.maxBidAmount = this.setLimitAmount;
      const payload = {
        userId: this.User,
        auctionId: this.auctionId,
        assetId: this.assetId,
        maxBidAmount: this.setLimitAmount,
      };
      this.bidService.placeAutoBid(payload).subscribe({
        next: (res) => {
          console.log('AutoBid placed:', res);
        },
        error: (err) => {
          console.error('Failed to place AutoBid:', err);
        }
      });
    } else {
      const payload = {
        userId: this.User,
        auctionId: this.auctionId,
        assetId: this.assetId,
      };
      this.bidService.removeAutoBid(payload).subscribe({
        next: (res) => {
          console.log('AutoBid removed:', res);
        },
        error: (err) => {
          console.error('Failed to remove AutoBid:', err);
        }
      });
    }
  }

}