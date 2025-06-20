import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Asset } from '../../modals/manage-asset';
import { HttpClient } from '@angular/common/http';
import { ManageAssetService } from '../../services/asset.service';
import { CommonModule, ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ListService } from '../../services/list.service';
import Swal from 'sweetalert2';
import { environment } from '../../constants/enviroments';
import { DirectSaleAssetDto } from '../../modals/add-asset';
import { Auction } from '../../modals/auctions';
import { AuthService } from '../../services/auth.service';
import { BidService } from '../../services/bid.service';
import { bidStatsBulk } from '../../modals/bid-stats';
import { AuctionService } from '../../services/auction.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';

declare var bootstrap: any;

@Component({
  selector: 'app-direct-bid',
  standalone: true,
  imports: [CommonModule, TranslateModule, CategorySelectorComponent],
  templateUrl: './auction-assets.component.html',
  styleUrl: './auction-assets.component.css',
})
export class AuctionAssetsComponent implements OnInit, AfterViewInit {
  @ViewChild('liveToast') liveToast!: ElementRef;
  toastInstance: any;

  assets: DirectSaleAssetDto[] = [];
  auction: Auction[] = [];
  originalAssets: DirectSaleAssetDto[] = [];
  layoutType: 'grid' | 'row' = 'grid';
  noAssetsFound: boolean = false;
  // TODO: Replace with actual user ID from auth context
  userId: number | null = null;
  environment = environment;
  wishlistAssetIds: number[] = [];
  assetIds: number[] = [];
  AuctionIds: number[] = [];
  langCode: string | null = 'en';
  isRtl: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private auctionService: AuctionService,
    private http: HttpClient,
    private listService: ListService,
    private router: Router,
    private authService: AuthService,
    private bidService: BidService,
    private languageService: LanguageService,
    private viewportScroller: ViewportScroller
  ) {}

  ngAfterViewInit() {
    this.toastInstance = new bootstrap.Toast(this.liveToast.nativeElement);
  }

  showToast(
    message: string,
    header = 'Notification',
    type: 'success' | 'error' | 'info' = 'info'
  ) {
    const toastEl = this.liveToast.nativeElement;

    toastEl.querySelector('.toast-header ').textContent = header;

    // Change toast body message
    toastEl.querySelector('.toast-body').textContent = message;

    // Change header bg color depending on type
    const headerEl = toastEl.querySelector('.toast-header');

    headerEl.classList.remove(
      'bg-success',
      'bg-danger',
      'bg-info',
      'text-white'
    );
    if (type === 'success') {
      headerEl.classList.add('bg-success', 'text-white');
    } else if (type === 'error') {
      headerEl.classList.add('bg-danger', 'text-white');
    } else {
      headerEl.classList.add('bg-danger', 'text-white');
    }

    this.toastInstance.show();
  }

  // ngOnInit(): void {
  //   this.viewportScroller.scrollToPosition([0, 0]);
  //   this.userId = this.authService.getUserIdJwt();
  //   this.languageService.lang$.subscribe(lang => {
  //       this.langCode = lang;
  //        this.isRtl = lang === 'ar';
  //       // this.fetchCategories();

  //   const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
  //   if (!isNaN(categoryId)) {
  //     this.listService.getAuctionAssetsByCategory(categoryId,this.langCode).subscribe({
  //       next: (data) => {
  //         this.assets = data;
  //         this.originalAssets = [...data];
  //         this.loadWishlist();
  //         this.noAssetsFound = this.assets.length === 0;
  //         this.assetIds = this.assets.map(a => a.assetId);
  //         this.AuctionIds = this.assets.map(a => a.auctionId);

  //         // Step 1: Get bid stats
  //         this.bidService.getBidStatsByAssetIds(this.assetIds).subscribe({
  //           next: (bidStatsList: bidStatsBulk[]) => {
  //             this.assets = this.assets.map(asset => {
  //               const stats = bidStatsList.find(b => b.assetId === asset.assetId);
  //               return {
  //                 ...asset,
  //                 bidCount: stats?.bidCount ?? 0,
  //                 highestbid: stats?.highestBid,
  //               };
  //             });

  //             // Step 2: Get auctions by IDs
  //             this.auctionService.getAuctionsByIds(this.AuctionIds).subscribe({
  //               next: (auctions: Auction[]) => {
  //                 this.assets = this.assets.map(asset => {
  //                   const auction = auctions.find(a => a.auctionId === asset.auctionId);
  //                   return {
  //                     ...asset,
  //                     auctionEndTime: auction?.endDateTime ?? null,
  //                   };
  //                 });
  //                 console.log("Final mapped assets with auction info:", this.assets);
  //               },
  //               error: err => console.error('Error fetching auctions:', err)
  //             });

  //           },
  //           error: err => console.error('Error fetching bid stats:', err)
  //         });

  //       },
  //       error: err => console.error('Error fetching assets:', err)
  //     });
  //   } else {
  //     console.error('Invalid category ID');
  //   }
  //   });
  // }
  ngOnInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.userId = this.authService.getUserIdJwt();

    this.languageService.lang$.subscribe((lang) => {
      this.langCode = lang;
      this.isRtl = lang === 'ar';

      // ✅ Subscribe to param changes so category switching works
      this.route.paramMap.subscribe((params) => {
        const categoryId = Number(params.get('categoryId'));
        if (!isNaN(categoryId)) {
          this.fetchAssetsByCategory(categoryId);
        } else {
          console.error('❌ Invalid or missing category ID');
        }
      });
    });
  }

  fetchAssetsByCategory(categoryId: number): void {
    // 🔁 Clear previous data before loading
    this.assets = [];
    this.originalAssets = [];
    this.assetIds = [];
    this.AuctionIds = [];
    this.noAssetsFound = false;

    this.listService
      .getAuctionAssetsByCategory(categoryId, this.langCode)
      .subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.noAssetsFound = true;
            console.warn('⚠️ No assets found for this category');
            return;
          }

          this.assets = data;
          this.originalAssets = [...data];
          this.assetIds = this.assets.map((a) => a.assetId);
          this.AuctionIds = this.assets.map((a) => a.auctionId);

          this.loadWishlist();

          this.bidService.getBidStatsByAssetIds(this.assetIds).subscribe({
            next: (bidStatsList: bidStatsBulk[]) => {
              this.assets = this.assets.map((asset) => {
                const stats = bidStatsList.find(
                  (b) => b.assetId === asset.assetId
                );
                return {
                  ...asset,
                  bidCount: stats?.bidCount ?? 0,
                  highestbid: stats?.highestBid,
                };
              });

              this.auctionService.getAuctionsByIds(this.AuctionIds).subscribe({
                next: (auctions: Auction[]) => {
                  this.assets = this.assets.map((asset) => {
                    const auction = auctions.find(
                      (a) => a.auctionId === asset.auctionId
                    );
                    return {
                      ...asset,
                      auctionEndTime: auction?.endDateTime ?? null,
                    };
                  });

                  console.log('✅ Final mapped assets:', this.assets);
                },
                error: (err) =>
                  console.error('❌ Error fetching auctions:', err),
              });
            },
            error: (err) => console.error('❌ Error fetching bid stats:', err),
          });
        },
        error: (err) => {
          console.error('❌ Error fetching assets:', err);
          this.noAssetsFound = true;
        },
      });
  }

  getFlagUrl(asset: Asset): string {
    return asset.galleries?.[0]?.fileUrl || 'assets/flags/bahrain.png';
  }

  toggleLayout(): void {
    this.layoutType = this.layoutType === 'grid' ? 'row' : 'grid';
  }

  addToWishlist(assetId: number): void {
    const payload = {
      userId: this.userId,
      assetId: assetId,
      quantity: 1,
    };

    console.log(assetId);

    this.listService.addToWishlist(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Added to Wishlist',
          text: 'This asset has been added to your wishlist.',
          confirmButtonText: 'OK',
        });
      },
      error: (err) => {
        console.error('Error adding asset to wishlist:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.message || 'Something went wrong while adding to wishlist.',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  loadWishlist(): void {
    this.listService.getWishlist(this.userId).subscribe({
      next: (data) => {
        this.wishlistAssetIds = data.map((item: any) => item.assetId);
        console.log('Wishlist Asset IDs:', this.wishlistAssetIds);
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
      },
    });
  }

  buyNow(assetId: number): void {
    const payload = {
      userId: this.userId,
      assetId: assetId,
      quantity: 1,
    };

    this.http.post('', payload).subscribe({
      next: () => {
        alert('Asset added to cart.');
        // Optional: redirect to checkout
        // this.router.navigate(['/checkout']);
      },
      error: (err) => alert('Error adding to cart: ' + err.message),
    });
  }

  isInWishlist(assetId: number): boolean {
    return this.wishlistAssetIds.includes(assetId);
  }

  toggleWishlist(assetId: number): void {
    if (!this.userId) return;
    if (this.isInWishlist(assetId)) {
      const payload = { userId: this.userId, assetId: assetId };
      this.listService.removeFromWishlist(payload).subscribe({
        next: () => {
          this.wishlistAssetIds = this.wishlistAssetIds.filter(
            (id) => id !== assetId
          );
          this.showToast(`Removed from wishlist.`, 'Removed!', 'info');
        },
        error: (err) => {
          this.showToast(
            err.error.message || 'Error removing from wishlist.',
            'Error!',
            'error'
          );
        },
      });
    } else {
      const payload = { userId: this.userId, assetId: assetId, quantity: 1 };
      this.listService.addToWishlist(payload).subscribe({
        next: () => {
          this.wishlistAssetIds.push(assetId);
          this.showToast('Added to wishlist.', 'Added!', 'success');
        },
        error: (err) => {
          this.showToast(
            err.error.message || 'Error adding to wishlist.',
            'Error!',
            'error'
          );
        },
      });
    }
  }

  getTimeRemaining(endTime?: string | null): string {
    if (!endTime) return '';
    const utcTime = endTime.endsWith('Z') ? endTime : endTime + 'Z';
    const end = Date.parse(utcTime);
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  }

  navigateToAsset(assetId: number | undefined): void {
    if (assetId) {
      const encodedUserId = btoa(assetId.toString());
      this.router.navigate(['/asset-details'], {
        queryParams: { id: encodedUserId },
      });
    }
  }

  goBack() {
    this.router.navigate(['/landing-page']);
  }
}
