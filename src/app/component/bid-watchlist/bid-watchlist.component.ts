import { Component } from '@angular/core';
import { Asset, DirectSaleAssetDto } from '../../modals/manage-asset';
import { ManageAssetService } from '../../services/asset.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ListService } from '../../services/list.service';
import { environment } from '../../constants/enviroments';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-bid-watchlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bid-watchlist.component.html',
  styleUrl: './bid-watchlist.component.css'
})
export class BidWatchlistComponent {
  watchlistAssets: DirectSaleAssetDto[] = []; 
  userId: number = 1;
  apiUrl = environment.baseurl;

constructor(private assetService: ManageAssetService , private listService :ListService , private router:Router) {}

ngOnInit() {
    this.listService.getWishlist(this.userId).subscribe((data) => {
      this.watchlistAssets = data;
      console.log('Watchlist:', this.watchlistAssets);
    });
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

    console.log(assetId);

    this.listService.addToCart(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Added to Cart',
          text: 'This asset has been added to your cart.',
          confirmButtonText: 'OK',
        }).then(() => {
          this.listService.refreshComponent(); // Trigger component refresh
        });
      },
      error: (err) => {
        console.log({err});
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text:
            err.error.message || 'Something went wrong while adding to cart.',
          confirmButtonText: 'OK',
        });
      },
    });
  }
  
removeFromWatchlist(asset: any): void {
  console.log('Removing from watchlist:', asset);

  const payload = {
    userId: this.userId,
    assetId: asset.assetId
  };

  this.listService.removeFromWishlist(payload).subscribe({
    next: () => {
      console.log('Successfully removed from watchlist');
      this.watchlistAssets = this.watchlistAssets.filter(
        (item) => item.assetId !== asset.assetId
      );
    },
    error: (err) => {
      console.error('Failed to remove from watchlist', err);
    }
  });
}




}
