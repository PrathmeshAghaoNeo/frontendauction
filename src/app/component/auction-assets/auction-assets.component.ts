import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Asset, } from '../../modals/manage-asset';
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
import * as L from 'leaflet';



declare var bootstrap: any;

@Component({
  selector: 'app-direct-bid',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './auction-assets.component.html',
  styleUrl: './auction-assets.component.css'
})
export class AuctionAssetsComponent implements OnInit, AfterViewInit {

  @ViewChild('liveToast') liveToast!: ElementRef;
  toastInstance: any;


  
    showMap = false;
    private map!: L.Map;
  
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
  langCode: string | null = "en";
  isRtl: boolean= false;
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
  ) { }


  ngAfterViewInit() {
    this.toastInstance = new bootstrap.Toast(this.liveToast.nativeElement);
  }

  showToast(message: string, header = 'Notification', type: 'success' | 'error' | 'info' = 'info') {

    const toastEl = this.liveToast.nativeElement;


    toastEl.querySelector('.toast-header ').textContent = header;

    // Change toast body message
    toastEl.querySelector('.toast-body').textContent = message;

    // Change header bg color depending on type
    const headerEl = toastEl.querySelector('.toast-header');

    headerEl.classList.remove('bg-success', 'bg-danger', 'bg-info', 'text-white');
    if (type === 'success') {
      headerEl.classList.add('bg-success', 'text-white');
    } else if (type === 'error') {
      headerEl.classList.add('bg-danger', 'text-white');
    } else {
      headerEl.classList.add('bg-danger', 'text-white');
    }

    this.toastInstance.show();
  }

  ngOnInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.userId = this.authService.getUserIdJwt();
    this.languageService.lang$.subscribe(lang => {
        this.langCode = lang;
         this.isRtl = lang === 'ar';
        // this.fetchCategories(); 
      
    const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
    if (!isNaN(categoryId)) {
      this.listService.getAuctionAssetsByCategory(categoryId,this.langCode).subscribe({
        next: (data) => {
          this.assets = data;
          this.originalAssets = [...data];
          this.loadWishlist();
          this.noAssetsFound = this.assets.length === 0;
          this.assetIds = this.assets.map(a => a.assetId);
          this.AuctionIds = this.assets.map(a => a.auctionId);

          // Step 1: Get bid stats
          this.bidService.getBidStatsByAssetIds(this.assetIds).subscribe({
            next: (bidStatsList: bidStatsBulk[]) => {
              this.assets = this.assets.map(asset => {
                const stats = bidStatsList.find(b => b.assetId === asset.assetId);
                return {
                  ...asset,
                  bidCount: stats?.bidCount ?? 0,
                  highestbid: stats?.highestBid,
                };
              });

              // Step 2: Get auctions by IDs
              this.auctionService.getAuctionsByIds(this.AuctionIds).subscribe({
                next: (auctions: Auction[]) => {
                  this.assets = this.assets.map(asset => {
                    const auction = auctions.find(a => a.auctionId === asset.auctionId);
                    return {
                      ...asset,
                      auctionEndTime: auction?.endDateTime ?? null,
                    };
                  });
                  console.log("Final mapped assets with auction info:", this.assets);
                },
                error: err => console.error('Error fetching auctions:', err)
              });

            },
            error: err => console.error('Error fetching bid stats:', err)
          });

        },
        error: err => console.error('Error fetching assets:', err)
      });
    } else {
      console.error('Invalid category ID');
    }
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
      quantity: 1
    };

    console.log(assetId);

    this.listService.addToWishlist(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Added to Wishlist',
          text: 'This asset has been added to your wishlist.',
          confirmButtonText: 'OK'
        });
      },
      error: (err) => {
        console.error('Error adding asset to wishlist:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.message || 'Something went wrong while adding to wishlist.',
          confirmButtonText: 'OK'
        });
      }
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
      quantity: 1
    };

    this.http.post('', payload).subscribe({
      next: () => {
        alert('Asset added to cart.');
        // Optional: redirect to checkout
        // this.router.navigate(['/checkout']);
      },
      error: (err) => alert('Error adding to cart: ' + err.message)
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
      this.router.navigate(['/asset-details'], { queryParams: { id: encodedUserId } });
    }
  }

  goBack() {
    window.history.back();
  }


  
   toggleMap() {
    this.showMap = !this.showMap;
  
    if (this.showMap) {
      setTimeout(() => this.initMap(), 100); // ensure DOM is ready
    } else {
      if (this.map) {
        this.map.remove();
        // this.map = undefined;
      }
    }
  }
  
    backToList() {
      this.showMap = false;
    }
  
  
  
    private async initMap(): Promise<void> {
    this.map = L.map('map').setView([51.505, -0.09, 50.58], 2);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  
    for (const asset of this.assets) {
      if (!asset.mapLatitude || !asset.mapLongitude) continue;
  
      (asset as any).location = await this.getLocationFromCoords(asset.mapLatitude, asset.mapLongitude);
      const latLng: [number, number] = [asset.mapLatitude, asset.mapLongitude];
      L.circle(latLng, {
      radius: 200, // in meters
      color: '#222',       // border color
      fillColor: '#000',   // inner color
      fillOpacity: 0.25,   // glow effect
      weight: 1,
    }).addTo(this.map);
  
      const icon = L.divIcon({
        className: 'price-marker',
        html: `<div class="price-label">BHD ${asset.price?.toLocaleString()}</div>`,
        iconSize: [100, 30],
        iconAnchor: [50, 15]
      });
  
      const marker = L.marker([asset.mapLatitude, asset.mapLongitude], { icon }).addTo(this.map);
  
      marker.on('mouseout', () => {
        marker.bindPopup(this.generatePopup(asset)).closePopup();
      });
  
      marker.on('mouseover', () => {
        marker.bindPopup(this.generatePopup(asset)).openPopup();
      });
      
    }
  }
  
    private generatePopup(asset: any): string {
    const imageUrls = asset.galleries?.length
      ? asset.galleries.map((g: any) => environment.baseurl + g.filePath)
      : ['default.jpg'];
  
    const sliderId = `slider-${asset.assetId}`;
      const remainingTime = this.getTimeRemaining(asset.auctionEndTime);
    return `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 220px;">
    <img 
      id="${sliderId}" 
      src="${imageUrls[0]}" 
      alt="${asset.title}" 
      style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;"
    />

    <div style="font-size: 14px; font-weight: 600; color: #222; margin-bottom: 2px;">
      ${asset.title}
    </div>

    <div style="font-size: 13px; color: #444; margin-bottom: 2px;">
      💰 BHD ${asset.highestbid ?? asset.price}
    </div>

    <div style="font-size: 13px; color: #666; margin-bottom: 6px;">
      📍 ${asset.location ?? 'Unknown'}
    </div>

    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #444;
      padding: 6px 0 0;
      border-top: 1px solid #eee;
    ">
      <div style="display: flex; align-items: center; gap: 4px;">
        <img src="Bidauction1.png" width="14" height="14" />
        <span>${asset.bidCount ?? 0}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <img src="chronometer.png" width="14" height="14" />
        <span>${remainingTime?? 'N/A'}</span>
      </div>
    </div>

    <script>
      (function() {
        const images = ${JSON.stringify(imageUrls)};
        let index = 0;
        const img = document.getElementById("${sliderId}");
        if (images.length > 1 && img) {
          setInterval(() => {
            index = (index + 1) % images.length;
            img.src = images[index];
          }, 2500);
        }
      })();
    </script>
  </div>
`;

  }
  
  
  // <button onclick="window.location.href='/asset/${asset.assetId}'"
  //         style="
  //           display: inline-block;
  //           width: 100%;
  //           padding: 8px 0;
  //           background: #007bff;
  //           color: #fff;
  //           font-size: 14px;
  //           border: none;
  //           border-radius: 6px;
  //           cursor: pointer;
  //           transition: background 0.2s ease;
  //         "
  //         onmouseover="this.style.background='#0056b3'"
  //         onmouseout="this.style.background='#007bff'"
  //       >
  //         🔍 View Details
  //       </button>
  
    private async getLocationFromCoords(lat: number, lon: number): Promise<string> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await response.json();
      return data.display_name || 'Unknown';
    } catch (error) {
      console.error('Error fetching location:', error);
      return 'Unknown';
    }
  }
  
}


