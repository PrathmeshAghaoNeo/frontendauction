import { Component } from '@angular/core';
import { Asset } from '../../modals/manage-asset';
import { CommonModule } from '@angular/common';
import { ManageAssetService } from '../../services/asset.service';

@Component({
  selector: 'app-bid-add-to-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bid-add-to-cart.component.html',
  styleUrl: './bid-add-to-cart.component.css',
})
export class BidAddToCartComponent {
cartAssets: Asset[] = [];

  constructor(private assetService: ManageAssetService) {}

  ngOnInit() {
    this.assetService.getAssets().subscribe((data) => {
      this.cartAssets = data;
      console.log('Cart Assets:', this.cartAssets);
    });
  }

  getSubtotal(): number {
    return this.cartAssets.reduce((sum, asset) => sum + asset.startingPrice, 0);
  }

  removeFromCart(index: number): void {
    this.cartAssets.splice(index, 1);
  }
}
