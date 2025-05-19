import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserView } from '../../modals/user';
import { Asset } from '../../modals/manage-asset';
import { ManageRequest } from '../../modals/manage-requests';
import { UserService } from '../../services/user.service';
import { ManageAssetService } from '../../services/asset.service';
import { RequestServices } from '../../services/requests.service';
import { AuctionService } from '../../services/auction.service';
import { LegendPosition, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { Subscription } from 'rxjs/internal/Subscription';
import { interval } from 'rxjs/internal/observable/interval';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  requestList: ManageRequest[] = [];
  users: UserView[] = [];
  assets: Asset[] = [];
  allAuctions: any[] = [];
  private auctionCycleSub: Subscription | null = null;
  
chartData = [
  { name: 'Active', value: 120 },
  { name: 'Pending', value: 80 },
  { name: 'Closed', value: 60 },
  { name: 'Completed', value: 40 }
];

  statuses = [
    { statusId: 1, statusName: 'Pending' },
    { statusId: 2, statusName: 'Active' },
    { statusId: 3, statusName: 'Closed' },
    { statusId: 4, statusName: 'Completed' }
  ];

  colorScheme = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#7C4DFF', '#00C853', '#FF5252', '#3E2723'] 
  };
  // legendPos: LegendPosition = 'left';
    // legendPosition: LegendPosition = LegendPosition.Left;
  constructor(
    private userService: UserService,
    private requestService: RequestServices,
    private assetService: ManageAssetService,
    private auctionService: AuctionService,
    private router: Router
    
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadAssets();
    this.loadAllRequests();
    this.loadAuctions();
    console.log('Prepared chart data:', this.chartData);

  }

  loadUsers(): void {
    this.userService.getAllUser().subscribe(data => this.users = data);
  }

  loadAssets(): void {
    this.assetService.getAssets().subscribe(data => this.assets = data);
  }

  loadAllRequests(): void { 
    this.requestService.getAllRequests().subscribe({
      next: data => this.requestList = data,
      error: err => console.error('Error fetching requests', err)
    });
  }
  loadAuctions(): void {
  this.auctionService.getAllAuctions().subscribe(res => {
    this.allAuctions = res || [];

    if (this.allAuctions.length > 0) {
      this.generateChartData();
    }
  });
}

generateChartData(): void {
  const statusCountMap: { [key: string]: number } = {};

  this.allAuctions.forEach(auction => {
    const statusName = this.getStatusName(auction.statusId);

    if (statusCountMap[statusName]) {
      statusCountMap[statusName]++;
    } else {
      statusCountMap[statusName] = 1;
    }
  });

  this.chartData = Object.entries(statusCountMap).map(([status, count]) => ({
    name: status,
    value: count
  }));
}

  ngOnDestroy(): void {
    if (this.auctionCycleSub) {
      this.auctionCycleSub.unsubscribe();
    }
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
      case 2: return 'Active';
      case 3: return 'Closed';
      case 4: return 'Completed';
      default: return 'Unknown';
    }
  }

  goToUsers() {
    this.router.navigate(['/users']);
  }

  goToAssets() {
    this.router.navigate(['/assets']);
  }

  goToRequests() {
    this.router.navigate(['/requests']);
  }
}
