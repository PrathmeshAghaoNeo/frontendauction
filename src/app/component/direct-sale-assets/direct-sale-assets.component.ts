import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManageAssetService } from '../../services/asset.service';
import { ListService } from '../../services/list.service';
import Swal from 'sweetalert2';
import { environment } from '../../constants/enviroments';
import { DirectSaleAssetDto } from '../../modals/add-asset';
import { AuthService } from '../../services/auth.service';

declare var bootstrap: any;

interface ActiveFilter {
  type: string;
  value: any;
  label: string;
}

@Component({
  selector: 'app-direct-sale-assets',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  cartAssetIds: number[] = [];

  isFilterOpen = false;
  priceRange = 0;
  selectedPriceRange = { min: 0, max: 100 };
  uniqueAssetNames: string[] = [];
  filteredAssetNames: string[] = [];

  filters = {
    assetNames: {
      enabled: true,
      selected: new Set<string>()
    },
    prices: {
      enabled: true,
      ranges: [
        { min: 0, max: 100, selected: false },
        { min: 101, max: 500, selected: false },
        { min: 501, max: 1000, selected: false },
        { min: 1001, max: 5000, selected: false },
        { min: 5001, max: null, selected: false }
      ]
    },
    durations: {
      enabled: true,
      options: [
        { days: 1, label: '1 Day', selected: false },
        { days: 7, label: '7 Days', selected: false },
        { days: 30, label: '30 Days', selected: false },
        { days: 90, label: '90 Days', selected: false }
      ]
    }
  };

  searchQuery: string = '';
  searchTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private listService: ListService,
    private router: Router,
    private authService: AuthService,
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

  ngOnInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.userId = this.authService.getUserIdJwt();

    const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
    if (!isNaN(categoryId)) {
      this.assetService.getDirectAssets(categoryId).subscribe({
        next: (data) => {
          this.assets = data;
          this.originalAssets = [...data];
          this.loadWishlist();
          this.loadCartItems();
          this.updateUniqueAssetNames();
          this.filteredAssetNames = [...this.uniqueAssetNames];
        },
        error: (err) => {
          console.error('Error fetching assets:', err);
          Swal.fire('Error!', err.error.message || 'Failed to fetch assets.');
        },
      });
    } else {
      Swal.fire('Error!', 'Invalid category ID');
    }
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
         }else{
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
         }else{
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
    window.history.back();
  }

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
    // Only toggle the filter panel by toggling the .filter-open class on the main container
    const container = document.querySelector('.Grid-container');
    if (this.isFilterOpen) {
      container?.classList.add('filter-open');
    } else {
      container?.classList.remove('filter-open');
    }
  }

  // Close filter when clicking outside (optional)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const filterPanel = document.querySelector('.filter-panel');
    const filterButton = document.querySelector('.filter-btn-icon');

    if (this.isFilterOpen && 
        filterPanel && 
        !filterPanel.contains(target) && 
        !filterButton?.contains(target)) {
      this.toggleFilter();
    }
  }

  // Handle escape key to close filter
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.isFilterOpen) {
      this.toggleFilter();
    }
  }

  updateUniqueAssetNames() {
    this.uniqueAssetNames = Array.from(new Set(this.assets.map(asset => asset.title)));
  }

  toggleAssetNameSelection(assetName: string) {
    if (this.filters.assetNames.selected.has(assetName)) {
      this.filters.assetNames.selected.delete(assetName);
    } else {
      this.filters.assetNames.selected.add(assetName);
    }
  }

  updatePriceRange() {
    // Get the maximum price from all assets
    const maxPrice = Math.max(...this.originalAssets.map(asset => asset.price || 0));
    
    // Calculate the current price based on the slider percentage
    const currentPrice = (this.priceRange / 100) * maxPrice;
    
    this.selectedPriceRange = {
      min: 0,
      max: Math.round(currentPrice)
    };

    // Sort assets based on price and slider position
    let filteredAssets = [...this.assets];
    
    if (this.priceRange <= 50) {
      // Low to High
      filteredAssets.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else {
      // High to Low
      filteredAssets.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    this.assets = filteredAssets;
  }

  onSearchInput() {
    // Clear the previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set a new timeout to avoid too many updates
    this.searchTimeout = setTimeout(() => {
      this.filterAssetsBySearch();
    }, 300);
  }

  filterAssetsBySearch() {
    if (!this.searchQuery.trim()) {
      // If search is empty, restore original filtered assets
      this.applyFilters();
      return;
    }

    const searchTerm = this.searchQuery.toLowerCase().trim();
    let filteredAssets = [...this.originalAssets];

    // Filter assets by search term
    filteredAssets = filteredAssets.filter(asset => 
      asset.title?.toLowerCase().includes(searchTerm) ||
      asset.description?.toLowerCase().includes(searchTerm)
    );

    // Apply other active filters to the search results
    this.assets = filteredAssets;
    this.applyFilters();
  }

  clearSearch() {
    this.searchQuery = '';
    this.filterAssetsBySearch();
  }

  applyFilters() {
    let filteredAssets = [...this.originalAssets];

    // Apply search filter first if there's a search query
    if (this.searchQuery.trim()) {
      const searchTerm = this.searchQuery.toLowerCase().trim();
      filteredAssets = filteredAssets.filter(asset => 
        asset.title?.toLowerCase().includes(searchTerm) ||
        asset.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by selected asset names
    if (this.filters.assetNames.enabled && this.filters.assetNames.selected.size > 0) {
      filteredAssets = filteredAssets.filter(asset => 
        this.filters.assetNames.selected.has(asset.title)
      );
    }

    // Filter by selected price ranges
    if (this.filters.prices.enabled) {
      const selectedRanges = this.filters.prices.ranges.filter(range => range.selected);
      if (selectedRanges.length > 0) {
        filteredAssets = filteredAssets.filter(asset => {
          return selectedRanges.some(range => {
            const price = asset.price || 0;
            if (range.max === null) {
              return price >= range.min;
            }
            return price >= range.min && price <= range.max;
          });
        });
      }
    }

    // Filter by selected durations
    if (this.filters.durations.enabled) {
      const selectedDurations = this.filters.durations.options.filter(opt => opt.selected);
      if (selectedDurations.length > 0) {
        const currentDate = new Date();
        filteredAssets = filteredAssets.filter(asset => {
          if (!asset.createdAt) return false;
          const assetDate = new Date(asset.createdAt);
          if (isNaN(assetDate.getTime())) return false;
          const diffDays = Math.ceil((currentDate.getTime() - assetDate.getTime()) / (1000 * 60 * 60 * 24));
          return selectedDurations.some(duration => diffDays <= duration.days);
        });
      }
    }

    // Apply price sorting based on slider position
    if (this.priceRange <= 50) {
      // Low to High
      filteredAssets.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else {
      // High to Low
      filteredAssets.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    this.assets = filteredAssets;
  }

  resetFilters() {
    this.filters.assetNames.selected.clear();
    this.filters.prices.ranges.forEach(range => range.selected = false);
    this.filters.durations.options.forEach(opt => opt.selected = false);
    this.priceRange = 0;
    this.selectedPriceRange = { min: 0, max: 100 };
    this.loadAssets();
  }

  loadAssets() {
    // Restore the original assets
    this.assets = [...this.originalAssets];
  }

  filterAssetNames(searchText: string) {
    if (!searchText) {
      this.filteredAssetNames = [...this.uniqueAssetNames];
    } else {
      const search = searchText.toLowerCase();
      this.filteredAssetNames = this.uniqueAssetNames.filter(name => 
        name.toLowerCase().includes(search)
      );
    }
  }

  onAssetNameChange(name: string, event: any) {
    if (event.target.checked) {
      this.filters.assetNames.selected.add(name);
    } else {
      this.filters.assetNames.selected.delete(name);
    }
    this.applyFilters();
  }

  onPriceRangeChange() {
    this.applyFilters();
  }

  onDurationChange() {
    this.applyFilters();
  }

  onPriceSortingChange() {
    this.updatePriceRange();
    // Update the slider background
    const slider = document.querySelector('.slider') as HTMLElement;
    if (slider) {
      const percentage = this.priceRange;
      slider.style.background = `linear-gradient(to right, #9b59b6 0%, #9b59b6 ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
    }
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return (
      this.filters.assetNames.selected.size > 0 ||
      this.filters.prices.ranges.some(range => range.selected) ||
      this.filters.durations.options.some(option => option.selected)
    );
  }

  getActiveFilters(): ActiveFilter[] {
    const activeFilters: ActiveFilter[] = [];

    // Add asset name filters
    this.filters.assetNames.selected.forEach(name => {
      activeFilters.push({
        type: 'asset',
        value: name,
        label: name
      });
    });

    // Add price range filters
    this.filters.prices.ranges.forEach(range => {
      if (range.selected) {
        const label = range.max 
          ? `${range.min} - ${range.max} BHD`
          : `${range.min}+ BHD`;
        activeFilters.push({
          type: 'price',
          value: range,
          label: label
        });
      }
    });

    // Add duration filters
    this.filters.durations.options.forEach(option => {
      if (option.selected) {
        activeFilters.push({
          type: 'duration',
          value: option.days,
          label: option.label
        });
      }
    });

    return activeFilters;
  }

  removeFilter(type: string, value: any) {
    switch (type) {
      case 'asset':
        this.filters.assetNames.selected.delete(value);
        break;
      case 'price':
        const priceRange = this.filters.prices.ranges.find(
          range => range.min === value.min && range.max === value.max
        );
        if (priceRange) {
          priceRange.selected = false;
        }
        break;
      case 'duration':
        const durationOption = this.filters.durations.options.find(
          option => option.days === value
        );
        if (durationOption) {
          durationOption.selected = false;
        }
        break;
    }
    this.applyFilters();
  }

  clearAllFilters() {
    // Clear asset names
    this.filters.assetNames.selected.clear();
    
    // Clear price ranges
    this.filters.prices.ranges.forEach(range => range.selected = false);
    
    // Clear durations
    this.filters.durations.options.forEach(option => option.selected = false);
    
    // Reset price sorting
    this.priceRange = 50;
    this.updatePriceRange();
    
    this.applyFilters();
  }
}
