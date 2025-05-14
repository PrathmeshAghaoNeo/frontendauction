import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ManageAssetService } from '../../services/asset.service';
import { Asset, Gallery } from '../../modals/manage-asset';
import { CommonModule } from '@angular/common';
// import { DirectSaleComponent } from './direct-sale-assetpage.component';


@Component({
  selector: 'app-direct-sale-assetpage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-sale-assetpage.component.html',
  styleUrls: ['./direct-sale-assetpage.component.scss']
})
export class DirectSaleComponent implements OnInit {
  assetId = 0;
  asset: Asset | null = null;
  gallery: Gallery[] = [];
  isLoading = true;
  viewCount = 0;
  price = 0;
  currency = 'BHD';
  plateNumber = '';

  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.assetId = +params['id'];
      this.loadData();
    });
  }

 private loadData(): void {
  this.isLoading = true;
  
  // Get asset details first
  this.assetService.getAssetById(this.assetId).subscribe({
    next: (assetData) => {
      this.asset = assetData;
      this.plateNumber = assetData.assetNumber || '';
      this.price = assetData.startingPrice ?? 0;
      
      // Then get gallery images
      this.assetService.getAssetGallery(this.assetId).subscribe({
        next: (galleryData) => {
          // Handle both array and single object responses
          if (Array.isArray(galleryData)) {
            this.gallery = galleryData;
          } else if (galleryData && typeof galleryData === 'object') {
            this.gallery = [galleryData as Gallery];
          }
          
          // Process each gallery item to ensure proper image URL
          this.gallery = this.gallery.map(item => {
            if (item.fileUrl) {
              item.fileUrl = item.fileUrl;
            } else if (item.filePath) {
              item.fileUrl = item.filePath;
            }
            return item;
          });
          
          this.isLoading = false;
        },
        error: (err) => { /* Error handling */ }
      });
    },
    error: (err) => { /* Error handling */ }
  });
}

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    
    const parentDiv = imgElement.closest('.plate-number');
    if (parentDiv) {
      const fallbackElement = parentDiv.querySelector('.plate-text') as HTMLElement;
      if (fallbackElement) {
        fallbackElement.style.display = 'block';
      }
    }
  }

  addToCart(): void {
    console.log('Adding to cart...', this.assetId);
  }

  goBack(): void {
    window.history.back();
  }

  viewMoreDescription(): void {
    console.log('Viewing more description...');
  }
}