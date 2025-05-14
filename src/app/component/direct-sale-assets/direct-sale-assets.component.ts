import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ManageAssetService } from '../../services/asset.service';
import { DirectSaleAssetDto,AssetGalleryDto } from '../../modals/manage-asset';

@Component({
  selector: 'app-direct-sale-assets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-sale-assets.component.html',
  styleUrl: './direct-sale-assets.component.css'
})
export class DirectSaleAssetsComponent implements OnInit {
  assets: DirectSaleAssetDto[] = [];
  layoutType: 'grid' | 'row' = 'grid';

  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService
  ) {}

  ngOnInit(): void {
    const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
    if (!isNaN(categoryId)) {
      this.assetService.getDirectAssets(categoryId).subscribe({
        next: (data) => this.assets = data,
        error: (err) => console.error('Error fetching assets:', err)
      });
    } else {
      console.error('Invalid category ID');
    }
  }

  toggleLayout() {
    this.layoutType = this.layoutType === 'grid' ? 'row' : 'grid';
  }

  getFlagUrl(asset: DirectSaleAssetDto): string {
    return asset.galleries?.[0]?.fileUrl || 'assets/flags/bahrain.png';
  }
}
