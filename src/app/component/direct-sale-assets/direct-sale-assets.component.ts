import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Directionality } from '@angular/cdk/bidi';
import { CommonModule, ViewportScroller } from '@angular/common';
import { ManageAssetService } from '../../services/asset.service';
import { ListService } from '../../services/list.service';
import Swal from 'sweetalert2';
import { environment } from '../../constants/enviroments';
import { DirectSaleAssetDto } from '../../modals/add-asset';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import * as L from 'leaflet';

declare var bootstrap: any;

@Component({
  selector: 'app-direct-sale-assets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-sale-assets.component.html',
  styleUrl: './direct-sale-assets.component.css',
})
export class DirectSaleAssetsComponent implements OnInit, AfterViewInit {
  @ViewChild('liveToast') liveToast!: ElementRef;
  toastInstance: any;

  toOrders() {
    this.router.navigate(['/orders']);
  }


  showMap = false;
  private map!: L.Map;

  
  assets: DirectSaleAssetDto[] = [];
  originalAssets: DirectSaleAssetDto[] = [];
  layoutType: 'grid' | 'row' = 'grid';
  userId: number | null = null;
  environment = environment;
  wishlistAssetIds: number[] = [];
  langCode: string | null = 'en';
  cartAssetIds: number[] = [];
  isRtl: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private listService: ListService,
    private router: Router,
    private languageService: LanguageService,
    private authService: AuthService,
    private dir: Directionality,
    private viewportScroller: ViewportScroller
  ) {
  }

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

  ngOnInit(): void {
  // Load layout preference from localStorage (default: 'grid')
  const savedLayoutType = localStorage.getItem('layoutType');
  this.layoutType = savedLayoutType === 'row' ? 'row' : 'grid';

  // Scroll to top on component load
  this.viewportScroller.scrollToPosition([0, 0]);

  // Get user ID from JWT
  this.userId = this.authService.getUserIdJwt();

  // Subscribe to language changes
  this.languageService.lang$.subscribe(lang => {
    this.langCode = lang;
    this.isRtl = lang === 'ar';

    const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
    if (!isNaN(categoryId)) {
      this.assetService.getDirectAssets(categoryId, this.langCode).subscribe({
        next: (data) => {
          this.assets = data;
          this.originalAssets = [...data];
          this.loadWishlist();
          this.loadCartItems();
        },
        error: (err) => {
          console.error('Error fetching assets:', err);
          Swal.fire('Error!', err.error.message || 'Failed to fetch assets.');
        },
      });
    } else {
      Swal.fire('Error!', 'Invalid category ID');
    }
  });
}


  loadWishlist(): void {
    if (!this.userId) return;
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

  loadCartItems(): void {
    if (!this.userId) return;
    this.listService.getCart(this.userId).subscribe({
      next: (data) => {
        this.cartAssetIds = data.map((item: any) => item.assetId);
        console.log('Cart Asset IDs:', this.cartAssetIds);
      },
      error: (err) => {
        console.error('Error loading cart items:', err);
      },
    });
  }

  isInWishlist(assetId: number): boolean {
    return this.wishlistAssetIds.includes(assetId);
  }

  isInCart(assetId: number): boolean {
    return this.cartAssetIds.includes(assetId);
  }

  toggleWishlist(assetId: number): void {
    if (!this.userId) {
      this.showToast('User not logged in.', 'Error', 'error');
      this.router.navigate(['/login']);
      return;
    } else {
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
  }

  toCart() {
    this.router.navigate(['/bid-add-to-cart']);
  }

  toWatchlist() {
    this.router.navigate(['/bid-watchlist']);
  }

  toggleLayout() {
    this.layoutType = this.layoutType === 'grid' ? 'row' : 'grid';
    localStorage.setItem('layoutType', this.layoutType);
  }

  getFlagUrl(asset: DirectSaleAssetDto): string {
    return asset.galleries?.[0]?.fileUrl || 'assets/flags/bahrain.png';
  }

  searchText: string = '';

  filteredAssets() {
    return this.assets.filter((asset) =>
      asset.title?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  goToAssetDetail(assetId: number) {
    this.router.navigate(['/direct-sale-assetpage/', assetId]);
  }

  redirectToCart(): void {
    this.router.navigate(['/bid-add-to-cart']);
  }


  addToCart(assetId: number): void {
    if (!this.userId) {
      this.showToast('User not logged in.', 'Error', 'error');
      this.router.navigate(['/login']);
      return;
    } else {
      const payload = {
        userId: this.userId,
        assetId: assetId,
        quantity: 1,
      };

      this.listService.addToCart(payload).subscribe({
        next: () => {
          this.showToast(
            'This asset has been added to your cart.',
            'Success!',
            'success'
          );
          // this.listService.refreshComponent();
          this.cartAssetIds.push(assetId);
        },
        error: (err) => {
          this.showToast(
            err.error.message || 'Something went wrong while adding to cart.',
            'Error!',
            'error'
          );
        },
      });
    }
  }

  goBack() {
    localStorage.removeItem('layoutType');
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
        💰 BHD ${asset.price?.toLocaleString()}
      </div>

      <div style="font-size: 13px; color: #666;">
        📍 ${asset.location ?? 'Unknown'}
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
