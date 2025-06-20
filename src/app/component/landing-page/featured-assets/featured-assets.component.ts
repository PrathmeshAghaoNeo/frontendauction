import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@microsoft/signalr';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { Asset } from '../../../modals/manage-asset';
import { FeaturedAssetsService } from '../../../services/featured-assets.service';
import { environment } from '../../../constants/enviroments';
import { Router } from '@angular/router';

@Component({
  selector: 'app-featured-assets',
  standalone: true,
  imports: [CommonModule, NgbCarouselModule],
  templateUrl: './featured-assets.component.html',
  styleUrls: ['./featured-assets.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class FeaturedAssetsComponent implements OnInit {
  featuredAssets: Asset[] = [];
  selectedAsset: Asset | null = null;

  @ViewChild('assetModal', { static: true }) assetModalTemplate: any;

  constructor(
    private featuredAssetsService: FeaturedAssetsService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.featuredAssetsService.getFeaturedAssets().subscribe({
      next: (data) => this.featuredAssets = data,
      error: (err) => console.error('Error loading assets:', err)
    });
  }

  
 getImageUrl(path: string | undefined | null): string {
  if (!path) return 'assets/default-image.jpg'; // fallback
  const filePaths = path.split(','); // supports multiple files
  return `${environment.imgUrl}${filePaths[0].trim()}`;
}
//   (assetId: number | undefined | null, modal: any): void {
//   if (assetId) {
//     modal.close();
//     this.router.navigate(['/asset-details', assetId]);
//   }
// }
navigateToDetail(assetId: number | undefined , modal: any): void {
    if (assetId) {
      modal.close();
      const encodedUserId = btoa(assetId.toString());
      this.router.navigate(['/asset-details'], { queryParams: { id: encodedUserId } });
    }
  }


  openAssetModal(asset: Asset) {
    this.selectedAsset = asset;
    this.modalService.open(this.assetModalTemplate, { size: 'lg' });
  }
}