import {
  AfterViewInit,Component,ElementRef, OnInit, ViewChild,} from '@angular/core';
import { environment } from '../../constants/enviroments';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ManageAssetService } from '../../services/asset.service';
import { ListService } from '../../services/list.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule, ViewportScroller } from '@angular/common';
import { DirectSaleAssetDto } from '../../modals/add-asset';
import Swal from 'sweetalert2';
import { BidService } from '../../services/bid.service';
import { Observable, of } from 'rxjs';
import { Asset } from '../../modals/manage-asset';
import { BidDisplayModel, WonBid } from '../../modals/bid-stats';

// declare var bootstrap: any;
@Component({
  selector: 'app-bid-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bid-history.component.html',
  styleUrl: './bid-history.component.css',
})
export class BidHistoryComponent implements OnInit {
  toOrders() {
    this.router.navigate(['/orders']);
  }

  selectedTab: 'ongoing' | 'won' = 'ongoing';
  isGridView = true;

  bidHistory: BidDisplayModel[] = [];
  wonBids: BidDisplayModel[] = [];

  environment = environment;
  assets_new: Asset[] = [];
  originAssets_new: Asset[] = [];
  assets: DirectSaleAssetDto[] = [];
  originalAssets: DirectSaleAssetDto[] = [];
  layoutType: 'grid' | 'row' = 'grid';
  userId: number | null = null;
  wishlistAssetIds: number[] = [];

  cartAssetIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private listService: ListService,
    private router: Router,
    private authService: AuthService,
    private bidservice: BidService,
    private viewportScroller: ViewportScroller
  ) {}

  setView(grid: boolean) {
    this.isGridView = grid;
  }

  ngOnInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.userId = this.authService.getUserIdJwt();

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.assetService.getAssets().subscribe({
      next: (assets) => {
        this.assets_new = assets;
        this.originAssets_new = [...assets];

        this.bidservice.getUserBidsHitory(this.userId!).subscribe({
          next: (bids) => {
            const assetMap = new Map(
              this.assets_new.map((a) => [a.assetId, a])
            );
            const maxBidMap = new Map<number, any>();

            for (const bid of bids) {
              if (bid.assetId == null) continue;
              const currentMax = maxBidMap.get(bid.assetId);
              if (!currentMax || bid.bidAmount > currentMax.bidAmount) {
                maxBidMap.set(bid.assetId, bid);
              }
            }

            this.bidHistory = Array.from(maxBidMap.values()).map((bid) => ({
              assetId: bid.assetId,
              bidAmount: bid.bidAmount,
              status: bid.status || 'Pending',
              asset: assetMap.get(bid.assetId) || null,
            }));

            console.log('Max bids per asset:', this.bidHistory);
          },
          error: (err) => console.error('Error fetching bid history:', err),
        });

        this.bidservice.getWonBidsByUserId(this.userId!).subscribe({
          next: (wonBids) => {
            this.wonBids = wonBids.map((won) => ({
              assetId: won.assetId,
              awardedPrice: won.awardedPrice,
              reason: won.reason,
              note: won.note,
              approved: won.approved,
              isSeen: won.isSeen,
              createdAt: won.createdAt,
              asset:
                this.assets_new.find((a) => a.assetId === won.assetId) || null,
            }));
            console.log('Won bids with assets:', this.wonBids);
          },
          error: (err) => console.error('Error fetching won bids:', err),
        });
      },
      error: (err) => console.error('Error loading assets:', err),
    });
  }

  switchTab(tab: 'ongoing' | 'won') {
    this.selectedTab = tab;
  }

  getCurrentBids(): any[] {
    return this.selectedTab === 'ongoing' ? this.bidHistory : this.wonBids;
  }

  onBidCardClick(bid: BidDisplayModel) {
    if (this.selectedTab === 'won') {
      // Navigate to the receipt or purchase detail page
      console.log('asset ', bid);

      this.router.navigate(['/finalCheckout', bid.assetId]);
    }
  }

  goBack() {
    window.history.back();
  }
}
