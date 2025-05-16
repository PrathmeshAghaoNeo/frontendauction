import { Component } from '@angular/core';
import { Asset, DirectSaleAssetDto } from '../../modals/manage-asset';
import { CommonModule } from '@angular/common';
import { ManageAssetService } from '../../services/asset.service';
import { ListService } from '../../services/list.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bid-add-to-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bid-add-to-cart.component.html',
  styleUrl: './bid-add-to-cart.component.css',
})
export class BidAddToCartComponent {
cartAssets: DirectSaleAssetDto[] = [];
  userId: number = 1;

  constructor(private assetService: ManageAssetService , private listservice:ListService, private router:Router) {}

  ngOnInit() {
    this.listservice.getCart(this.userId).subscribe((data) => {
      this.cartAssets = data;
      console.log('Cart Assets:', this.cartAssets);
    });
  }

  getSubtotal(): number {
    return this.cartAssets.reduce((sum, asset) => sum + asset.price, 0);
  }

 removeFromCart(asset: DirectSaleAssetDto): void {
  const payload = {
    userId: this.userId,
    assetId: asset.assetId,}
    console.log("before remove",this.cartAssets);
    
  this.listservice.removeFromCart(payload).subscribe({
    next: () => {
      console.log("after remove",this.cartAssets);
      this.cartAssets = this.cartAssets.filter(a => a.assetId !== asset.assetId);
    },
    error: (err) => {
      console.error('Error removing asset from cart:', err);
    }
  });
}



  goBack() {
  window.history.back(); 
}



}
