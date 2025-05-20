import { Component , ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Asset, DirectSaleAssetDto } from '../../modals/manage-asset';
import { ManageAssetService } from '../../services/asset.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ListService } from '../../services/list.service';
import { environment } from '../../constants/enviroments';
import Swal from 'sweetalert2';

declare var bootstrap: any; 

@Component({
  selector: 'app-bid-watchlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bid-watchlist.component.html',
  styleUrl: './bid-watchlist.component.css'
})
export class BidWatchlistComponent implements AfterViewInit {
    @ViewChild('liveToast') liveToast!: ElementRef;
   toastInstance: any;
   
  

  watchlistAssets: DirectSaleAssetDto[] = []; 
  userId: number = 1;
  apiUrl = environment.baseurl;

  cartAssetIds: number[] = [];

constructor(private assetService: ManageAssetService , private listService :ListService , private router:Router) {}




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



ngOnInit() {
    this.listService.getWishlist(this.userId).subscribe((data) => {
      this.watchlistAssets = data;
      console.log('Watchlist:', this.watchlistAssets);
       this.loadCartItems();
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

isInCart(assetId: number): boolean {
  return this.cartAssetIds.includes(assetId);
} 

  goBack() {
  window.history.back(); 
}

goToCart() {
  this.router.navigate(['/bid-add-to-cart']); 
}



addToCart(assetId: number): void {
  const payload = {
    userId: this.userId,
    assetId: assetId,
    quantity: 1,
  };

  this.listService.addToCart(payload).subscribe({
    next: () => {
      this.cartAssetIds.push(assetId);
      this.showToast('Asset has been added to your cart.', 'Added to Cart', 'success');
    },
    error: (err) => {
      console.log({ err });
      const message = err.error.message || 'Something went wrong while adding to cart.';
      this.showToast(message, 'Error', 'error');
    },
  });
}

  removeFromWatchlist(asset: any): void {
  const payload = {
    userId: this.userId,
    assetId: asset.assetId
  };

  this.listService.removeFromWishlist(payload).subscribe({
    next: () => {
      this.watchlistAssets = this.watchlistAssets.filter(
        (item) => item.assetId !== asset.assetId
      );
      this.showToast('Asset removed from your watchlist.', 'Watchlist Updated', 'info');
    },
    error: (err) => {
      console.error('Failed to remove from watchlist', err);
      this.showToast('Failed to remove asset from watchlist.', 'Error', 'error');
    }
  });
}




}
