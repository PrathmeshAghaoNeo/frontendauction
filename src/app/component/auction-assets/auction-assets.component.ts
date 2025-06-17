import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { BidService } from '../../services/bid.service';
import { bidStatsBulk } from '../../modals/bid-stats';
import { AuctionService } from '../../services/auction.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';



declare var bootstrap: any;

// Update the DirectSaleAssetDto interface
interface ExtendedDirectSaleAssetDto extends DirectSaleAssetDto {
  highestbid?: number;
  bidCount?: number;
  auctionEndTime?: string;
}

@Component({
  selector: 'app-direct-bid',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './auction-assets.component.html',
  styleUrl: './auction-assets.component.css'
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
  searchQuery: string = '';
  searchTimeout: any;

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

  sortOptions: { value: string; label: string }[] = [
    { value: 'bids_desc', label: 'Bids: Highest – Lowest' },
    { value: 'bids_asc', label: 'Bids: Lowest – Highest' },
    { value: 'price_desc', label: 'Price: Highest – Lowest' },
    { value: 'price_asc', label: 'Price: Lowest – Highest' },
  ];
  selectedSort: string = '';
  availableTags: string[] = [];
  selectedTags: Set<string> = new Set();
  lastSortControl: 'dropdown' | 'slider' = 'dropdown';
  priceSortDirection: 'asc' | 'desc' = 'asc';

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

    toastEl.querySelector('.toast-body').textContent = message;

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
          this.updateUniqueAssetNames();
          this.filteredAssetNames = [...this.uniqueAssetNames];

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

          this.extractDynamicFilterOptions();

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




  navigateToAsset(assetId: number | undefined): void {
    if (assetId) {
      const encodedUserId = btoa(assetId.toString());
      this.router.navigate(['/asset-details'], { queryParams: { id: encodedUserId } });
    }
  }

  goBack() {
    window.history.back();
  }

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
    const container = document.querySelector('.Grid-container');
    if (this.isFilterOpen) {
      container?.classList.add('filter-open');
    } else {
      container?.classList.remove('filter-open');
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

  // onPriceSortingChange() {
  //   this.lastSortControl = 'slider';
  //   this.priceSortDirection = this.priceRange <= 50 ? 'asc' : 'desc';
  //   this.applyFilters();
  // }

  hasActiveFilters(): boolean {
    return (
      this.filters.assetNames.selected.size > 0 ||
      this.filters.prices.ranges.some(range => range.selected) ||
      this.filters.durations.options.some(option => option.selected)
    );
  }

  getActiveFilters(): { type: string; value: any; label: string }[] {
    const activeFilters: { type: string; value: any; label: string }[] = [];

    this.filters.assetNames.selected.forEach(name => {
      activeFilters.push({
        type: 'asset',
        value: name,
        label: name
      });
    });

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
        const priceRange = this.filters.prices.ranges.find(r => r.min === value.min && r.max === value.max);
        if (priceRange) {
          priceRange.selected = false;
        }
        break;
      case 'duration':
        const duration = this.filters.durations.options.find(d => d.days === value);
        if (duration) {
          duration.selected = false;
        }
        break;
    }
    this.applyFilters();
  }

  clearAllFilters() {
    this.filters.assetNames.selected.clear();
    this.filters.prices.ranges.forEach(range => range.selected = false);
    this.filters.durations.options.forEach(option => option.selected = false);
    this.priceRange = 0;
    this.selectedPriceRange = { min: 0, max: 100 };
    this.applyFilters();
  }

  applyFilters() {
    let filteredAssets = [...this.originalAssets];

    // Tags
    if (this.selectedTags.size > 0) {
      filteredAssets = filteredAssets.filter(asset => {
        if ((asset as any).attributes && Array.isArray((asset as any).attributes)) {
          return (asset as any).attributes.some((attr: any) =>
            attr.attributeName?.toLowerCase() === 'tag' && this.selectedTags.has(attr.attributeValue)
          );
        }
        return false;
      });
    }

    // Apply search filter first if there's a search query
    if (this.searchQuery.trim()) {
      const searchTerm = this.searchQuery.toLowerCase().trim();
      filteredAssets = filteredAssets.filter(asset => 
        (asset.title || '').toLowerCase().includes(searchTerm) ||
        (asset.description || '').toLowerCase().includes(searchTerm)
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

    // Sorting logic
    if (this.lastSortControl === 'dropdown') {
      if (this.selectedSort) {
        filteredAssets = this.sortAssets(filteredAssets, this.selectedSort);
      }
    } else if (this.lastSortControl === 'slider') {
      if (this.priceSortDirection === 'asc') {
        filteredAssets.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else {
        filteredAssets.sort((a, b) => (b.price || 0) - (a.price || 0));
      }
    }

    this.assets = filteredAssets;
  }

  getTimeRemaining(endTime: string | undefined): string {
    if (!endTime) return 'N/A';
    
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const distance = end - now;
    
    if (distance < 0) {
      return 'Ended';
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  extractDynamicFilterOptions() {
    const tagsSet = new Set<string>();
    this.originalAssets.forEach(asset => {
      if ((asset as any).attributes && Array.isArray((asset as any).attributes)) {
        for (const attr of (asset as any).attributes) {
          if (attr.attributeName?.toLowerCase() === 'tag' && attr.attributeValue) {
            tagsSet.add(attr.attributeValue);
          }
        }
      }
    });
    this.availableTags = Array.from(tagsSet);
  }

  onSortByChange() {
    this.lastSortControl = 'dropdown';
    this.applyFilters();
  }

  onPriceSortingChange() {
    this.lastSortControl = 'slider';
    this.priceSortDirection = this.priceRange <= 50 ? 'asc' : 'desc';
    this.applyFilters();
  }

  sortAssets(assets: any[], sortBy: string) {
    switch (sortBy) {
      case 'bids_desc':
        return assets.sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0));
      case 'bids_asc':
        return assets.sort((a, b) => (a.bidCount || 0) - (b.bidCount || 0));
      case 'price_desc':
        return assets.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'price_asc':
        return assets.sort((a, b) => (a.price || 0) - (b.price || 0));
      default:
        return assets;
    }
  }
}


