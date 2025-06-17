import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Directionality } from '@angular/cdk/bidi';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManageAssetService } from '../../services/asset.service';
import { ListService } from '../../services/list.service';
import Swal from 'sweetalert2';
import { environment } from '../../constants/enviroments';
import { DirectSaleAssetDto } from '../../modals/add-asset';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

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
toggleTypeSelection(_t28: string) {
throw new Error('Method not implemented.');
}
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
  langCode:string |null = 'en';
  cartAssetIds: number[] = [];

  isFilterOpen = false;
  priceRange: number = 0; // 0 = Low to High, 100 = High to Low
  priceSortDirection: 'asc' | 'desc' = 'asc';
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

  categoryName: string = '';

  sortOptions: { value: string; label: string }[] = [];
  selectedSort: string = '';

  availableTags: string[] = [];
  selectedTags: Set<string> = new Set();

  availableConditions: string[] = [];
  selectedConditions: Set<string> = new Set();

  availableLocations: string[] = [];
  selectedLocation: string = '';

  minPrice: number = 0;
  maxPrice: number = 0;
  selectedMinPrice: number = 0;
  selectedMaxPrice: number = 0;

  availableCategoryTags: string[] = [];
  selectedCategoryTag: string = '';

  lastSortControl: 'dropdown' | 'slider' = 'dropdown';

  isRtl:boolean = false; 
  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private listService: ListService,
    private router: Router,
    private languageService:LanguageService,
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
   const savedLayoutType = localStorage.getItem('layoutType');
  this.layoutType = savedLayoutType === 'row' ? 'row' : 'grid';

  // const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  // const isreload = entry?.type === 'reload';
  // if(isreload){
  //   const savedLayoutType= localStorage.getItem('layoutType');
  //   this.layoutType =  savedLayoutType === 'row' ? 'row' : 'grid';
  // }else{
  //   localStorage.removeItem('layoutType');
  //   this.layoutType = 'grid';
  // }

    this.viewportScroller.scrollToPosition([0, 0]);
    this.userId = this.authService.getUserIdJwt();
    this.languageService.lang$.subscribe(lang => {
        this.langCode = lang;
         this.isRtl = lang === 'ar';
        // this.fetchCategories(); 
      
      console.log("string",this.langCode)   
    const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
    if (!isNaN(categoryId)) {
      this.assetService.getDirectAssets(categoryId,this.langCode).subscribe({
        next: (data) => {
          this.assets = data;
          this.originalAssets = [...data];
          this.categoryName = data[0]?.categoryName || '';

         //new added           
          this.extractDynamicFilterOptions();
          this.applyFilters();
          this.categoryName = data[0]?.categoryName || '';
          this.loadWishlist();
          this.loadCartItems();
          this.extractDynamicFilterOptions();
          this.applyFilters();
          this.extractCategoryTags();
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


//added new
extractDynamicFilterOptions() {
  const allAssets = this.originalAssets;
  const tagsSet = new Set<string>();
  const conditionSet = new Set<string>();
  const locationSet = new Set<string>();
  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = 0;

  allAssets.forEach(asset => {
    if ((asset as any).attributes && Array.isArray((asset as any).attributes)) {
      for (const attr of (asset as any).attributes) {
        if (attr.attributeName?.toLowerCase() === 'tag' && attr.attributeValue) {
          tagsSet.add(attr.attributeValue);
        }
        if (attr.attributeName?.toLowerCase() === 'condition' && attr.attributeValue) {
          conditionSet.add(attr.attributeValue);
        }
        if (attr.attributeName?.toLowerCase() === 'location' && attr.attributeValue) {
          locationSet.add(attr.attributeValue);
        }
      }
    }
    if (typeof asset.price === 'number') {
      if (asset.price < minPrice) minPrice = asset.price;
      if (asset.price > maxPrice) maxPrice = asset.price;
    }
  });

  this.availableTags = Array.from(tagsSet);
  this.availableConditions = Array.from(conditionSet);
  this.availableLocations = Array.from(locationSet);
  this.minPrice = isFinite(minPrice) ? minPrice : 0;
  this.maxPrice = maxPrice;
  this.selectedMinPrice = this.minPrice;
  this.selectedMaxPrice = this.maxPrice;

  this.sortOptions = this.getSortOptionsForCategory(this.categoryName);
  this.selectedSort = this.sortOptions[0]?.value || '';
}


//added new
getSortOptionsForCategory(categoryName: string) {
  return [
    { value: 'bids_desc', label: 'Bids: Highest – Lowest' },
    { value: 'bids_asc', label: 'Bids: Lowest – Highest' },
    { value: 'price_desc', label: 'Price: Highest – Lowest' },
    { value: 'price_asc', label: 'Price: Lowest – Highest' },
  ];
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
    localStorage.removeItem('layoutType');
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

  // applyFilters() {
  //   let filteredAssets = [...this.originalAssets];

  //   if (this.searchQuery.trim()) {
  //     const searchTerm = this.searchQuery.toLowerCase().trim();
  //     filteredAssets = filteredAssets.filter(asset =>
  //       asset.title?.toLowerCase().includes(searchTerm) ||
  //       asset.description?.toLowerCase().includes(searchTerm)
  //     );
  //   }

  //   if (this.selectedTags.size > 0) {
  //     filteredAssets = filteredAssets.filter(asset => {
  //       if ((asset as any).attributes && Array.isArray((asset as any).attributes)) {
  //         return (asset as any).attributes.some((attr: any) =>
  //           attr.attributeName?.toLowerCase() === 'tag' && this.selectedTags.has(attr.attributeValue)
  //         );
  //       }
  //       return false;
  //     });
  //   }

  //   if (this.selectedConditions.size > 0) {
  //     filteredAssets = filteredAssets.filter(asset => {
  //       if ((asset as any).attributes && Array.isArray((asset as any).attributes)) {
  //         return (asset as any).attributes.some((attr: any) =>
  //           attr.attributeName?.toLowerCase() === 'condition' && this.selectedConditions.has(attr.attributeValue)
  //         );
  //       }
  //       return false;
  //     });
  //   }

  //   if (this.categoryName.toLowerCase().includes('propert') && this.selectedLocation) {
  //     filteredAssets = filteredAssets.filter(asset => {
  //       if ((asset as any).attributes && Array.isArray((asset as any).attributes)) {
  //         return (asset as any).attributes.some((attr: any) =>
  //           attr.attributeName?.toLowerCase() === 'location' && attr.attributeValue === this.selectedLocation
  //         );
  //       }
  //       return false;
  //     });
  //   }

  //   filteredAssets = filteredAssets.filter(asset => {
  //     return asset.price >= this.selectedMinPrice && asset.price <= this.selectedMaxPrice;
  //   });

  //   filteredAssets = this.sortAssets(filteredAssets, this.selectedSort);

  //   this.assets = filteredAssets;
  // }


  //added new
  applyFilters() {
    let filteredAssets = [...this.originalAssets];

  // Filter by selected category tag
  if (this.selectedCategoryTag) {
    filteredAssets = filteredAssets.filter(asset => asset.categoryName === this.selectedCategoryTag);
  }

  // Search
    if (this.searchQuery.trim()) {
      const searchTerm = this.searchQuery.toLowerCase().trim();
      filteredAssets = filteredAssets.filter(asset => 
        asset.title?.toLowerCase().includes(searchTerm) ||
        asset.description?.toLowerCase().includes(searchTerm)
      );
    }

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

  // Condition
  if (this.selectedConditions.size > 0) {
    filteredAssets = filteredAssets.filter(asset => {
      if ((asset as any).attributes && Array.isArray((asset as any).attributes)) {
        return (asset as any).attributes.some((attr: any) =>
          attr.attributeName?.toLowerCase() === 'condition' && this.selectedConditions.has(attr.attributeValue)
      );
      }
      return false;
    });
    }

  // Location (only for Properties)
  if (this.categoryName.toLowerCase().includes('propert') && this.selectedLocation) {
    filteredAssets = filteredAssets.filter(asset => {
      if ((asset as any).attributes && Array.isArray((asset as any).attributes)) {
        return (asset as any).attributes.some((attr: any) =>
          attr.attributeName?.toLowerCase() === 'location' && attr.attributeValue === this.selectedLocation
        );
      }
      return false;
    });
  }

  // Price range checkboxes
      const selectedRanges = this.filters.prices.ranges.filter(range => range.selected);
      if (selectedRanges.length > 0) {
        filteredAssets = filteredAssets.filter(asset => {
          return selectedRanges.some(range => {
            if (range.max === null) {
          return asset.price >= range.min;
            }
        return asset.price >= range.min && asset.price <= range.max;
          });
        });
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
    this.lastSortControl = 'slider';
    this.priceSortDirection = this.priceRange <= 50 ? 'asc' : 'desc';
    this.applyFilters();
  }

  onSortByChange() {
    this.lastSortControl = 'dropdown';
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

  // extractDynamicFilterOptions() {
  //   const allAssets = this.originalAssets;
  //   const tagsSet = new Set<string>();
  //   const conditionSet = new Set<string>();
  //   const locationSet = new Set<string>();
  //   let minPrice = Number.POSITIVE_INFINITY;
  //   let maxPrice = 0;

  //   allAssets.forEach(asset => {
  //     if ((asset as any).attributes && Array.isArray((asset as any).attributes)) {
  //       for (const attr of (asset as any).attributes) {
  //         if (attr.attributeName?.toLowerCase() === 'tag' && attr.attributeValue) {
  //           tagsSet.add(attr.attributeValue);
  //         }
  //         if (attr.attributeName?.toLowerCase() === 'condition' && attr.attributeValue) {
  //           conditionSet.add(attr.attributeValue);
  //         }
  //         if (attr.attributeName?.toLowerCase() === 'location' && attr.attributeValue) {
  //           locationSet.add(attr.attributeValue);
  //         }
  //       }
  //     }
  //     if (typeof asset.price === 'number') {
  //       if (asset.price < minPrice) minPrice = asset.price;
  //       if (asset.price > maxPrice) maxPrice = asset.price;
  //     }
  //   });

  //   this.availableTags = Array.from(tagsSet);
  //   this.availableConditions = Array.from(conditionSet);
  //   this.availableLocations = Array.from(locationSet);
  //   this.minPrice = isFinite(minPrice) ? minPrice : 0;
  //   this.maxPrice = maxPrice;
  //   this.selectedMinPrice = this.minPrice;
  //   this.selectedMaxPrice = this.maxPrice;

  //   this.sortOptions = this.getSortOptionsForCategory(this.categoryName);
  //   this.selectedSort = this.sortOptions[0]?.value || '';
  // }

  // getSortOptionsForCategory(categoryName: string) {
  //   const base = [
  //     { value: 'bids_desc', label: 'Bids: Highest – Lowest' },
  //     { value: 'bids_asc', label: 'Bids: Lowest – Highest' },
  //     { value: 'price_desc', label: 'Price: Highest – Lowest' },
  //     { value: 'price_asc', label: 'Price: Lowest – Highest' },
  //     { value: 'ending_soon', label: 'Ending: Soon – Latest' },
  //     { value: 'ending_latest', label: 'Ending: Latest – Soon' },
  //   ];
  //   if (categoryName.toLowerCase().includes('car plate')) {
  //     return [
  //       ...base,
  //       { value: 'number_desc', label: 'Number: Highest – Lowest' },
  //       { value: 'number_asc', label: 'Number: Lowest – Highest' },
  //     ];
  //   }
  //   return base;
  // }

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
      case 'ending_soon':
        return assets.sort((a, b) => new Date(a.auctionEndTime || 0).getTime() - new Date(b.auctionEndTime || 0).getTime());
      case 'ending_latest':
        return assets.sort((a, b) => new Date(b.auctionEndTime || 0).getTime() - new Date(a.auctionEndTime || 0).getTime());
      case 'number_desc':
        return assets.sort((a, b) => (parseInt(b.assetNumber) || 0) - (parseInt(a.assetNumber) || 0));
      case 'number_asc':
        return assets.sort((a, b) => (parseInt(a.assetNumber) || 0) - (parseInt(b.assetNumber) || 0));
      default:
        return assets;
    }
  }

  extractCategoryTags() {
    const categorySet = new Set<string>();
    this.originalAssets.forEach(asset => {
      if (asset.categoryName) {
        categorySet.add(asset.categoryName);
      }
    });
    this.availableCategoryTags = Array.from(categorySet);
  }

  getPriceSliderBackground(): string {
    const percentage = this.priceRange;
    return `linear-gradient(to right, #9b59b6 0%, #9b59b6 ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
  }

  extractTypesFromAttributes() {
  const typeSet = new Set<string>();
  this.originalAssets.forEach(asset => {
    const attrs = (asset as any).attributes;
    if (attrs && Array.isArray(attrs)) {
      attrs.forEach((attr: any) => {
        if (attr.attributeName?.toLowerCase() === 'type' && attr.attributeValue) {
          typeSet.add(attr.attributeValue);
        }
      });
    }
  });
  this.availableTags = Array.from(typeSet);
  }
  
}
