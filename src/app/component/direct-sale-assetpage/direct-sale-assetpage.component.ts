import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';

import { ManageAssetService } from '../../services/asset.service';
import { Asset, Gallery } from '../../modals/manage-asset';
import { ListService } from '../../services/list.service';
import Swal from 'sweetalert2';

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
  price = 0;
  currency = 'BHD';
   userId: number = 1;
  plateNumber = '';
  
  // Slider and tab functionality variables
  currentSlideIndex: number = 0;
  activeTab: string = 'details';

  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private listService: ListService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      // Try both keys in case your route is /:id or /:assetId
      const idStr = params.get('id') ?? params.get('assetId');
      const idNum = idStr !== null ? Number(idStr) : NaN;

      if (!isNaN(idNum)) {
        this.assetId = idNum;
        console.log('Asset ID from route:', this.assetId);
        this.loadAssetDetails();
      } else {
        console.error('Invalid asset ID in route params:', idStr);
        this.isLoading = false;
      }
    });
  }

  loadAssetDetails(): void {
    if (this.assetId === null || isNaN(this.assetId)) {
      console.error('Attempted to load data with invalid assetId:', this.assetId);
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    console.log('Fetching data for asset ID:', this.assetId);

    // Get asset details
    this.assetService.getAssetById(this.assetId).subscribe({
      next: (asset) => {
        if (asset) {
          this.asset = asset;
          this.plateNumber = asset.assetNumber || '';
          this.price = asset.startingPrice ?? 0;
          
          // If galleries aren't populated yet, get them
          if (!this.asset.galleries || this.asset.galleries.length === 0) {
            this.loadGallery();
          } else {
            this.isLoading = false;
          }
          console.log('Asset loaded:', this.asset);
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

  loadGallery(): void {
    if (!this.assetId) return;
    
    this.assetService.getAssetGallery(this.assetId).subscribe({
      next: (gallery) => {
        let galleryItems: Gallery[] = [];
        if (gallery) {
          galleryItems = Array.isArray(gallery) ? gallery : [gallery];
        }
        
        // Ensure fileUrl exists on each gallery item
        galleryItems = galleryItems.map(item => {
          if (!item.fileUrl && item.imageUrl) {
            item.fileUrl = item.imageUrl;
          }
          return item;
        });
        
        // If asset exists, attach the gallery to it
        // if (this.asset) {
        //   this.asset.galleries = galleryItems;
        // }
        
        this.isLoading = false;
        console.log('Gallery loaded:', galleryItems.length);
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

  // Handle image errors
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

  addToCart(assetId: number): void {
    console.log("Adding to cart:", assetId);
    
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

  goBack(): void {
    window.history.back();
  }
}