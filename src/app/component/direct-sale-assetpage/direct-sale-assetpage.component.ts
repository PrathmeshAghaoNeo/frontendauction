import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';

import { ManageAssetService } from '../../services/asset.service';
import { Asset, Gallery } from '../../modals/manage-asset';
import { ListService } from '../../services/list.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

declare var bootstrap: any;

@Component({
  selector: 'app-direct-sale-assetpage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-sale-assetpage.component.html',
  styleUrls: ['./direct-sale-assetpage.component.scss'],
})
export class DirectSaleAssetComponent implements OnInit, AfterViewInit {
  @ViewChild('liveToast') liveToast!: ElementRef;
  toastInstance: any;

  assetId: number | null = null;
  asset: Asset | null = null;
  isLoading = true;
  price = 0;
  currency = 'BHD';
  userId: number | null = null;
  plateNumber = '';
  langCode: string | null = 'en';
  wishlistAssetIds: number[] = [];
  cartAssetIds: number[] = [];
  isRtl: boolean= false;

  // Slider and tab functionality variables
  currentSlideIndex: number = 0;
  activeTab: string = 'details';

  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private listService: ListService,
    private authService: AuthService,
    private languageService: LanguageService,
    private router: Router
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

  ngOnInit(): void {
    this.userId = this.authService.getUserIdJwt();

    this.route.paramMap.subscribe((params: ParamMap) => {
      // Try both keys in case your route is /:id or /:assetId
      const idStr = params.get('id') ?? params.get('assetId');
      const idNum = idStr !== null ? Number(idStr) : NaN;

      if (!isNaN(idNum)) {
        this.assetId = idNum;
        console.log('Asset ID from route:', this.assetId);
        this.languageService.lang$.subscribe((lang) => {
          this.langCode = lang;
          // this.fetchCategories();
          this.isRtl = lang === 'ar';
          this.loadAssetDetails();
        });
        this.loadCartItems();
        this.loadaddCartItems();
      } else {
        console.error('Invalid asset ID in route params:', idStr);
        this.isLoading = false;
      }
    });
  }

  loadaddCartItems(): void {
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

  loadCartItems(): void {
    this.listService.getCart(this.userId).subscribe({
      next: (data) => {
        this.wishlistAssetIds = data.map((item: any) => item.assetId);
        console.log('cart Asset IDs:', this.wishlistAssetIds);
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
      },
    });
  }
  loadAssetDetails(): void {
    if (this.assetId === null || isNaN(this.assetId)) {
      console.error(
        'Attempted to load data with invalid assetId:',
        this.assetId
      );
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    console.log('Fetching data for asset ID:', this.assetId);

    // Get asset details
    this.assetService.getAssetById(this.assetId, this.langCode).subscribe({
      next: (asset) => {
        if (asset) {
          this.asset = asset;
          this.plateNumber = asset.assetNumber || '';
          this.price = asset.startingPrice ?? 0;

          // If galleries aren't populated yet, get them
          if (!this.asset.galleries || this.asset.galleries.length === 0) {
            this.loadGallery();
          } else {
            this.isLoading = false;
          }
          console.log('Asset loaded:', this.asset);
        } else {
          console.warn('No asset data returned');
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading asset:', err);
        this.isLoading = false;
      },
    });
  }

  loadGallery(): void {
    if (!this.assetId) return;

    this.assetService.getAssetGallery(this.assetId).subscribe({
      next: (gallery) => {
        let galleryItems: Gallery[] = [];
        if (gallery) {
          galleryItems = Array.isArray(gallery) ? gallery : [gallery];
        }

        // Ensure fileUrl exists on each gallery item
        galleryItems = galleryItems.map((item) => {
          if (!item.fileUrl && item.imageUrl) {
            item.fileUrl = item.imageUrl;
          }
          return item;
        });

        // If asset exists, attach the gallery to it
        // if (this.asset) {
        //   this.asset.galleries = galleryItems;
        // }

        this.isLoading = false;
        console.log('Gallery loaded:', galleryItems.length);
      },
      error: (err) => {
        console.error('Error loading gallery:', err);
        this.isLoading = false;
      },
    });
  }

  isAssetInCart(): boolean {
    return (
      this.assetId !== null && this.wishlistAssetIds.includes(this.assetId)
    );
  }

  // Image slider functionality
  nextSlide(): void {
    if (this.asset && this.asset.galleries && this.asset.galleries.length > 0) {
      this.currentSlideIndex =
        (this.currentSlideIndex + 1) % this.asset.galleries.length;
    }
  }

  prevSlide(): void {
    if (this.asset && this.asset.galleries && this.asset.galleries.length > 0) {
      this.currentSlideIndex =
        (this.currentSlideIndex - 1 + this.asset.galleries.length) %
        this.asset.galleries.length;
    }
  }

  setCurrentSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  hasMultipleImages(): boolean {
    return (
      !!this.asset && !!this.asset.galleries && this.asset.galleries.length > 1
    );
  }

  hasImages(): boolean {
    return (
      !!this.asset && !!this.asset.galleries && this.asset.galleries.length > 0
    );
  }

  // Tab functionality
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Handle image errors
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';

    // Find the parent and add a fallback text element if it doesn't exist
    const parentDiv = imgElement.closest('.plate-number');
    if (parentDiv) {
      let fallbackElement = parentDiv.querySelector(
        '.plate-text'
      ) as HTMLElement;

      if (!fallbackElement) {
        fallbackElement = document.createElement('span');
        fallbackElement.className = 'plate-text';
        fallbackElement.textContent = this.plateNumber;
        parentDiv.appendChild(fallbackElement);
      } else {
        fallbackElement.style.display = 'block';
      }
    }
  }

  isInCart(): boolean {
    return this.cartAssetIds.includes(this.assetId ?? -1);
  }

  redirectToCart(): void {
    this.router.navigate(['/bid-add-to-cart']);
  }

  addToCart(): void {
    console.log('Adding to cart:', this.assetId);

    const payload = {
      userId: this.userId,
      assetId: this.assetId,
      quantity: 1,
    };

    console.log(this.assetId);

    this.listService.addToCart(payload).subscribe({
      next: () => {
        this.showToast(
          'This asset has been added to your cart.',
          'Added to Cart',
          'success'
        );
        this.listService.refreshComponent();
        if (
          this.assetId !== null &&
          !this.cartAssetIds.includes(this.assetId)
        ) {
          this.cartAssetIds.push(this.assetId);
        }
      },
      error: (err) => {
        console.log({ err });
        const errorMsg =
          err.error?.message || 'Something went wrong while adding to cart.';
        this.showToast(errorMsg, 'Error!', 'error');
      },
    });
  }

  goBack(): void {
    window.history.back();
  }
}
