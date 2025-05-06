import { Component, OnInit } from '@angular/core';
import { EditRequests } from '../../modals/edit.requests';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestServices } from '../../services/requests.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { UserView } from '../../modals/user';
import { Asset } from '../../modals/manage-asset';
import { UserService } from '../../services/user.service';
import { ManageAssetService } from '../../services/asset.service';


@Component({
  selector: 'app-edit-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-requests.component.html',
  styleUrl: './edit-requests.component.css'
})
export class EditRequestsComponent implements OnInit {
  requestId!: number;
  requestData: EditRequests = {} as EditRequests;
  isViewMode: boolean = false;
  users: UserView[] = [];
  assets: Asset[] = [];
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestServices,
    private userService: UserService,
    private assetService: ManageAssetService,
    private location: Location
  ) {}
 
  ngOnInit(): void {
    // Load users and assets
    this.loadUsers();
    this.loadAssets();

    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
 
    // Check if it's view-only mode
    const url = this.router.url;
    if (url.includes('view')) {
      this.isViewMode = true;
    }
 
    if (this.requestId === 0) {
      this.requestData = {} as EditRequests;
      // Set default values if creating a new request
      this.requestData.requestStatusId = 1; // Default to 'Pending'
      this.requestData.requestDateTime = new Date().toISOString();
    } else {
      this.requestService.getRequestById(this.requestId).subscribe({
        next: (data) => {
          this.requestData = data;
          // Additional data loading if needed
        },
        error: (err) => console.error('Error loading request:', err),
      });
    }
  }

  loadUsers(): void {
    this.userService.getAllUser().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadAssets(): void {
    this.assetService.getAssets().subscribe({
      next: (data) => {
        this.assets = data;
      },
      error: (err) => console.error('Error loading assets:', err)
    });
  }

  onUserChange(event: any): void {
    const userId = event.target.value;
    const selectedUser = this.users.find(user => user.userId == userId);
    
    if (selectedUser) {
      // Auto-fill user details
      this.requestData.username = selectedUser.name;
      this.requestData.email = selectedUser.email || '';
      this.requestData.mobileNumber = selectedUser.mobileNumber || '';
    }
  }

  getAssetName(assetId: number): string {
    const asset = this.assets.find(a => a.assetId === assetId);
    // Check for both title and categoryName properties to ensure compatibility
    return asset ? (asset.title || asset.categoryName || 'Unknown Asset') : 'Unknown Asset';
  }
 
  updateRequest(): void {
    if (this.isViewMode) return; // No update allowed in view mode
 
    if (this.requestId === 0) {
      this.requestService.createRequest(this.requestData).subscribe({
        next: () => {
          alert('New Request Created!');
          this.router.navigate(['/requests']); 
        },
        error: (err) => console.error('Error creating request:', err),
      });
    } else {
      this.requestService.updateRequest(this.requestId, this.requestData).subscribe({
        next: () => {
          alert('Request updated successfully!');
          this.router.navigate(['/requests']);
        },
        error: (err) => console.error('Error updating request:', err),
      });
    }
  }

  goBack(): void {
    this.location.back(); // This takes the user back to the previous page
  }
 
  getTypeName(typeId: number): string {
    switch (typeId) {
      case 1: return 'Transfer of Ownership';
      case 2: return 'Inquiry';
      case 3: return 'Request for Viewing';
      case 4: return 'Offer';
      default: return 'Unknown';
    }
  }

  getStatusName(statusId: number): string {
    switch (statusId) {
      case 1: return 'Pending';
      case 2: return 'Done';
      case 3: return 'Approved';
      case 4: return 'Rejected';
      default: return 'Unknown';
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}