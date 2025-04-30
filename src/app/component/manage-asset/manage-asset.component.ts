import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ManageAssetService } from '../../services/asset.service';
import { Asset } from '../../modals/manage-asset';
 
@Component({
  selector: 'app-manage-asset',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './manage-asset.component.html',
  styleUrls: ['./manage-asset.component.css']
})
export class ManageAssetComponent implements OnInit {
 
 
  assets: Asset[] = [];
  originalAssets: Asset[] = [];
  searchText: string = '';
  selectedAsset: Asset | null = null;
 
  constructor(private assetService: ManageAssetService) {}
 
  ngOnInit(): void {
    this.loadAssets();
  }
 
  loadAssets(): void {
    this.assetService.getAssets().subscribe((data) => {
      this.assets = data;
      this.originalAssets = [...data];  // Keep a copy of the original assets
    });
  }
 
  // Handle search input changes
  onSearchChange(): void {
    console.log('Searching for:', this.searchText);
   
    // If search text is empty, reset assets to original list
    if (!this.searchText.trim()) {
      this.assets = [...this.originalAssets];
      return;
    }
   
    // Otherwise, filter assets locally based on title
    this.assets = this.originalAssets.filter(asset =>
      asset.title.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
 
  // Get auction status name based on status ID
  getAuctionStatus(statusId: number): string {
    switch (statusId) {
      case 1: return 'Drafted';
      case 2: return 'Published';
      case 3: return 'Ongoing';
      case 4: return 'Closed';
      case 5: return 'Archived';
      default: return 'Unknown';
    }
  }
 
  // View asset details
    viewAsset(assetId: number): void {
    this.assetService.getAssetById(assetId).subscribe(
      (data) => {
        this.selectedAsset = data;
        console.log('Selected Asset:', this.selectedAsset);  // Debugging log to see fetched data
      },
      (error) => {
        console.error('Error fetching asset details:', error);
      }
    );
  }
 
 
 
  deleteAsset(asset: Asset): void {
    console.log('Deleting asset', asset);
    this.assetService.deleteAsset(asset.assetId).subscribe(() => {
      // Reload assets after delete
      this.loadAssets();
    });
  }
 
  // Edit asset (this is just logging for now)
  editAsset(asset: Asset): void {
    console.log('Editing asset', asset);
  }
  }
 