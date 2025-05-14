import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Asset } from '../../modals/manage-asset';
import { ManageAssetService } from '../../services/asset.service';

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss']
})
export class AssetDetailComponent implements OnInit, OnDestroy {
  assetId: number = 0;
  asset: Asset | null = null;
  isLoading: boolean = true;
  timeLeft = {
    days: 1,
    hours: 2,
    minutes: 28  // Updated to match the image
  };
  countdownInterval: any;
  highestBid: number = 5000;
  totalBids: number = 9;
  viewCount: number = 5044;

  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService
  ) { }

  ngOnInit(): void {
    // Get asset ID from route parameters
    this.route.params.subscribe(params => {
      this.assetId = +params['id']; // Convert to number
      this.loadAssetDetails();
    });
  }

  ngOnDestroy(): void {
    // Clear the interval when component is destroyed
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  loadAssetDetails(): void {
    this.isLoading = true;
    this.assetService.getAssetById(this.assetId).subscribe({
      next: (asset) => {
        this.asset = asset;
        
        // Use assetNumber from the API response
        if (!this.asset.assetNumber) {
          this.asset.assetNumber = '676776'; // Set default if missing
        }
        
        this.isLoading = false;
        
        // Set actual data from the asset
        this.highestBid = asset.startingPrice || 5000;
        this.totalBids = 9; // This could potentially come from another API call
        
        // Start the countdown timer based on the asset's end time if available
        // For now, using static values to match the design
        this.startCountdown();
      },
      error: (error) => {
        console.error('Error loading asset details:', error);
        this.isLoading = false;
        
        // Create a minimal fallback asset in case of error
        this.asset = new Object() as Asset;
        this.asset.assetId = this.assetId;
        this.asset.assetNumber = '676776'; // Using assetNumber from the Asset interface
        this.asset.startingPrice = 5000;
        
        // Still start countdown even if we failed to get real data
        this.startCountdown();
      }
    });
  }

  startCountdown(): void {
    // Set end date based on the image values (1 day, 2 hours, 28 minutes)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(endDate.getHours() + 2);
    endDate.setMinutes(endDate.getMinutes() + 28);

    this.updateCountdown(endDate);
    
    this.countdownInterval = setInterval(() => {
      this.updateCountdown(endDate);
    }, 60000); // Update every minute
  }

  updateCountdown(endDate: Date): void {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      this.timeLeft = { days: 0, hours: 0, minutes: 0 };
      clearInterval(this.countdownInterval);
      return;
    }
    
    // Calculate days, hours, minutes
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    this.timeLeft = { days, hours, minutes };
  }

  placeBid(): void {
    // Implement bid placement logic here
    console.log('Placing bid...');
  }
}