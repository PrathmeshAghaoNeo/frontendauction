import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';

import { ManageAssetService } from '../../services/asset.service';
import { Asset, Gallery } from '../../modals/manage-asset';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-direct-sale-assetpage',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './direct-sale-assetpage.component.html',
  styleUrls: ['./direct-sale-assetpage.component.scss']
})
export class DirectSaleComponent implements OnInit {
  assetId: number | null = null;
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
    this.route.paramMap.subscribe((params: ParamMap) => {
      // try both keys in case your route is /:id or /:assetId
      const idStr = params.get('id') ?? params.get('assetId');
      const idNum = idStr !== null ? Number(idStr) : NaN;

      if (!isNaN(idNum)) {
        this.assetId = idNum;
        console.log('Asset ID from route:', this.assetId);
        this.loadData();
      } else {
        console.error('Invalid asset ID in route params:', idStr);
        this.isLoading = false;
      }
    });
  }

  public loadData(): void {
    if (this.assetId === null || isNaN(this.assetId)) {
      console.error('Attempted to load data with invalid assetId:', this.assetId);
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    console.log('Fetching data for asset ID:', this.assetId);

    forkJoin({
      asset: this.assetService.getAssetById(this.assetId).pipe(
        catchError(err => {
          console.error(`Error fetching asset ${this.assetId}:`, err);
          return of(null);
        })
      ),
      gallery: this.assetService.getAssetGallery(this.assetId).pipe(
        catchError(err => {
          console.error(`Error fetching gallery for asset ${this.assetId}:`, err);
          return of([]);
        })
      )
    }).subscribe({
      next: ({ asset, gallery }) => {
        // — Asset —
        if (asset) {
          this.asset        = asset;
          this.plateNumber  = asset.assetNumber || '';
          this.price        = asset.startingPrice ?? 0;
          // description is bound via `asset?.description` in your template
        } else {
          console.warn('No asset data returned');
        }

        // — Gallery —
        let items: Gallery[] = [];
        if (gallery) {
          items = Array.isArray(gallery) ? gallery : [gallery];
        }
        // ensure fileUrl
        this.gallery = items.map(item => {
          if (!item.fileUrl && item.imageUrl) {
            item.fileUrl = item.imageUrl;
          }
          return item;
        });
        console.log('Gallery loaded:', this.gallery.length);

        this.isLoading = false;
      },
      error: err => {
        console.error('Error in forkJoin:', err);
        this.isLoading = false;
      }
    });
  }
//  private loadData(): void {
//   this.isLoading = true;
  
  // Get asset details first
  // this.assetService.getAssetById(this.assetId).subscribe({
  //   next: (assetData) => {
  //     this.asset = assetData;
  //     this.plateNumber = assetData.assetNumber || '';
  //     this.price = assetData.startingPrice ?? 0;
      
  //     // Then get gallery images
  //     this.assetService.getAssetGallery(this.assetId).subscribe({
  //       next: (galleryData) => {
  //         // Handle both array and single object responses
  //         if (Array.isArray(galleryData)) {
  //           this.gallery = galleryData;
  //         } else if (galleryData && typeof galleryData === 'object') {
  //           this.gallery = [galleryData as Gallery];
  //         }
          
  //         // Process each gallery item to ensure proper image URL
  //         this.gallery = this.gallery.map(item => {
  //           if (item.fileUrl) {
  //             item.fileUrl = item.fileUrl;
  //           } else if (item.filePath) {
  //             item.fileUrl = item.filePath;
  //           }
  //           return item;
  //         });
          
  //         this.isLoading = false;
  //       },
  //       error: (err) => { /* Error handling */ }
  //     });
  //   },
  //   error: (err) => { /* Error handling */ }
  // });
// }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    
    // Find the parent and add a fallback text element if it doesn't exist
    const parentDiv = imgElement.closest('.plate-number');
    if (parentDiv) {
      let fallbackElement = parentDiv.querySelector('.plate-text') as HTMLElement;
      
      if (!fallbackElement) {
        fallbackElement = document.createElement('span');
        fallbackElement.className = 'plate-text';
        fallbackElement.textContent = this.plateNumber;
        parentDiv.appendChild(fallbackElement);
      } else {
        fallbackElement.style.display = 'block';
      }
    }
  }

  addToCart(): void {
    if (!this.assetId) {
      console.error('Cannot add to cart: Invalid asset ID');
      return;
    }
    console.log('Adding to cart...', this.assetId);
    // Implement cart functionality here
  }

  goBack(): void {
    window.history.back();
  }

  viewMoreDescription(): void {
    console.log('Viewing more description...');
    // Implement expanded description view
  }
}