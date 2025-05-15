import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { CommonModule } from '@angular/common';

import { ManageAssetService } from '../../services/asset.service';
import { Asset, Gallery } from '../../modals/manage-asset';

@Component({
  selector: 'app-direct-sale-assetpage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-sale-assetpage.component.html',
  styleUrls: ['./direct-sale-assetpage.component.scss']
})
export class DirectSaleComponent implements OnInit {
  assetId: number | null = null;
  asset: Asset | null = null;
  isLoading = true;
  // viewCount = 0;
  price = 0;
  currency = 'BHD';
  plateNumber = '';
  
  // Slider and tab functionality variables
  currentSlideIndex: number = 0;
  activeTab: string = 'details';

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

    // Get asset details
    this.assetService.getAssetById(this.assetId).pipe(
      catchError(err => {
        console.error(`Error fetching asset ${this.assetId}:`, err);
        return of(null);
      })
    ).subscribe({
      next: (asset) => {
        if (asset) {
          this.asset = asset;
          this.plateNumber = asset.assetNumber || '';
          this.price = asset.startingPrice ?? 0;
          // this.viewCount = Math.floor(Math.random() * 100); // Simulated view count
          
          // If galleries aren't populated yet, get them
          if (!this.asset.galleries || this.asset.galleries.length === 0) {
            this.loadGallery();
          } else {
            this.isLoading = false;
          }
        } else {
          console.warn('No asset data returned');
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading asset:', err);
        this.isLoading = false;
      }
    });
  }

  private loadGallery(): void {
    if (!this.assetId) return;
    
    this.assetService.getAssetGallery(this.assetId).pipe(
      catchError(err => {
        console.error(`Error fetching gallery for asset ${this.assetId}:`, err);
        return of([]);
      })
    ).subscribe({
      next: (gallery) => {
        let items: Gallery[] = [];
        if (gallery) {
          items = Array.isArray(gallery) ? gallery : [gallery];
        }
        
        // Ensure fileUrl exists on each gallery item
        items = items.map(item => {
          if (!item.fileUrl && item.imageUrl) {
            item.fileUrl = item.imageUrl;
          }
          return item;
        });
        
        // If asset exists, attach the gallery to it
        if (this.asset) {
          this.asset.galleries = items;
        }
        
        this.isLoading = false;
        console.log('Gallery loaded:', items.length);
      },
      error: (err) => {
        console.error('Error loading gallery:', err);
        this.isLoading = false;
      }
    });
  }

  // Image slider functionality
  nextSlide(): void {
    if (this.asset && this.asset.galleries && this.asset.galleries.length > 0) {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.asset.galleries.length;
    }
  }

  prevSlide(): void {
    if (this.asset && this.asset.galleries && this.asset.galleries.length > 0) {
      this.currentSlideIndex = (this.currentSlideIndex - 1 + this.asset.galleries.length) % this.asset.galleries.length;
    }
  }

  setCurrentSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  hasMultipleImages(): boolean {
    return !!this.asset && !!this.asset.galleries && this.asset.galleries.length > 1;
  }

  hasImages(): boolean {
    return !!this.asset && !!this.asset.galleries && this.asset.galleries.length > 0;
  }

  // Tab functionality
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Fallback if image loading fails
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
    // alert(`Added plate ${this.plateNumber} to cart!`);
    // console.log('Adding to cart...', this.assetId);
    // Implement cart functionality here
  }

  goBack(): void {
    window.history.back();
  }
}