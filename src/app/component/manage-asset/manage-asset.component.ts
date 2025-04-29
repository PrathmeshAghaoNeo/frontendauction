import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ManageassetService } from '../../services/asset.service';
import { Asset } from '../../modals/manage-asset';

@Component({
  selector: 'app-manage-asset',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './manage-asset.component.html',
  styleUrls: ['./manage-asset.component.css']
})
export class ManageAssetComponent implements OnInit {

  assets: Asset[] = [];
  originalAssets: Asset[] = [];
  searchText: string = '';
  selectedAsset: Asset | null = null;

  constructor(private assetService: ManageassetService) {}

  ngOnInit(): void {
    this.loadAssets();
  }

  // Load all assets
  loadAssets(): void {
    this.assetService.getAssets().subscribe({
      next: (data: Asset[]) => {
        this.assets = data || [];
        this.originalAssets = [...this.assets];
      },
      error: (err) => {
        console.error('Error loading assets:', err);
      }
    });
  }

  // Filter assets by search input
  onSearchChange(): void {
    const keyword = this.searchText.trim().toLowerCase();

    if (!keyword) {
      this.assets = [...this.originalAssets];
      return;
    }

    this.assets = this.originalAssets.filter(asset =>
      asset.title.toLowerCase().includes(keyword) ||
      asset.assetId.toString().includes(keyword)
    );
  }

  // Return auction status string from statusId
  getAuctionStatus(statusId: number): string {
    const statusMap: Record<number, string> = {
      1: 'Drafted',
      2: 'Published',
      3: 'Ongoing',
      4: 'Closed',
      5: 'Archived'
    };
    return statusMap[statusId] || 'Unknown';
  }

  // Fetch and display asset details
  viewAsset(assetId: number): void {
    this.assetService.getAssetById(assetId).subscribe({
      next: (data: Asset) => {
        this.selectedAsset = data;
        console.log('Selected Asset:', this.selectedAsset);
      },
      error: (err) => {
        console.error('Error fetching asset details:', err);
      }
    });
  }

  // Delete asset and refresh list
  deleteAsset(asset: Asset): void {
    if (!asset.assetId) return;

    this.assetService.deleteAsset(asset.assetId).subscribe({
      next: () => this.loadAssets(),
      error: (err) => console.error('Error deleting asset:', err)
    });
  }

  // Stub for editing asset
  editAsset(asset: Asset): void {
    console.log('Editing asset', asset);
    // Implement edit logic here (e.g., navigate to edit page or open modal)
  }
}
