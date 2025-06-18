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
import { AssetCategoriesService } from '../../services/assetcategories.service';
import { CategorySelectorComponent } from "../category-selector/category-selector.component";

declare var bootstrap: any;

@Component({
  selector: 'app-direct-sale-assets',
  standalone: true,
  imports: [CommonModule, CategorySelectorComponent],
  templateUrl: './direct-sale-assets.component.html',
  styleUrl: './direct-sale-assets.component.css',
})
export class DirectSaleAssetsComponent implements OnInit, AfterViewInit {
  @ViewChild('liveToast') liveToast!: ElementRef;
  toastInstance: any;

  toOrders() {
    this.router.navigate(['/orders']);
  }

  assets: DirectSaleAssetDto[] = [];
  originalAssets: DirectSaleAssetDto[] = [];
  layoutType: 'grid' | 'row' = 'grid';
  userId: number | null = null;
  environment = environment;
  wishlistAssetIds: number[] = [];
  langCode: string | null = 'en';
  cartAssetIds: number[] = [];
  isRtl: boolean = false;
  noAssetsFound: boolean = false;
  categories: any[] = [];
  selectedCategoryIds: number[] = [];
  activeCategoryId: number | null = null;
  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private listService: ListService,
    private router: Router,
    private languageService: LanguageService,
    private authService: AuthService,
    private dir: Directionality,
    private viewportScroller: ViewportScroller,
    private categoryService: AssetCategoriesService
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
  //   // this.route.paramMap.subscribe(params=>{
  //   //   const id = params.get('assetId');
  //   //   this.activeCategoryId = id?+id:null;
  //   //   this.loadCategories();
  //   //    console.log("current id",this.activeCategoryId);
  //   // });
    
  //   const savedLayoutType = localStorage.getItem('layoutType');
  //   this.layoutType = savedLayoutType === 'row' ? 'row' : 'grid';

  //   this.viewportScroller.scrollToPosition([0, 0]);
  //   this.userId = this.authService.getUserIdJwt();
  //   this.languageService.lang$.subscribe((lang) => {
  //     this.langCode = lang;
  //     this.isRtl = lang === 'ar';
  //     // this.fetchCategories();

  //     console.log('string', this.langCode);
  //     const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
  //     if (!isNaN(categoryId)) {
  //       this.assetService.getDirectAssets(categoryId, this.langCode).subscribe({
  //         next: (data) => {
  //           this.assets = data;
  //           this.originalAssets = [...data];
  //           this.loadWishlist();
  //           this.loadCartItems();
  //         },
  //         error: (err) => {
  //           console.error('Error fetching assets:', err);
  //           Swal.fire('Error!', err.error.message || 'Failed to fetch assets.');
  //         },
  //       });
  //     } else {
  //       Swal.fire('Error!', 'Invalid category ID');
  //     }
  //   });
  // }
  ngOnInit(): void {
  // Restore layout from localStorage
  const savedLayoutType = localStorage.getItem('layoutType');
  this.layoutType = savedLayoutType === 'row' ? 'row' : 'grid';

  this.viewportScroller.scrollToPosition([0, 0]);
  this.userId = this.authService.getUserIdJwt();

  // Subscribe to language change
  this.languageService.lang$.subscribe((lang) => {
    this.langCode = lang;
    this.isRtl = lang === 'ar';

    // Watch for route param changes (category ID)
    this.route.paramMap.subscribe((params) => {
      const categoryId = Number(params.get('categoryId'));

      if (!isNaN(categoryId)) {
        this.fetchDirectAssets(categoryId);
      } else {
        Swal.fire('Error!', 'Invalid category ID');
      }
    });
  });
}

fetchDirectAssets(categoryId: number): void {
  // Clear previous state
  this.assets = [];
  this.originalAssets = [];
  this.noAssetsFound = false;

  this.assetService.getDirectAssets(categoryId, this.langCode).subscribe({
    next: (data) => {
      if (!data || data.length === 0) {
        this.noAssetsFound = true;
        console.warn('⚠️ No direct sale assets found for this category.');
        return;
      }

      this.assets = data;
      this.originalAssets = [...data];
      this.loadWishlist();
      this.loadCartItems();
    },
    error: (err) => {
      console.error('❌ Error fetching direct assets:', err);
      Swal.fire('Error!', err.error?.message || 'Failed to fetch assets.');
    },
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

  loadCategories() {
    this.categoryService.getAll().subscribe((data: any[]) => {
      this.categories = data;
      console.log('Categories:', this.categories);
    });
  }

   isActive(categoryId: number): boolean {
    return this.activeCategoryId === categoryId;
  }

  toggleCategory(categoryId: number) {
    if (this.isActive(categoryId)) {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(
        (id) => id !== categoryId
      );
    } else {
      this.selectedCategoryIds.push(categoryId);
    }
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
    this.router.navigate(['/landing-page']);
  }
}
