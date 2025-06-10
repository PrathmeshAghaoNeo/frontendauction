import { Component, OnInit } from '@angular/core';
import { Asset, Gallery } from '../../modals/manage-asset';
import { ListService } from '../../services/list.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ManageAssetService } from '../../services/asset.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // <-- Import AuthService
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-get-order-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './get-order-details.component.html',
  styleUrl: './get-order-details.component.css',
})
export class GetOrderDetailsComponent implements OnInit {
  assetId: number | null = null;
  asset: Asset | null = null;
  isLoading = true;
  price = 0;
  currency = 'BHD';
  userId: number |null= null; // <-- Initially 0
  plateNumber = '';
  langCode: string |null = "en";


  currentSlideIndex: number = 0;
  activeTab: string = 'details';

  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private listService: ListService,
    private router: Router,
    private languageService:LanguageService,
    private authService: AuthService // <-- Injected AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdJwt(); // <-- Retrieve userId from token
    if (!this.userId) {
      console.error('User is not authenticated.');
      this.isLoading = false;
      return;
    }

    this.route.paramMap.subscribe((params: ParamMap) => {
      const idStr = params.get('id') ?? params.get('assetId');
      const idNum = idStr !== null ? Number(idStr) : NaN;

      if (!isNaN(idNum)) {
        this.assetId = idNum;
        console.log('Asset ID from route:', this.assetId);
         this.languageService.lang$.subscribe(lang => {
    this.langCode = lang;
    this.loadAssetDetails();
  });
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

    this.assetService.getAssetById(this.assetId,this.langCode).subscribe({
      next: (asset) => {
        if (asset) {
          this.asset = asset;
          this.plateNumber = asset.assetNumber || '';
          this.price = asset.startingPrice ?? 0;

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
      },
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

        galleryItems = galleryItems.map((item) => {
          if (!item.fileUrl && item.imageUrl) {
            item.fileUrl = item.imageUrl;
          }
          return item;
        });

        // Uncomment if you want to attach gallery to asset
        // if (this.asset) {
        //   this.asset.galleries = galleryItems;
        // }

        this.isLoading = false;
        console.log('Gallery loaded:', galleryItems.length);
      },
      error: (err) => {
        console.error('Error loading gallery:', err);
        this.isLoading = false;
      },
    });
  }

  nextSlide(): void {
    if (this.asset?.galleries?.length) {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.asset.galleries.length;
    }
  }

  prevSlide(): void {
    if (this.asset?.galleries?.length) {
      this.currentSlideIndex = (this.currentSlideIndex - 1 + this.asset.galleries.length) % this.asset.galleries.length;
    }
  }

  setCurrentSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  hasMultipleImages(): boolean {
    return !!this.asset?.galleries && this.asset.galleries.length > 1;
  }

  hasImages(): boolean {
    return !!this.asset?.galleries && this.asset.galleries.length > 0;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';

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

  goBack(): void {
    window.history.back();
  }
}
