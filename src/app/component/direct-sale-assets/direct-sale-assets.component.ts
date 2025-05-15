import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ManageAssetService } from '../../services/asset.service';
import { ListService } from '../../services/list.service';
import Swal from 'sweetalert2';
import { environment } from '../../constants/enviroments';
import { DirectSaleAssetDto } from '../../modals/add-asset';
@Component({
  selector: 'app-direct-sale-assets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-sale-assets.component.html',
  styleUrl: './direct-sale-assets.component.css',
})
export class DirectSaleAssetsComponent implements OnInit {
  assets: DirectSaleAssetDto[] = [];
  originalAssets: DirectSaleAssetDto[] = [];
  layoutType: 'grid' | 'row' = 'grid';
  userId: number = 1;
  environment = environment;
  wishlistAssetIds: number[] = [];  





  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private listService: ListService
  ) {}

  ngOnInit(): void {
    const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
    if (!isNaN(categoryId)) {
      this.assetService.getDirectAssets(categoryId).subscribe({
        next: (data) => {
          this.assets = data;
          this.originalAssets = [...data];
          console.log('Assets:', this.assets);
          this.loadWishlist();
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


isInWishlist(assetId: number): boolean {
  return this.wishlistAssetIds.includes(assetId);
}
  


toggleWishlist(assetId: number): void {

  
  if (this.isInWishlist(assetId)) {
    
    const payload = { userId: this.userId, assetId: assetId };
    this.listService.removeFromWishlist(payload).subscribe({
      next: () => {
        console.log('Toggle Wishlist: in this togglelist', assetId);
        this.wishlistAssetIds = this.wishlistAssetIds.filter(id => id !== assetId);
        Swal.fire('Removed', 'Removed from wishlist', 'success');
      },
      error: (err) => {
        Swal.fire('Error', err.error.message || 'Error removing from wishlist', 'error');
      },
    });
  } else {
    const payload = { userId: this.userId, assetId: assetId, quantity: 1 };
    this.listService.addToWishlist(payload).subscribe({
      next: () => {
        this.wishlistAssetIds.push(assetId);
        Swal.fire('Added', 'Added to wishlist', 'success');
      },
      error: (err) => {
        Swal.fire('Error', err.error.message || 'Error adding to wishlist', 'error');
      },
    });
  }
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
}
