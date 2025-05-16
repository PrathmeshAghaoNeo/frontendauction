import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ManageAssetService } from '../../services/asset.service';
import { Asset } from '../../modals/manage-asset';
import { Route, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
 
@Component({
  selector: 'app-manage-asset',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterModule,NgxPaginationModule],
  templateUrl: './manage-asset.component.html',
  styleUrls: ['./manage-asset.component.css']
})
export class ManageAssetComponent implements OnInit {
  assets: Asset[] = [];
  originalAssets: Asset[] = [];
  searchText: string = '';
  selectedAsset: Asset | null = null;
  page: number = 1;
  itemsPerPage: number = 5;

  constructor(private assetService: ManageAssetService, private router : Router) {}

  ngOnInit(): void {
    this.loadAssets();
  }

  loadAssets() {
    // Example: fetching from service
    this.assetService.getAssets().subscribe((data) => {
      this.assets = data;
      this.originalAssets = [...data]; // Assign random status ID
      });
    }
  
  getRandomStatusId(): number {
    return Math.floor(Math.random() * 5) + 1;
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
  
  newAssestRoute():void {
    this.router.navigate(['/newAsset']);
  }
  

  deleteAsset(asset: Asset): void {
    Swal.fire({
      title: `Delete "${asset.title}"?`,
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.assetService.deleteAsset(asset.assetId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Asset has been deleted.', 'success');
            this.loadAssets(); // Reload the list
          },
          error: (err) => {
            console.error('Error deleting asset', err);
            Swal.fire('Error!', 'Failed to delete asset.', 'error');
          }
        });
      }
    });
  }
  

  // Edit asset (this is just logging for now)
  editAsset(asset: Asset): void {
    console.log('Editing asset', asset);
  }
  }

  