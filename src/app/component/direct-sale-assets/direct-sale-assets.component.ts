import { AfterViewInit, Component, ElementRef, OnInit , ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ManageAssetService } from '../../services/asset.service';
import { ListService } from '../../services/list.service';
import Swal from 'sweetalert2';
import { environment } from '../../constants/enviroments';
import { DirectSaleAssetDto } from '../../modals/add-asset';

declare var bootstrap: any; 

@Component({
  selector: 'app-direct-sale-assets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-sale-assets.component.html',
  styleUrl: './direct-sale-assets.component.css',
})


export class DirectSaleAssetsComponent implements OnInit , AfterViewInit {

    @ViewChild('liveToast') liveToast!: ElementRef;
   toastInstance: any;
  
  toOrders() {
  this.router.navigate(['/orders']);
  }
  
   assets: DirectSaleAssetDto[] = [];
  originalAssets: DirectSaleAssetDto[] = [];
  layoutType: 'grid' | 'row' = 'grid';
  userId: number = 1;
  environment = environment;
  wishlistAssetIds: number[] = [];  

  cartAssetIds: number[] = [];




  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private listService: ListService,
    private router: Router,
  ) {}
  
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
    const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
    if (!isNaN(categoryId)) {
      this.assetService.getDirectAssets(categoryId).subscribe({
        next: (data) => {
          this.assets = data;
          this.originalAssets = [...data];
          console.log('Assets:', this.assets);
          this.loadWishlist();
          this.loadCartItems();

        },

        error: (err) => {
          console.log({ err });
          console.error('Error fetching assets:', err);
          Swal.fire('Error!', err.error.message);
        },
      });
    } else {
      // console.error('Invalid category ID');
      Swal.fire('Error!', 'Invalid category ID');
    }
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

loadCartItems(): void {
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
    if (this.isInWishlist(assetId)) {
      const payload = { userId: this.userId, assetId: assetId };
      this.listService.removeFromWishlist(payload).subscribe({
        next: () => {
          this.wishlistAssetIds = this.wishlistAssetIds.filter(id => id !== assetId);
          this.showToast(`Removed from wishlist.`, 'Removed!', 'info');
        },
        error: (err) => {
          this.showToast(err.error.message || 'Error removing from wishlist.', 'Error!', 'error');
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
          this.showToast(err.error.message || 'Error adding to wishlist.', 'Error!', 'error');
        },
      });
    }
  }

toCart(){
  this.router.navigate(['/bid-add-to-cart']);
}

toWatchlist(){
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
    return this.assets.filter(asset =>
      asset.title?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }



  goToAssetDetail(assetId: number) {
  this.router.navigate(['/direct-sale-assetpage/', assetId]);
}

  addToCart(assetId: number): void {
    const payload = {
      userId: this.userId,
      assetId: assetId,
      quantity: 1,
    };
  
    this.listService.addToCart(payload).subscribe({
      next: () => {
        this.showToast('This asset has been added to your cart.', 'Success!', 'success');
        // this.listService.refreshComponent();
        this.cartAssetIds.push(assetId);
      },
      error: (err) => {
        this.showToast(err.error.message || 'Something went wrong while adding to cart.', 'Error!', 'error');
      },
    });
  }

    goBack() {
    window.history.back();
  }
}


