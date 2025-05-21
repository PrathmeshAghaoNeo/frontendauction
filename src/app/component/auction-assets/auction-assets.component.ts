import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Asset, } from '../../modals/manage-asset';
import { HttpClient } from '@angular/common/http';
import { ManageAssetService } from '../../services/asset.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ListService } from '../../services/list.service';
import Swal from 'sweetalert2';
import { environment } from '../../constants/enviroments';
import { DirectSaleAssetDto } from '../../modals/add-asset';



declare var bootstrap: any; 

@Component({
  selector: 'app-direct-bid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-assets.component.html',
  styleUrl: './auction-assets.component.css'
})
export class AuctionAssetsComponent implements OnInit , AfterViewInit {

 @ViewChild('liveToast') liveToast!: ElementRef;
   toastInstance: any;
  
  assets: DirectSaleAssetDto[] = [];
  originalAssets: DirectSaleAssetDto[] = [];
  layoutType: 'grid' | 'row' = 'grid';
  noAssetsFound: boolean = false;
  // TODO: Replace with actual user ID from auth context
  userId: number = 70;
  environment=environment;
   wishlistAssetIds: number[] = [];  

  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private http: HttpClient,
    private listService:ListService , 
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
    console.log('in categorymethod', categoryId);
    if (!isNaN(categoryId)) {
          console.log('inside categorymethod', categoryId);

      this.listService.getAuctionAssetsByCategory(categoryId).subscribe({
        next: (data) => {
          this.assets = data;
          this.originalAssets = [...data]; 
          this.noAssetsFound = this.assets.length === 0;
          console.log('Assets:', this.assets);
        },
        error: (err) => console.error('Error fetching assets:', err)
      });
    } else {
      console.error('Invalid category ID');
    }
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
  // toggleWishlist(assetId: number): void {
  //   if (this.isInWishlist(assetId)) {
  //     const payload = { userId: this.userId, assetId: assetId };
  //     this.listService.removeFromWishlist(payload).subscribe({
  //       next: () => {
  //         this.wishlistAssetIds = this.wishlistAssetIds.filter(id => id !== assetId);
  //         this.showToast(`Removed from wishlist.`, 'Removed!', 'info');
  //       },
  //       error: (err) => {
  //         this.showToast(err.error.message || 'Error removing from wishlist.', 'Error!', 'error');
  //       },
  //     });
  //   } else {
  //     const payload = { userId: this.userId, assetId: assetId, quantity: 1 };
  //     this.listService.addToWishlist(payload).subscribe({
  //       next: () => {
  //         this.wishlistAssetIds.push(assetId);
  //         this.showToast('Added to wishlist.', 'Added!', 'success');
  //       },
  //       error: (err) => {
  //         this.showToast(err.error.message || 'Error adding to wishlist.', 'Error!', 'error');
  //       },
  //     });
  //   }
  // }


  navigateToAsset(assetId: number | undefined): void {
  if (assetId) {
    this.router.navigate(['/asset-details', assetId]);
  }
}

  goBack() {
    window.history.back();
  }
}


