import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ManageAssetService } from '../../services/asset.service';
import { DirectSaleAssetDto } from '../../modals/manage-asset';
import { ListService } from '../../services/list.service';
import Swal from 'sweetalert2';
import { environment } from '../../constants/enviroments';
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
          this.originalAssets = [...data]; // Keep a copy for filtering/sortin
          console.log('Assets:', this.assets);
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

  toggleLayout() {
    this.layoutType = this.layoutType === 'grid' ? 'row' : 'grid';
  }

  getFlagUrl(asset: DirectSaleAssetDto): string {
    return asset.galleries?.[0]?.fileUrl || 'assets/flags/bahrain.png';
  }

  addToWishlist(assetId: number): void {
    const payload = {
      userId: this.userId,
      assetId: assetId,
      quantity: 1,
    };

    console.log(assetId);

    this.listService.addToWishlist(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Added to Wishlist',
          text: 'This asset has been added to your wishlist.',
          confirmButtonText: 'OK',
        });
      },
      error: (err) => {
        console.log({ err });
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text:
            err.error.message ||
            'Something went wrong while adding to wishlist.',
          confirmButtonText: 'OK',
        });
      },
    });
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
