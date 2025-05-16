import { Component } from '@angular/core';
import { Asset } from '../../modals/manage-asset';
import { ManageAssetService } from '../../services/asset.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bid-watchlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bid-watchlist.component.html',
  styleUrl: './bid-watchlist.component.css'
})
export class BidWatchlistComponent {

  watchlistAssets: Asset[] = []; 

constructor(private assetService: ManageAssetService , private router:Router) {}

ngOnInit() {
    this.assetService.getAssets().subscribe((data) => {
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

  
}
