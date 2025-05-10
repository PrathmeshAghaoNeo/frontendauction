import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ManageAssetService } from '../../services/asset.service';
import { Asset } from '../../modals/manage-asset';
import { Route, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { environment } from "../../constants/enviroments";
 
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
  environment = environment;
  
  constructor(private assetService: ManageAssetService, private router : Router , private location: Location) {}


  statusOptions = [
    { id: 1, name: 'Draft' },
    { id: 2, name: 'Published' },
    { id: 3, name: 'Auctioned' },
    { id: 4, name: 'Archived' },
    { id: 5, name: 'Pending' },
    { id: 6, name: 'Approved' },
    { id: 7, name: 'Payment' },
    { id: 8, name: 'Registration' },
    { id: 9, name: 'Transferred' },
    { id: 10, name: 'Closed' },
  ];
  
  statuses = [ 
    { statusId: 1, statusName: 'Pending' },
    { statusId: 2, statusName: 'Active' },
    { statusId: 3, statusName: 'Closed' },
    { statusId: 4, statusName: 'Completed' }
  ];
  
  
  
  ngOnInit(): void {
    this.loadAssets();
  }
  
  goBack1(): void {
    this.router.navigate(['/assets']);  
  }

  loadAssets() {
    // Example: fetching from service
    this.assetService.getAssets().subscribe((data) => {
      this.assets = data;
      this.originalAssets = [...data]; // Assign random status ID

      console.log('Assets:', this.assets); // Debugging log to see fetched data
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
  
  EditAssestRoute(assetId: number): void {
    if (assetId && !isNaN(assetId)) {
      this.router.navigate(['/editAsset', assetId]);
    } else {
      console.error('Invalid assetId:', assetId);
      // Optionally show error to user
      Swal.fire('Error', 'Invalid asset ID', 'error');
    }
  }

  // auctionStatuses = [
  //   { statusId: 1, statusName: 'Drafted' },
  //   { statusId: 2, statusName: 'Published' },
  //   { statusId: 3, statusName: 'Ongoing' },
  //   { statusId: 4, statusName: 'Closed' },
  //   { statusId: 5, statusName: 'Archived' },
  // ];
  
  // getAuctionStatus(auctionStatusId: number): string {
  //   console.log('Auction Status ID:', auctionStatusId);
  //   return this.statusOptions.find(s => s.id === auctionStatusId)?.name || 'Unknown';
  // }
  
  getAuctionStatus(auctionStatusId: number): string {
    if (auctionStatusId === undefined || auctionStatusId === null) {
      return 'Unknown'; // or some default status
    }
    return this.statuses.find(s => s.statusId === auctionStatusId)?.statusName || 'Unknown';
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

  