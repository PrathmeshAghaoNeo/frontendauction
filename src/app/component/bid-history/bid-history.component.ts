import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { environment } from '../../constants/enviroments';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageAssetService } from '../../services/asset.service';
import { ListService } from '../../services/list.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule, ViewportScroller } from '@angular/common';
import { DirectSaleAssetDto } from '../../modals/add-asset';
import Swal from 'sweetalert2';
import { BidService } from '../../services/bid.service';
import { Observable, of } from 'rxjs';
import { Asset } from '../../modals/manage-asset';

// declare var bootstrap: any;
@Component({
  selector: 'app-bid-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bid-history.component.html',
  styleUrl: './bid-history.component.css',
})
export class BidHistoryComponent implements OnInit {
  toOrders() {
    this.router.navigate(['/orders']);
  }

  isGridView = true;

  bidHistory: any[] = []; // Or use a proper type if you have one
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
            // Create a lookup for assets
            const assetMap = new Map(
              this.assets_new.map((a) => [a.assetId, a])
            );

            // Map to track the highest bid per asset
            const maxBidMap = new Map<number, any>();

            for (const bid of bids) {
              if (bid.assetId == null) continue;

              const currentMax = maxBidMap.get(bid.assetId);
              // Compare bidAmount against bidAmount, not amount
              if (!currentMax || bid.bidAmount > currentMax.bidAmount) {
                maxBidMap.set(bid.assetId, bid);
              }
            }

            // Build your bidHistory with the winning bid and its asset
            this.bidHistory = Array.from(maxBidMap.values()).map((bid) => ({
              ...bid,
              asset: assetMap.get(bid.assetId) || null,
            }));

            console.log('Max bids per asset:', this.bidHistory);
          },
          error: (err) => console.error('Error fetching bid history:', err),
        });
      },
      error: (err) => console.error('Error loading assets:', err),
    });
  }

  goBack() {
    window.history.back();
  }
}
