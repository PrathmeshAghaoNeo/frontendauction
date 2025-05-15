import { Component, OnInit } from '@angular/core';
import { Asset, DirectSaleAssetDto } from '../../modals/manage-asset';
import { HttpClient } from '@angular/common/http';
import { ManageAssetService } from '../../services/asset.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ListService } from '../../services/list.service';
import Swal from 'sweetalert2';
import { environment } from '../../constants/enviroments';

@Component({
  selector: 'app-direct-bid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-assets.component.html',
  styleUrl: './auction-assets.component.css'
})
export class AuctionAssetsComponent implements OnInit {

  assets: DirectSaleAssetDto[] = [];
  originalAssets: DirectSaleAssetDto[] = [];
  layoutType: 'grid' | 'row' = 'grid';
  noAssetsFound: boolean = false;
  // TODO: Replace with actual user ID from auth context
  userId: number = 70;
  environment=environment;

  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private http: HttpClient,
    private listService:ListService
  ) {}

  ngOnInit(): void {
    const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
    if (!isNaN(categoryId)) {
      this.assetService.getDirectAssets(categoryId).subscribe({
        next: (data) => {
          this.assets = data;
          this.originalAssets = [...data]; // Keep a copy for filtering/sorting
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
}
