import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserView } from '../../modals/user';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { Asset } from '../../modals/manage-asset';
import { ManageAssetService } from '../../services/asset.service';
import { ManageRequest } from '../../modals/manage-requests';
import { RequestServices } from '../../services/requests.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
   requestList: ManageRequest[] = [];
   users: UserView[] = [];
   assets: Asset[] = [];
   
   constructor(private userService: UserService, private requestService: RequestServices, private assetService: ManageAssetService,private router: Router,) { }
   
     ngOnInit(): void {
       this.loadUsers();
       this. loadAssets();
       this.loadAllRequest();
      //  this.loadRoles();
      //  this.loadStatuses();
     }

   loadUsers(): void {
    this.userService.getAllUser().subscribe(data => {
      this.users = data
      
    });
  }
  loadAssets() {
    this.assetService.getAssets().subscribe((data) => {
      this.assets = data;
      });
  }
  loadAllRequest() {
    this.requestService.getAllRequests().subscribe({
        next: data => this.requestList = data,
        error: err => console.error('Error fetching requests', err)
    });
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
  
  goToUsers() {
    this.router.navigate(['/users']);
  }
  goToAssest() {
    this.router.navigate(['/assests']);
  }goToRequest() {
    this.router.navigate(['/requets']);
  }
  // Stat card data (can be made dynamic later)
  totalRevenue = '250,000 BHD';
  totalAuctions = 12540;
  thisMonthRevenue = '25,000 BHD';

  // Recent activities
  recentActivities = [
    { message: 'Auction "Rolex Watch" created.', type: 'purple' },
    { message: 'Payment of 3,000 BHD received.', type: 'green' },
    { message: 'Auction "Land in Manama" completed.', type: 'blue' },
  ];

  // Top categories (static list for now)
  topCategories = ['Electronics', 'Cars', 'Watches', 'Real Estate'];

  // Auction highlights (can be fetched from an API later)
  auctionHighlights = [
    { name: 'Luxury Villa', status: 'Active', bids: 54, revenue: '85,000 BHD' },
    { name: 'Vintage Car', status: 'Ended', bids: 39, revenue: '40,000 BHD' },
    { name: 'Smartphone Bundle', status: 'Upcoming', bids: '-', revenue: '-' },
  ];
}
